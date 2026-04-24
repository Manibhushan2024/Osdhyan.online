<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudySession extends Model
{
    protected $fillable = [
        'user_id',
        'subject_id',
        'topic_id',
        'started_at',
        'ended_at',
        'duration_sec',
        'status',
    ];
}
