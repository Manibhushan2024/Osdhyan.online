<?php

namespace App\Services;

use App\Models\TestAttempt;
use Illuminate\Support\Collection;

/**
 * A student's attempt history per test, so lists can show every attempt —
 * not only the latest one.
 */
class AttemptHistory
{
    /**
     * For each test id: latest attempt (any status), the last COMPLETED attempt
     * and how many attempts were completed. One query for the whole list.
     *
     * @param  iterable<int>  $testIds
     * @return Collection<int, array{latest_id:int, latest_status:string, last_completed_id:?int, completed_count:int}>
     */
    public static function forTests(int $userId, iterable $testIds): Collection
    {
        $ids = collect($testIds)->map(fn ($id) => (int) $id)->unique()->values();
        if ($ids->isEmpty()) {
            return collect();
        }

        return TestAttempt::where('user_id', $userId)
            ->whereIn('test_id', $ids)
            ->orderByDesc('id')
            ->get(['id', 'test_id', 'status'])
            ->groupBy('test_id')
            ->map(function (Collection $attempts) {
                $latest = $attempts->first();
                $completed = $attempts->where('status', 'completed');

                return [
                    'latest_id'         => (int) $latest->id,
                    'latest_status'     => $latest->status === 'ongoing' ? 'in_progress' : (string) $latest->status,
                    'last_completed_id' => $completed->first()?->id,
                    'completed_count'   => $completed->count(),
                ];
            });
    }

    /** Fields every test row carries (defaults for guests / never attempted). */
    public static function apply(object $test, ?array $summary): void
    {
        $test->attempt_id = $summary['latest_id'] ?? null;
        $test->attempt_status = $summary['latest_status'] ?? 'none';
        $test->last_completed_attempt_id = $summary['last_completed_id'] ?? null;
        $test->attempts_count = $summary['completed_count'] ?? 0;
    }

    /**
     * Light list of one user's attempts at one test, oldest = attempt 1.
     *
     * @return array<int, array{id:int, number:int, status:string, total_score:mixed, started_at:?string, completed_at:?string}>
     */
    public static function siblings(int $userId, int $testId): array
    {
        return TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->orderBy('id')
            ->get(['id', 'status', 'total_score', 'started_at', 'completed_at'])
            ->values()
            ->map(fn (TestAttempt $a, int $i) => [
                'id'           => (int) $a->id,
                'number'       => $i + 1,
                'status'       => $a->status === 'ongoing' ? 'in_progress' : (string) $a->status,
                'total_score'  => $a->total_score,
                'started_at'   => $a->started_at?->toISOString(),
                'completed_at' => $a->completed_at?->toISOString(),
            ])
            ->all();
    }
}
