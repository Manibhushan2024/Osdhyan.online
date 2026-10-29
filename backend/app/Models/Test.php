<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    protected $fillable = [
        'exam_id', 'subject_id', 'chapter_id', 'topic_id',
        'name_en', 'name_hi', 'description_en', 'description_hi',
        'mode', 'status', 'category',
        'duration_sec', 'negative_marking', 'question_mark', 'total_marks',
        'passing_marks', 'is_free', 'shuffle_questions', 'max_attempts',
        'year', 'paper_type',
        'sections', 'section_mode', 'evaluate_marked',
    ];

    protected $casts = [
        'is_free'           => 'boolean',
        'shuffle_questions' => 'boolean',
        'sections'          => 'array',
        'evaluate_marked'   => 'boolean',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_test')
            ->withPivot(['marks', 'negative_marks', 'sort_order'])
            ->orderBy('question_test.sort_order')
            ->orderBy('question_test.id');
    }

    public function attempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    /**
     * Replace the test's questions, writing sort order and the test-level
     * marks/negative marks onto the pivot in one bulk insert. (The pivot
     * defaults of 1 / 0 used to make scoring ignore negative marking.)
     *
     * @param array<int, int|array{id:int, marks?:float|null, negative_marks?:float|null}> $questions
     */
    public function replaceQuestions(array $questions): void
    {
        \Illuminate\Support\Facades\DB::table('question_test')->where('test_id', $this->id)->delete();
        $this->appendQuestions($questions);
    }

    /** Append questions after the existing ones (duplicates are ignored). */
    public function appendQuestions(array $questions): int
    {
        $db = \Illuminate\Support\Facades\DB::table('question_test');
        $existing = $db->clone()->where('test_id', $this->id)->pluck('question_id')->flip();
        $next = (int) $db->clone()->where('test_id', $this->id)->max('sort_order');
        $next = $existing->isEmpty() ? 0 : $next + 1;

        $marks = (float) ($this->question_mark ?: 1);
        $negative = (float) ($this->negative_marking ?? 0);

        $rows = [];
        foreach ($questions as $q) {
            $id = (int) (is_array($q) ? $q['id'] : $q);
            if ($existing->has($id) || isset($rows[$id])) {
                continue;
            }
            $rows[$id] = [
                'test_id'        => $this->id,
                'question_id'    => $id,
                'sort_order'     => $next++,
                'marks'          => is_array($q) && isset($q['marks']) ? (float) $q['marks'] : $marks,
                'negative_marks' => is_array($q) && isset($q['negative_marks']) ? (float) $q['negative_marks'] : $negative,
            ];
        }

        foreach (array_chunk(array_values($rows), 500) as $chunk) {
            \Illuminate\Support\Facades\DB::table('question_test')->insert($chunk);
        }

        \App\Services\TestPayload::forget($this->id);

        return count($rows);
    }

    /** Recompute total_marks from the pivot. */
    public function refreshTotalMarks(): void
    {
        $total = (float) \Illuminate\Support\Facades\DB::table('question_test')->where('test_id', $this->id)->sum('marks');
        $this->forceFill(['total_marks' => $total])->saveQuietly();
    }
}
