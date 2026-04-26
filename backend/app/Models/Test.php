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
    ];

    protected $casts = [
        'is_free'           => 'boolean',
        'shuffle_questions' => 'boolean',
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
            ->withPivot(['marks', 'negative_marks']);
    }

    public function attempts()
    {
        return $this->hasMany(TestAttempt::class);
    }
}
