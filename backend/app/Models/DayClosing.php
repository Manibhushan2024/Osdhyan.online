<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DayClosing extends Model
{
    protected $fillable = [
        'user_id',
        'closed_date',
        'tomorrow_task',
        'voice_note_path',
        'carry_unfinished',
        'reschedule_date',
    ];

    protected $casts = [
        'carry_unfinished' => 'boolean',
        'closed_date' => 'date',
        'reschedule_date' => 'date',
    ];
}
