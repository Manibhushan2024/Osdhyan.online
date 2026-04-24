<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Generates AI-powered selection probability + action plan for a user.
 * Result cached for 6 hours under key "ai_insights_{user_id}".
 * Dispatch from AnalyticsController and poll the cache key from the frontend.
 */
class GenerateAIInsightsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries   = 2;
    public int $backoff = 30;

    public function __construct(
        public readonly int   $userId,
        public readonly array $stats,
        public readonly array $weakAreaNames,
        public readonly array $strengthNames
    ) {
        $this->onQueue('ai');
    }

    public function handle(AIService $aiService): void
    {
        $cacheKey = "ai_insights_{$this->userId}";

        $weak    = collect($this->weakAreaNames)->map(fn ($n) => (object) ['topic_name' => $n]);
        $strong  = collect($this->strengthNames)->map(fn ($n) => (object) ['topic_name' => $n]);

        try {
            $result = $aiService->predictSelectionProbability($this->stats, $weak, $strong);
            Cache::put($cacheKey, $result, now()->addHours(6));
        } catch (\Throwable $e) {
            Log::error('GenerateAIInsightsJob failed', [
                'user_id' => $this->userId,
                'error'   => $e->getMessage(),
            ]);

            Cache::put($cacheKey, [
                'probability' => null,
                'analysis'    => 'AI analysis could not be generated right now. Please try again later.',
                'action_plan' => [],
                'error'       => true,
            ], now()->addMinutes(15));
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('GenerateAIInsightsJob permanently failed', [
            'user_id' => $this->userId,
            'error'   => $exception->getMessage(),
        ]);
    }
}
