<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestResponse extends Model
{
    protected $fillable = [
        'test_attempt_id',
        'question_id',
        'selected_option_id',
        'is_marked_for_review',
        'time_taken_sec',
        'marks_obtained',
    ];

    protected $casts = [
        'is_marked_for_review' => 'boolean',
    ];

    public function attempt()
    {
        return $this->belongsTo(TestAttempt::class, 'test_attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption()
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
