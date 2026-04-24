<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyGoal extends Model
{
    protected $fillable = [
        'user_id',
        'exam_id',
        'subject_id',
        'target_minutes',
        'target_date',
        'status',
    ];
}
