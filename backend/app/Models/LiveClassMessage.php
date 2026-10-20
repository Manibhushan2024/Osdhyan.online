<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Soft-deleted so open chat windows learn about removals through
 * state.removed_message_ids instead of keeping a deleted message on screen.
 */
class LiveClassMessage extends Model
{
    use SoftDeletes;

    public const MAX_LENGTH = 1000;

    protected $fillable = ['live_class_id', 'user_id', 'body', 'is_pinned', 'is_answered'];

    protected $casts = [
        'is_pinned'   => 'boolean',
        'is_answered' => 'boolean',
    ];

    public function liveClass(): BelongsTo
    {
        return $this->belongsTo(LiveClass::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toChatArray(int $teacherId): array
    {
        return [
            'id'          => $this->id,
            'body'        => $this->body,
            'is_pinned'   => $this->is_pinned,
            'is_answered' => $this->is_answered,
            'created_at'  => $this->created_at?->toISOString(),
            'user'        => [
                'id'         => $this->user_id,
                'name'       => $this->relationLoaded('user') ? $this->user?->name : null,
                'avatar'     => $this->relationLoaded('user') ? $this->user?->avatar : null,
                'is_teacher' => (int) $this->user_id === $teacherId,
            ],
        ];
    }
}
