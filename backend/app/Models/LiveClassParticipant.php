<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveClassParticipant extends Model
{
    public const ROLE_TEACHER = 'teacher';
    public const ROLE_STUDENT = 'student';

    protected $fillable = [
        'live_class_id', 'user_id', 'role', 'joined_at', 'left_at', 'hand_raised_at',
    ];

    protected $casts = [
        'joined_at'      => 'datetime',
        'left_at'        => 'datetime',
        'hand_raised_at' => 'datetime',
    ];

    public function liveClass(): BelongsTo
    {
        return $this->belongsTo(LiveClass::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
