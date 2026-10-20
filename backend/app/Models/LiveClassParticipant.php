<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveClassParticipant extends Model
{
    public const ROLE_TEACHER = 'teacher';
    public const ROLE_STUDENT = 'student';

    /**
     * A participant who has not polled the class for this long is treated
     * as gone (closed tab, lost network) even without an explicit leave.
     * The portal polls state every 4-10 s and the heartbeat is written at
     * most every HEARTBEAT_SECONDS, so this leaves plenty of slack for
     * throttled background tabs.
     */
    public const STALE_AFTER_SECONDS = 150;
    public const HEARTBEAT_SECONDS = 45;

    protected $fillable = [
        'live_class_id', 'user_id', 'role', 'joined_at', 'left_at', 'last_seen_at', 'hand_raised_at',
    ];

    protected $casts = [
        'joined_at'      => 'datetime',
        'left_at'        => 'datetime',
        'last_seen_at'   => 'datetime',
        'hand_raised_at' => 'datetime',
    ];

    /** In the room right now: joined, not left, and seen recently. */
    public function scopeActive(Builder $q): Builder
    {
        return $q->whereNull('left_at')
            ->where('last_seen_at', '>=', now()->subSeconds(self::STALE_AFTER_SECONDS));
    }

    public function liveClass(): BelongsTo
    {
        return $this->belongsTo(LiveClass::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
