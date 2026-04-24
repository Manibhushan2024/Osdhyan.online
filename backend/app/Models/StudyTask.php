<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyTask extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'scheduled_date',
        'due_date',
        'is_completed',
        'completed_at',
        'sort_order',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'scheduled_date' => 'date',
        'due_date' => 'date',
    ];
}
