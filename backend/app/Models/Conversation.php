<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;

/**
 * Generic 1:1 conversation. Reusable by live classes / tuition / support:
 * attach context through the optional `subject` morph.
 *
 * Delivery is polling-based (client polls the open thread every 4s and the
 * list every 15s). Upgrade path: broadcast MessageSent over Laravel Reverb.
 */
class Conversation extends Model
{
    public const TYPE_DIRECT = 'direct';

    protected $fillable = ['type', 'subject_type', 'subject_id', 'last_message_at'];

    protected $casts = ['last_message_at' => 'datetime'];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['last_read_at', 'last_read_message_id'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->whereHas('participants', fn (Builder $q) => $q->where('users.id', $userId));
    }

    public function hasParticipant(int $userId): bool
    {
        return $this->participants()->where('users.id', $userId)->exists();
    }

    /** The existing direct conversation between two users, if any. */
    public static function directBetween(int $a, int $b): ?self
    {
        return static::where('type', self::TYPE_DIRECT)
            ->forUser($a)
            ->forUser($b)
            ->first();
    }

    /** Find or create the direct conversation between two users. */
    public static function openDirect(int $a, int $b, ?Model $subject = null): self
    {
        return DB::transaction(function () use ($a, $b, $subject) {
            $existing = static::directBetween($a, $b);
            if ($existing) {
                if ($subject && !$existing->subject_id) {
                    $existing->subject()->associate($subject);
                    $existing->save();
                }

                return $existing;
            }

            $conversation = new static(['type' => self::TYPE_DIRECT]);
            if ($subject) {
                $conversation->subject()->associate($subject);
            }
            $conversation->save();
            $conversation->participants()->attach([$a, $b]);

            return $conversation;
        });
    }

    /** Unread count for a participant, based on monotonic message ids. */
    public function unreadCountFor(int $userId, ?int $lastReadMessageId = null): int
    {
        if ($lastReadMessageId === null) {
            $lastReadMessageId = (int) ($this->participants()
                ->where('users.id', $userId)
                ->first()?->pivot?->last_read_message_id ?? 0);
        }

        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('id', '>', $lastReadMessageId)
            ->count();
    }

    public function markReadBy(int $userId): void
    {
        $lastId = (int) ($this->messages()->max('id') ?? 0);
        $this->participants()->updateExistingPivot($userId, [
            'last_read_at'         => now(),
            'last_read_message_id' => $lastId,
        ]);
    }
}
