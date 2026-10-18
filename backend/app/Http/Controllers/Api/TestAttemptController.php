<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendTestResultEmailJob;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Services\AttemptScorer;
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

        $result = AttemptScorer::upsertResponses($attempt, TestAnswerKey::for($test), $responses);

        return response()->json([
            'message'       => 'Responses saved',
            'saved'         => $result['saved'],
            'rejected'      => $result['rejected'],
            'remaining_sec' => $attempt->remainingSeconds($test->duration_sec),
        ]);
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

        // While ongoing, never ship correct answers or explanations.
        $data['test'] = $attempt->status === 'completed'
            ? TestPayload::withAnswers($test)
            : TestPayload::student($test);

        return $this->json($data);
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
