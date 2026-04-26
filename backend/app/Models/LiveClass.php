<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveClass extends Model
{
    protected $fillable = [
        'teacher_id', 'title', 'description', 'subject',
        'thumbnail', 'stream_url', 'recording_url',
        'status', 'duration_min', 'max_participants',
        'scheduled_at', 'started_at', 'ended_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at'   => 'datetime',
        'ended_at'     => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
