<?php

namespace App\Services;

use App\Models\Test;
use App\Support\LocalCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Cached, user-independent scoring data for one test.
 *
 * Answer sync and scoring used to run several queries per question; with
 * thousands of students submitting at the end of a mock that was the main
 * DB bottleneck. This builds the whole key in three queries, caches it, and
 * lets every validation/scoring step run in memory.
 *
 * Shape: [question_id => [
 *     'correct'  => ?int option id,
 *     'options'  => [option_id => true],
 *     'marks'    => float,
 *     'negative' => float,
 *     'subject'  => string,
 * ]]
 */
class TestAnswerKey
{
    private const TTL = 600;

    public static function for(Test $test): array
    {
        $key = self::cacheKey($test->id);
        $local = LocalCache::get($key);
        if (is_array($local)) {
            return $local;
        }

        $value = Cache::remember($key, self::TTL, fn () => self::build($test));
        LocalCache::put($key, $value);

        return $value;
    }

    public static function forget(int $testId): void
    {
        Cache::forget(self::cacheKey($testId));
        LocalCache::forget(self::cacheKey($testId));
    }

    private static function cacheKey(int $testId): string
    {
        return "test_answer_key_v1_{$testId}";
    }

    private static function build(Test $test): array
    {
        $testMarks    = (float) ($test->question_mark ?: 1);
        $testNegative = (float) ($test->negative_marking ?? 0);

        $rows = DB::table('question_test as qt')
            ->join('questions as q', 'q.id', '=', 'qt.question_id')
            ->leftJoin('subjects as s', 's.id', '=', 'q.subject_id')
            ->where('qt.test_id', $test->id)
            ->orderBy('qt.sort_order')
            ->get(['qt.question_id', 'qt.marks', 'qt.negative_marks', 's.name_en as subject']);

        $key = [];
        foreach ($rows as $row) {
            $pivotMarks = (float) ($row->marks ?? 0);
            $pivotNeg   = (float) ($row->negative_marks ?? 0);

            $key[(int) $row->question_id] = [
                'correct'  => null,
                'options'  => [],
                'marks'    => $pivotMarks > 0 ? $pivotMarks : $testMarks,
                // Pivot negative_marks defaults to 0.00, which used to silently
                // disable the test-level negative marking. Treat 0 as "inherit".
                'negative' => $pivotNeg > 0 ? $pivotNeg : $testNegative,
                'subject'  => $row->subject ?: 'General',
            ];
        }

        if ($key) {
            $options = DB::table('question_options')
                ->whereIn('question_id', array_keys($key))
                ->get(['id', 'question_id', 'is_correct']);

            foreach ($options as $opt) {
                $qid = (int) $opt->question_id;
                $key[$qid]['options'][(int) $opt->id] = true;
                if ($opt->is_correct && $key[$qid]['correct'] === null) {
                    $key[$qid]['correct'] = (int) $opt->id;
                }
            }
        }

        return $key;
    }
}
