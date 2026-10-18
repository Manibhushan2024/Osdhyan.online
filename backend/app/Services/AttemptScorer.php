<?php

namespace App\Services;

use App\Jobs\SendTestResultEmailJob;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Answer persistence and scoring for test attempts, shared by the API and
 * the scheduled `attempts:finalize-expired` command.
 */
class AttemptScorer
{
    /**
     * Validate a batch of answers against the cached answer key and upsert
     * them in one statement. Unknown questions/options are dropped instead of
     * costing two `exists` queries per answer.
     *
     * @return array{saved:int, rejected:int}
     */
    public static function upsertResponses(TestAttempt $attempt, array $key, array $responses): array
    {
        $now  = now();
        $rows = [];
        $rejected = 0;

        foreach ($responses as $resp) {
            $qid = (int) ($resp['question_id'] ?? 0);
            $oid = isset($resp['selected_option_id']) && $resp['selected_option_id'] !== '' && $resp['selected_option_id'] !== null
                ? (int) $resp['selected_option_id']
                : null;

            if (!isset($key[$qid]) || ($oid !== null && !isset($key[$qid]['options'][$oid]))) {
                $rejected++;
                continue;
            }

            // Last write wins within a batch.
            $rows[$qid] = [
                'test_attempt_id'      => $attempt->id,
                'question_id'          => $qid,
                'selected_option_id'   => $oid,
                'is_marked_for_review' => filter_var($resp['is_marked_for_review'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'time_taken_sec'       => max(0, min(86400, (int) ($resp['time_taken_sec'] ?? 0))),
                'created_at'           => $now,
                'updated_at'           => $now,
            ];
        }

        if ($rows) {
            DB::table('test_responses')->upsert(
                array_values($rows),
                ['test_attempt_id', 'question_id'],
                ['selected_option_id', 'is_marked_for_review', 'time_taken_sec', 'updated_at']
            );
        }

        return ['saved' => count($rows), 'rejected' => $rejected];
    }

    /**
     * Score and close an attempt. Idempotent and safe under concurrent calls:
     * the row lock means a double-submit scores once and both callers get
     * the same result.
     */
    public static function finalize(TestAttempt $attempt, Test $test, array $finalResponses = []): void
    {
        $key = TestAnswerKey::for($test);
        $completedNow = false;

        DB::transaction(static function () use ($attempt, $test, $key, $finalResponses, &$completedNow) {
            $locked = TestAttempt::whereKey($attempt->id)->lockForUpdate()->first();
            if (!$locked || !$locked->isOngoing()) {
                return;
            }

            if ($finalResponses && $locked->acceptsAnswers($test->duration_sec)) {
                self::upsertResponses($locked, $key, $finalResponses);
            }

            $responses = DB::table('test_responses')
                ->where('test_attempt_id', $locked->id)
                ->get(['id', 'question_id', 'selected_option_id']);

            $sectional = [];
            foreach ($key as $q) {
                $sectional[$q['subject']] ??= ['correct' => 0, 'incorrect' => 0, 'total' => 0, 'marks' => 0.0];
                $sectional[$q['subject']]['total']++;
            }

            $score = 0.0;
            $correct = 0;
            $incorrect = 0;
            $marksById = [];

            foreach ($responses as $r) {
                $q = $key[(int) $r->question_id] ?? null;
                if (!$q || !$r->selected_option_id) {
                    $marksById[$r->id] = 0;
                    continue;
                }

                $subject = $q['subject'];
                if ((int) $r->selected_option_id === $q['correct']) {
                    $score += $q['marks'];
                    $correct++;
                    $marksById[$r->id] = $q['marks'];
                    $sectional[$subject]['correct']++;
                    $sectional[$subject]['marks'] += $q['marks'];
                } else {
                    $score -= $q['negative'];
                    $incorrect++;
                    $marksById[$r->id] = -$q['negative'];
                    $sectional[$subject]['incorrect']++;
                    $sectional[$subject]['marks'] -= $q['negative'];
                }
            }

            // One UPDATE for all responses instead of one per answer.
            foreach (array_chunk($marksById, 500, true) as $chunk) {
                $cases = [];
                $bindings = [];
                foreach ($chunk as $id => $marks) {
                    $cases[] = 'WHEN ? THEN CAST(? AS DECIMAL(6,2))';
                    $bindings[] = $id;
                    $bindings[] = $marks;
                }
                $ids = array_keys($chunk);
                DB::update(
                    'UPDATE test_responses SET marks_obtained = CASE id ' . implode(' ', $cases) . ' END '
                    . 'WHERE id IN (' . implode(',', array_fill(0, count($ids), '?')) . ')',
                    [...$bindings, ...$ids]
                );
            }

            $attempted = $correct + $incorrect;
            $accuracy  = $attempted > 0 ? round($correct / $attempted * 100, 2) : 0;

            $startedAt = $locked->started_at ?? $locked->created_at;
            $deadline  = $locked->deadline($test->duration_sec);
            $endedAt   = now()->lt($deadline) ? now() : $deadline;
            $timeTaken = max(0, (int) $startedAt->diffInSeconds($endedAt));

            $locked->update([
                'completed_at'   => now(),
                'total_score'    => round($score, 2),
                'status'         => 'completed',
                'time_taken_sec' => $timeTaken,
                'metadata'       => [
                    'correct_count'     => $correct,
                    'incorrect_count'   => $incorrect,
                    'unattempted_count' => max(0, count($key) - $attempted),
                    'total_questions'   => count($key),
                    'sectional_stats'   => $sectional,
                    'accuracy'          => $accuracy,
                ],
            ]);

            // Atomic aggregate update — no read-modify-write race.
            DB::update(
                'UPDATE users SET
                    avg_accuracy = ROUND(CAST(((COALESCE(total_tests_attempted,0) * COALESCE(avg_accuracy,0)) + ?) / (COALESCE(total_tests_attempted,0) + 1) AS numeric), 2),
                    total_tests_attempted = COALESCE(total_tests_attempted,0) + 1,
                    total_study_time_prod_sec = COALESCE(total_study_time_prod_sec,0) + ?
                 WHERE id = ?',
                [$accuracy, $timeTaken, $locked->user_id]
            );

            $completedNow = true;
        });

        if ($completedNow) {
            Cache::forget("topic_performance_{$attempt->user_id}");
            Cache::forget("ai_insights_{$attempt->user_id}");
            Cache::forget("analytics_overview_{$attempt->user_id}");

            try {
                SendTestResultEmailJob::dispatch($attempt->user_id, $attempt->id);
            } catch (\Throwable $e) {
                \Log::warning('SendTestResultEmailJob dispatch failed', ['error' => $e->getMessage()]);
            }
        }
    }
}
