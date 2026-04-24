<?php

namespace App\Jobs;

use App\Models\Question;
use App\Services\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Generates a step-by-step AI explanation for a single question.
 * Result cached for 30 days under key "ai_explanation_{question_id}".
 * Once generated it is permanent (questions don't change), so long TTL is safe.
 */
class GenerateAIExplanationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly int  $questionId,
        public readonly ?int $userSelectedOptionId = null
    ) {
        $this->onQueue('ai');
    }

    public function handle(AIService $aiService): void
    {
        $cacheKey = "ai_explanation_{$this->questionId}";

        if (Cache::has($cacheKey)) {
            return;
        }

        $question = Question::with(['options', 'subject', 'chapter', 'topic'])
            ->find($this->questionId);

        if (!$question) {
            Log::warning('GenerateAIExplanationJob: question not found', ['id' => $this->questionId]);
            return;
        }

        try {
            $payload = $aiService->generateExplanation($question, $this->userSelectedOptionId);
            Cache::put($cacheKey, $payload, now()->addDays(30));
        } catch (\Throwable $e) {
            Log::error('GenerateAIExplanationJob failed', [
                'question_id' => $this->questionId,
                'error'       => $e->getMessage(),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('GenerateAIExplanationJob permanently failed', [
            'question_id' => $this->questionId,
            'error'       => $exception->getMessage(),
        ]);
    }
}
