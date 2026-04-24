<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'subject_id',
        'chapter_id',
        'topic_id',
        'question_en',
        'question_hi',
        'image_path',
        'explanation_en',
        'explanation_hi',
        'difficulty',
    ];

    public function options()
    {
        return $this->hasMany(QuestionOption::class);
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

    public function tests()
    {
        return $this->belongsToMany(Test::class, 'question_test')
            ->withPivot(['marks', 'negative_marks']);
    }
}
