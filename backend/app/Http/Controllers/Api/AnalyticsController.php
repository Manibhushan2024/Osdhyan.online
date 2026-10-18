<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAIExplanationJob;
use App\Jobs\GenerateAIInsightsJob;
use App\Models\Question;
use App\Models\TestAttempt;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    public function __construct(protected AIService $aiService)
    {
    }

    // ─── Overview ─────────────────────────────────────────────────────────────

    public function getOverview(Request $request)
    {
        $userId = $request->user()->id;

        // Every dashboard page asks for this; cache per user and bust it when
        // the student submits a test (see TestAttemptController::finalize).
        $payload = Cache::remember("analytics_overview_{$userId}", 300, fn () => $this->buildOverview($userId));

        // AI insights are cached separately so they can arrive after the job runs.
        $aiInsights = Cache::get("ai_insights_{$userId}");
        if (!$aiInsights && $payload['tests_completed'] >= 1 && $this->aiService->isConfigured()
            && Cache::add("ai_insights_pending_{$userId}", 1, 900)) {
            // Cache::add makes this dispatch at most once per 15 min per user
            // instead of on every dashboard view.
            $topicData = $this->getTopicData($userId);

            GenerateAIInsightsJob::dispatch(
                $userId,
                ['accuracy_percentage' => $payload['accuracy'], 'total_tests' => $payload['tests_completed']],
                $topicData['weaknesses']->pluck('topic_name')->toArray(),
                $topicData['strengths']->pluck('topic_name')->toArray()
            );
        }

        $payload['ai_insights']       = $aiInsights;
        $payload['ai_insights_ready'] = $aiInsights !== null;

        return response()->json($payload);
    }

    protected function buildOverview(int $userId): array
    {
        // Columns only — no responses eager-load (that pulled every answer
        // the student ever gave just to count them).
        $attempts = TestAttempt::with('test:id,name_en,total_marks')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->get(['id', 'test_id', 'total_score', 'time_taken_sec', 'metadata', 'completed_at']);

        $testsCompleted   = $attempts->count();
        $studyTimeSec     = (int) $attempts->sum('time_taken_sec');
        $accuracy         = round((float) $attempts->avg(fn ($a) => (float) data_get($a->metadata, 'accuracy', 0)), 2);
        $averageScore     = round((float) $attempts->avg('total_score'), 2);
        $responseCount    = (int) $attempts->sum(fn ($a) => (int) data_get($a->metadata, 'correct_count', 0) + (int) data_get($a->metadata, 'incorrect_count', 0));
        $avgTimePerQ      = $responseCount > 0 ? round($studyTimeSec / $responseCount, 2) : null;

        $recentActivity = $attempts->take(5)->map(fn (TestAttempt $a) => [
            'type'         => 'test',
            'title'        => $a->test?->name_en ?? 'Test',
            'score'        => $a->total_score,
            'total_marks'  => $a->test?->total_marks,
            'accuracy'     => data_get($a->metadata, 'accuracy'),
            'duration_sec' => $a->time_taken_sec,
            'activity_at'  => optional($a->completed_at)->toISOString(),
        ])->values();

        $scoreTrend = $attempts->take(7)->reverse()->values()->map(fn (TestAttempt $a) => [
            'date'  => optional($a->completed_at)->format('d M'),
            'score' => (float) data_get($a->metadata, 'accuracy', $a->total_score ?? 0),
        ]);

        $accuracyTrend = $scoreTrend->count() >= 2
            ? round((float) ($scoreTrend->last()['score'] - $scoreTrend->first()['score']), 2)
            : 0;

        $streakDays = $this->computeStudyStreak($attempts);

        return [
            'accuracy'          => $accuracy,
            'tests_completed'   => $testsCompleted,
            'study_time_sec'    => $studyTimeSec,
            'streak_days'       => $streakDays,
            'today_study_time_min' => round(
                (float) $attempts
                    ->filter(fn (TestAttempt $a) => optional($a->completed_at)->isToday())
                    ->sum('time_taken_sec') / 60,
                2
            ),
            'recent_activity'   => $recentActivity->all(),
            'score_trend'       => $scoreTrend->all(),
            'overall_accuracy'  => $accuracy,
            'stats' => [
                'total_tests'              => $testsCompleted,
                'average_score'            => $averageScore,
                'total_time_spent_min'     => round($studyTimeSec / 60, 2),
                'study_streak'             => $streakDays,
                'accuracy_percentage'      => $accuracy,
                'avg_time_per_question_sec'=> $avgTimePerQ,
                'syllabus_covered_percentage' => null,
                'accuracy_trend'           => $accuracyTrend,
            ],
            // Synchronous light suggestion (no AI call)
            'ai_suggestion'      => $this->buildSuggestion($accuracy),
            'ai_time_suggestion' => $avgTimePerQ
                ? "Average response time is {$avgTimePerQ}s per question. Keep difficult questions under strict review to improve speed."
                : null,
        ];
    }

    // ─── Topic Performance ────────────────────────────────────────────────────

    public function getTopicWisePerformance(Request $request)
    {
        $data = $this->getTopicData($request->user()->id);

        return response()->json($data);
    }

    // ─── Question Explanation (async-first) ───────────────────────────────────

    public function getQuestionExplanation(Request $request, Question $question)
    {
        $user = $request->user();

        // Explanations reveal the answer: only after the student has
        // submitted a test containing this question.
        if (!$user->isAdminUser()) {
            $allowed = TestAttempt::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereIn('test_id', fn ($q) => $q->select('test_id')->from('question_test')->where('question_id', $question->id))
                ->exists();
            if (!$allowed) {
                return response()->json(['message' => 'Explanations are available after you submit the test.'], 403);
            }
        }

        $cacheKey = "ai_explanation_{$question->id}";
        $cached = Cache::get($cacheKey);

        if ($cached) {
            $decoded = is_string($cached) ? json_decode($cached, true) : $cached;
            return response()->json([
                'question_id' => $question->id,
                'explanation' => is_array($decoded) ? $decoded : ['step_by_step' => $cached],
                'from_cache'  => true,
            ]);
        }

        $generating = false;
        if ($this->aiService->isConfigured() && Cache::add("ai_explanation_pending_{$question->id}", 1, 600)) {
            GenerateAIExplanationJob::dispatch($question->id);
            $generating = true;
        }

        // Never block the request on an AI call: serve the stored explanation
        // (or the offline template) and let the job fill the cache.
        if ($question->explanation_en || $question->explanation_hi) {
            $explanation = ['step_by_step' => $question->explanation_en ?: $question->explanation_hi];
        } else {
            $question->load(['options', 'subject', 'chapter', 'topic']);
            $fallback = $this->aiService->offlineExplanation($question);
            $decoded = json_decode($fallback, true);
            $explanation = is_array($decoded) ? $decoded : ['step_by_step' => $fallback];
        }

        return response()->json([
            'question_id' => $question->id,
            'explanation' => $explanation,
            'from_cache'  => false,
            'generating'  => $generating,
        ]);
    }

    // ─── Assistant Chat (real-time, must be synchronous) ─────────────────────

    public function assistantChat(Request $request, TestAttempt $attempt)
    {
        if ((int) $attempt->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Unauthorized attempt access.'], 403);
        }

        $validated = $request->validate([
            'question_id'      => 'required|integer',
            'message'          => 'required|string|max:4000',
            'history'          => 'nullable|array',
            'history.*.role'   => 'required|string|in:user,assistant',
            'history.*.content'=> 'required|string',
        ]);

        $question = $attempt->test()
            ->firstOrFail()
            ->questions()
            ->with(['options', 'subject', 'chapter', 'topic'])
            ->findOrFail($validated['question_id']);

        $selectedOptionId = $attempt->responses()
            ->where('question_id', $question->id)
            ->value('selected_option_id');

        $reply = $this->aiService->chatForSolution(
            $question,
            $selectedOptionId,
            $validated['message'],
            $validated['history'] ?? []
        );

        return response()->json(['reply' => $reply]);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    protected function getTopicData(int $userId): array
    {
        $cacheKey = "topic_performance_{$userId}";

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($userId) {
            $attempts = TestAttempt::with([
                'responses.question.topic',
                'responses.question.subject',
                'responses.selectedOption',
            ])
                ->where('user_id', $userId)
                ->where('status', 'completed')
                ->get();

            $topicStats = [];

            foreach ($attempts as $attempt) {
                foreach ($attempt->responses as $response) {
                    if (!$response->selected_option_id || !$response->question) {
                        continue;
                    }

                    $topicName = $response->question->topic?->name_en
                        ?: $response->question->subject?->name_en
                        ?: 'General';

                    if (!isset($topicStats[$topicName])) {
                        $topicStats[$topicName] = ['correct' => 0, 'total' => 0];
                    }

                    $topicStats[$topicName]['total']++;

                    if ($response->selectedOption?->is_correct) {
                        $topicStats[$topicName]['correct']++;
                    }
                }
            }

            $data = collect($topicStats)->map(function (array $stat, string $topicName) {
                $accuracy = $stat['total'] > 0
                    ? round(($stat['correct'] / $stat['total']) * 100, 2)
                    : 0;

                return ['topic_name' => $topicName, 'accuracy_percent' => $accuracy, 'accuracy' => $accuracy];
            })->values();

            return [
                'data'       => $data,
                'strengths'  => $data->sortByDesc('accuracy')->take(5)->values(),
                'weaknesses' => $data->sortBy('accuracy')->take(5)->values(),
            ];
        });
    }

    protected function computeStudyStreak(Collection $attempts): int
    {
        $dates = $attempts
            ->map(fn (TestAttempt $a) => optional($a->completed_at)?->copy()?->startOfDay())
            ->filter()
            ->unique(fn ($d) => $d->format('Y-m-d'))
            ->sortDesc()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        $streak = 0;
        $cursor = now()->startOfDay();

        foreach ($dates as $date) {
            if ($date->equalTo($cursor)) {
                $streak++;
                $cursor = $cursor->subDay();
                continue;
            }

            if ($streak === 0 && $date->equalTo(now()->subDay()->startOfDay())) {
                $streak++;
                $cursor = $date->copy()->subDay();
                continue;
            }

            break;
        }

        return $streak;
    }

    protected function buildSuggestion(float $accuracy): ?string
    {
        if ($accuracy === 0.0) {
            return 'Complete your first few tests to unlock personalized performance guidance.';
        }

        if ($accuracy < 50) {
            return 'Your current accuracy is low. Focus on revision before adding more test volume.';
        }

        if ($accuracy < 75) {
            return 'You are in the improvement band. Review weak topics and convert marked questions into revision notes.';
        }

        return 'Accuracy is strong. Shift focus toward timed practice and consistency under exam pressure.';
    }
}
