<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendTestResultEmailJob;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Services\AttemptHistory;
use App\Services\AttemptScorer;
use App\Services\SectionState;
use App\Services\TestAnswerKey;
use App\Services\TestPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TestAttemptController extends Controller
{
    private const MAX_ONGOING = 50;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Normalise the legacy 'ongoing' status and attach the server-side clock
     * so clients derive the timer from the server, not from their own start.
     */
    protected function presentAttempt(TestAttempt $attempt, ?Test $test = null): array
    {
        $test ??= $attempt->relationLoaded('test') ? $attempt->test : null;
        $data = $attempt->toArray();

        if ($attempt->isOngoing()) {
            $duration = (int) ($test?->duration_sec ?: Test::whereKey($attempt->test_id)->value('duration_sec') ?: 3600);
            $data['status']        = 'in_progress';
            $data['server_time']   = now()->toISOString();
            $data['deadline_at']   = $attempt->deadline($duration)->toISOString();
            $data['remaining_sec'] = $attempt->remainingSeconds($duration);
            if ($test && SectionState::sectionsOf($test)) {
                $data['section_state'] = SectionState::compute($attempt, $test);
                // Every section locked (last one by its timer) → the attempt is over.
                if ($data['section_state']['all_locked']) {
                    AttemptScorer::finalize($attempt, $test);
                    $attempt->refresh();
                    $data = array_merge($data, $attempt->toArray());
                    unset($data['server_time'], $data['deadline_at'], $data['remaining_sec']);
                }
            }
        }

        return $data;
    }

    protected function json($data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status, [], JSON_UNESCAPED_UNICODE);
    }

    protected function findOwnedAttempt($attemptId): TestAttempt|JsonResponse
    {
        if (!is_numeric($attemptId)) {
            return response()->json(['message' => 'Invalid attempt ID'], 400);
        }

        $attempt = TestAttempt::find($attemptId);
        if (!$attempt) {
            return response()->json(['message' => 'Attempt not found.'], 404);
        }
        if ((int) $attempt->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Unauthorized attempt access.'], 403);
        }

        return $attempt;
    }

    protected function isAvailableToStudents(Test $test): bool
    {
        return $test->status === null || in_array($test->status, ['published', 'active'], true);
    }

    protected function validateResponsesPayload(Request $request, bool $required): array
    {
        return $request->validate([
            'responses'                        => ($required ? 'required' : 'nullable') . '|array|max:500',
            'responses.*.question_id'          => 'required|integer',
            'responses.*.selected_option_id'   => 'nullable|integer',
            'responses.*.is_marked_for_review' => 'nullable|boolean',
            'responses.*.time_taken_sec'       => 'nullable|integer|min:0',
        ])['responses'] ?? [];
    }

    // ─── Start / Resume ───────────────────────────────────────────────────────

    public function startAttempt(Test $test)
    {
        $user = Auth::user();

        if (!$this->isAvailableToStudents($test) && !$user->isAdminUser()) {
            return response()->json(['message' => 'This test is not available yet.'], 403);
        }

        // Paid test series: a test that lives only in paid series (and is not
        // itself free) needs an active purchase. Admins can always preview.
        if (!$user->isAdminUser()) {
            $lockedBy = \App\Services\Payments\UserAccess::lockingSeriesId($test, $user);
            if ($lockedBy !== null) {
                return response()->json([
                    'message'        => 'Purchase the test series to attempt this test.',
                    'code'           => 'PAYMENT_REQUIRED',
                    'test_series_id' => $lockedBy,
                ], 403);
            }
        }

        $ongoing = TestAttempt::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->whereIn('status', ['ongoing', 'in_progress'])
            ->latest('id')
            ->first();

        if ($ongoing) {
            if ($ongoing->acceptsAnswers($test->duration_sec)) {
                $ongoing->load('responses:id,test_attempt_id,question_id,selected_option_id,is_marked_for_review,time_taken_sec');

                return $this->json([
                    'message'   => 'Resuming existing attempt',
                    'attempt'   => $this->presentAttempt($ongoing, $test),
                    'is_resume' => true,
                ]);
            }

            // Time ran out while the student was away — score what was saved.
            AttemptScorer::finalize($ongoing, $test);
        }

        if ((int) $test->max_attempts > 0) {
            $done = TestAttempt::where('user_id', $user->id)->where('test_id', $test->id)->count();
            if ($done >= (int) $test->max_attempts) {
                return response()->json([
                    'message' => "You have used all {$test->max_attempts} attempt(s) for this test.",
                ], 403);
            }
        }

        $ongoingCount = TestAttempt::where('user_id', $user->id)
            ->whereIn('status', ['ongoing', 'in_progress'])
            ->count();

        if ($ongoingCount >= self::MAX_ONGOING) {
            return response()->json([
                'message' => 'You can only have ' . self::MAX_ONGOING . ' active tests at a time. Please complete your existing attempts.',
            ], 403);
        }

        $attempt = TestAttempt::create([
            'user_id'    => $user->id,
            'test_id'    => $test->id,
            'started_at' => now(),
            'status'     => 'ongoing',
        ]);
        $attempt->setRelation('responses', collect());

        return $this->json([
            'message' => 'Attempt started successfully',
            'attempt' => $this->presentAttempt($attempt, $test),
        ]);
    }

    // ─── Save answers ─────────────────────────────────────────────────────────

    /** Legacy single-answer endpoint — same path as sync with one item. */
    public function saveResponse(Request $request, $attemptId)
    {
        $request->validate([
            'question_id'          => 'required|integer',
            'selected_option_id'   => 'nullable|integer',
            'is_marked_for_review' => 'nullable|boolean',
            'time_taken_sec'       => 'nullable|integer|min:0',
        ]);

        $request->merge(['responses' => [$request->only([
            'question_id', 'selected_option_id', 'is_marked_for_review', 'time_taken_sec',
        ])]]);

        $result = $this->syncResponses($request, $attemptId);
        if ($result->getStatusCode() === 200 && ($result->getData(true)['saved'] ?? 0) === 0) {
            return response()->json(['message' => 'Invalid question or option for this test.'], 422);
        }

        return $result;
    }

    public function syncResponses(Request $request, $attemptId)
    {
        $attempt = $this->findOwnedAttempt($attemptId);
        if ($attempt instanceof JsonResponse) {
            return $attempt;
        }

        $responses = $this->validateResponsesPayload($request, true);
        $test = $attempt->test;

        if (!$attempt->acceptsAnswers($test->duration_sec)) {
            return response()->json([
                'message' => $attempt->isOngoing() ? 'Time is over for this test.' : 'This attempt has already been submitted.',
                'code'    => 'ATTEMPT_CLOSED',
                'status'  => $attempt->status,
            ], 409);
        }

        $outside = 0;
        $writable = SectionState::writableQuestionIds($attempt, $test);
        if ($writable !== null) {
            $allowed = array_flip($writable);
            $before = count($responses);
            $responses = array_values(array_filter($responses, fn ($r) => isset($allowed[(int) ($r['question_id'] ?? 0)])));
            $outside = $before - count($responses);
        }

        $result = $responses ? AttemptScorer::upsertResponses($attempt, TestAnswerKey::for($test), $responses) : ['saved' => 0, 'rejected' => 0];

        $out = [
            'message'       => 'Responses saved',
            'saved'         => $result['saved'],
            'rejected'      => $result['rejected'] + $outside,
            'remaining_sec' => $attempt->remainingSeconds($test->duration_sec),
        ];
        if ($writable !== null) {
            $out['locked_rejected'] = $outside; // answers for locked / not-yet-open sections
            $out['section_state'] = SectionState::compute($attempt, $test);
        }

        return response()->json($out);
    }

    // ─── Show (in progress or result) ─────────────────────────────────────────

    public function show($attemptId)
    {
        $attempt = $this->findOwnedAttempt($attemptId);
        if ($attempt instanceof JsonResponse) {
            return $attempt;
        }

        $test = $attempt->test;

        if ($attempt->isOngoing() && !$attempt->acceptsAnswers($test->duration_sec)) {
            AttemptScorer::finalize($attempt, $test);
            $attempt->refresh();
        }

        $attempt->load('responses');
        $data = $this->presentAttempt($attempt, $test);

        // Which attempt this is, and the others at the same test, so any
        // attempt can be opened and compared — not only the latest.
        $data['attempts'] = AttemptHistory::siblings((int) $attempt->user_id, (int) $attempt->test_id);
        $data['attempt_number'] = collect($data['attempts'])->firstWhere('id', (int) $attempt->id)['number'] ?? null;

        // While ongoing, never ship correct answers or explanations.
        $data['test'] = $attempt->status === 'completed'
            ? TestPayload::withAnswers($test)
            : TestPayload::student($test);

        return $this->json($data);
    }

    // ─── Sections ─────────────────────────────────────────────────────────────

    /**
     * POST /attempts/{id}/sections/{key}/lock — "Submit section": saves the
     * answers sent with it, locks the section and opens the next one. Locking
     * the last section submits the whole attempt.
     */
    public function lockSection(Request $request, $attemptId, string $key)
    {
        $attempt = $this->findOwnedAttempt($attemptId);
        if ($attempt instanceof JsonResponse) {
            return $attempt;
        }
        $test = $attempt->test;

        if (!SectionState::isSequential($test)) {
            return response()->json(['message' => 'This test has no locked sections.', 'code' => 'NO_SECTIONS'], 422);
        }
        if (!$attempt->acceptsAnswers($test->duration_sec)) {
            return response()->json(['message' => 'Time is over for this test.', 'code' => 'ATTEMPT_CLOSED', 'status' => $attempt->status], 409);
        }

        $responses = $this->validateResponsesPayload($request, false);
        $writable = SectionState::writableQuestionIds($attempt, $test) ?? [];
        $allowed = array_flip($writable);
        $responses = array_values(array_filter($responses, fn ($r) => isset($allowed[(int) ($r['question_id'] ?? 0)])));
        if ($responses) {
            AttemptScorer::upsertResponses($attempt, TestAnswerKey::for($test), $responses);
        }

        $state = SectionState::lock($attempt, $test, $key);
        if ($state === null) {
            return response()->json([
                'message'       => 'Only the active section can be submitted.',
                'code'          => 'SECTION_NOT_ACTIVE',
                'section_state' => SectionState::compute($attempt, $test),
            ], 409);
        }

        if ($state['all_locked']) {
            AttemptScorer::finalize($attempt, $test);
            $attempt->refresh()->load('responses');
            $data = $this->presentAttempt($attempt, $test);
            $data['test'] = TestPayload::withAnswers($test);

            return $this->json(['completed' => true, 'section_state' => $state, 'attempt' => $data]);
        }

        return $this->json([
            'completed'     => false,
            'section_state' => $state,
            'remaining_sec' => $attempt->remainingSeconds($test->duration_sec),
        ]);
    }

    // ─── Complete ─────────────────────────────────────────────────────────────

    public function completeAttempt(Request $request, $attemptId)
    {
        $attempt = $this->findOwnedAttempt($attemptId);
        if ($attempt instanceof JsonResponse) {
            return $attempt;
        }

        $finalResponses = $this->validateResponsesPayload($request, false);
        $test = $attempt->test;

        $writable = SectionState::writableQuestionIds($attempt, $test);
        if ($writable !== null) {
            $allowed = array_flip($writable);
            $finalResponses = array_values(array_filter($finalResponses, fn ($r) => isset($allowed[(int) ($r['question_id'] ?? 0)])));
        }

        AttemptScorer::finalize($attempt, $test, $finalResponses);

        $attempt->refresh()->load('responses');
        $data = $this->presentAttempt($attempt, $test);
        $data['test'] = TestPayload::withAnswers($test);

        return $this->json($data);
    }

    // ─── Latest Attempt ───────────────────────────────────────────────────────

    public function getLatestAttempt($testId)
    {
        $attempt = TestAttempt::where('user_id', Auth::id())
            ->where('test_id', $testId)
            ->latest('id')
            ->first();

        if (!$attempt) {
            return response()->json(null);
        }

        $attempt->load('test');

        return $this->json($this->presentAttempt($attempt, $attempt->test));
    }

    // ─── My Attempts (all tests) ──────────────────────────────────────────────

    /**
     * GET /attempts — every attempt by the signed-in student, newest first,
     * numbered per test (attempt 1 = the first time that test was taken).
     * Filters: test_id, status (completed|in_progress). Paginated (per_page ≤ 100).
     */
    public function mine(Request $request)
    {
        $request->validate([
            'test_id'  => 'nullable|integer',
            'status'   => 'nullable|in:completed,in_progress',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);
        $userId = (int) Auth::id();

        $query = TestAttempt::query()
            ->where('test_attempts.user_id', $userId)
            ->join('tests', 'tests.id', '=', 'test_attempts.test_id')
            ->select([
                'test_attempts.id', 'test_attempts.test_id', 'test_attempts.status',
                'test_attempts.total_score', 'test_attempts.time_taken_sec',
                'test_attempts.started_at', 'test_attempts.completed_at', 'test_attempts.metadata',
                'tests.name_en as test_name_en', 'tests.name_hi as test_name_hi',
                'tests.total_marks as test_total_marks', 'tests.duration_sec as test_duration_sec',
            ])
            // Per-test attempt number (1 = first attempt at that test).
            ->selectRaw('ROW_NUMBER() OVER (PARTITION BY test_attempts.test_id ORDER BY test_attempts.id) AS attempt_number')
            ->selectRaw('COUNT(*) OVER (PARTITION BY test_attempts.test_id) AS attempts_at_test');

        if ($request->filled('test_id')) {
            $query->where('test_attempts.test_id', (int) $request->input('test_id'));
        }

        // Filter on the numbered rows so numbers stay correct.
        $outer = DB::query()->fromSub($query, 'a')->orderByDesc('a.id');
        if ($request->input('status') === 'completed') {
            $outer->where('a.status', 'completed');
        } elseif ($request->input('status') === 'in_progress') {
            $outer->whereIn('a.status', ['ongoing', 'in_progress']);
        }

        $page = $outer->paginate((int) $request->input('per_page', 20));
        $page->getCollection()->transform(function ($row) {
            $meta = is_string($row->metadata) ? json_decode($row->metadata, true) : (array) $row->metadata;
            return [
                'id'               => (int) $row->id,
                'test_id'          => (int) $row->test_id,
                'test_name_en'     => $row->test_name_en,
                'test_name_hi'     => $row->test_name_hi,
                'status'           => $row->status === 'ongoing' ? 'in_progress' : $row->status,
                'attempt_number'   => (int) $row->attempt_number,
                'attempts_at_test' => (int) $row->attempts_at_test,
                'total_score'      => $row->total_score !== null ? (float) $row->total_score : null,
                'total_marks'      => $row->test_total_marks !== null ? (float) $row->test_total_marks : null,
                'correct'          => $meta['correct'] ?? $meta['correct_count'] ?? null,
                'incorrect'        => $meta['incorrect'] ?? $meta['incorrect_count'] ?? null,
                'time_taken_sec'   => $row->time_taken_sec !== null ? (int) $row->time_taken_sec : null,
                'started_at'       => $row->started_at ? \Illuminate\Support\Carbon::parse($row->started_at)->toISOString() : null,
                'completed_at'     => $row->completed_at ? \Illuminate\Support\Carbon::parse($row->completed_at)->toISOString() : null,
            ];
        });

        return $this->json($page);
    }

    // ─── List Attempts ────────────────────────────────────────────────────────

    public function index(Test $test)
    {
        $attempts = TestAttempt::where('user_id', Auth::id())
            ->where('test_id', $test->id)
            ->latest('id')
            ->get();

        return $this->json($attempts->map(fn ($a) => $this->presentAttempt($a, $test)));
    }
}
