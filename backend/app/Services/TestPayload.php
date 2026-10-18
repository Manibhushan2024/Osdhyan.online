<?php

namespace App\Services;

use App\Models\Test;
use App\Support\LocalCache;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;

/**
 * Cached, user-independent JSON payloads for a test with its questions.
 *
 * - student(): pre/mid-attempt view — no correct answers, no explanations.
 * - withAnswers(): post-submit solutions view.
 *
 * When a mock opens, thousands of students request the same test within
 * seconds; a cache lock makes sure only one request rebuilds a missing
 * payload while the others wait for it instead of all hitting the DB.
 */
class TestPayload
{
    private const TTL = 300;

    public static function student(Test $test): array
    {
        return self::remember("test_payload_v4_student_{$test->id}", fn () => self::build($test, false));
    }

    public static function withAnswers(Test $test): array
    {
        return self::remember("test_payload_v4_answers_{$test->id}", fn () => self::build($test, true));
    }

    public static function forget(int $testId): void
    {
        foreach (["test_payload_v4_student_{$testId}", "test_payload_v4_answers_{$testId}"] as $key) {
            Cache::forget($key);
            LocalCache::forget($key); // this server only; others expire within LocalCache::TTL
        }
        TestAnswerKey::forget($testId);
        Cache::forget("test_show_v3_{$testId}");
    }

    /** Forget every test payload that contains any of these questions. */
    public static function forgetForQuestions(array $questionIds): void
    {
        if (!$questionIds) {
            return;
        }
        \Illuminate\Support\Facades\DB::table('question_test')
            ->whereIn('question_id', $questionIds)
            ->distinct()
            ->pluck('test_id')
            ->each(fn ($id) => self::forget((int) $id));
    }

    private static function remember(string $key, callable $build): array
    {
        $local = LocalCache::get($key);
        if (is_array($local)) {
            return $local;
        }

        $cached = Cache::get($key);
        if (is_array($cached)) {
            LocalCache::put($key, $cached);
            return $cached;
        }

        try {
            return Cache::lock("lock_{$key}", 15)->block(10, function () use ($key, $build) {
                // Another request may have filled it while we waited.
                $cached = Cache::get($key);
                if (is_array($cached)) {
                    return $cached;
                }
                $payload = $build();
                Cache::put($key, $payload, self::TTL);
                LocalCache::put($key, $payload);

                return $payload;
            });
        } catch (LockTimeoutException) {
            // Builder is slow — serve directly rather than fail the student.
            return $build();
        }
    }

    private static function build(Test $test, bool $withAnswers): array
    {
        $test = $test->fresh();
        $test->load([
            'subject:id,name_en,name_hi',
            'chapter:id,name_en,name_hi',
            'topic:id,name_en,name_hi',
            'questions' => fn ($q) => $q->select(
                'questions.id', 'questions.subject_id', 'questions.chapter_id', 'questions.topic_id',
                'questions.question_en', 'questions.question_hi', 'questions.image_path',
                'questions.explanation_en', 'questions.explanation_hi', 'questions.difficulty'
            ),
            'questions.options:id,question_id,label,option_en,option_hi,image_path,is_correct',
            'questions.subject:id,name_en,name_hi',
        ]);

        $questionsCount = $test->questions->count();
        $test->questions_count = $questionsCount;
        $test->mode = $test->mode ?: ($test->category ?: 'full_mock');
        $test->total_marks = (float) $test->total_marks ?: $test->questions->sum(
            fn ($q) => (float) ($q->pivot?->marks ?: ($test->question_mark ?: 1))
        );

        if (!$withAnswers) {
            $test->questions->each(function ($question) {
                $question->makeHidden(['explanation_en', 'explanation_hi']);
                $question->options->each->makeHidden('is_correct');
            });
        }

        return $test->toArray();
    }
}
