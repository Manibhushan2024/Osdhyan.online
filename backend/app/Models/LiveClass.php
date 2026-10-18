<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveClass extends Model
{
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_LIVE = 'live';
    public const STATUS_ENDED = 'ended';

    public const PROVIDER_JITSI = 'jitsi';
    public const PROVIDER_YOUTUBE = 'youtube';

    public const PROVIDERS = [self::PROVIDER_JITSI, self::PROVIDER_YOUTUBE];

    protected $fillable = [
        'teacher_id', 'title', 'description', 'subject', 'exam', 'tags',
        'thumbnail', 'stream_url', 'recording_url', 'is_recording_available',
        'status', 'provider', 'room_name', 'join_password', 'youtube_video_id',
        'duration_min', 'max_participants',
        'scheduled_at', 'started_at', 'ended_at',
    ];

    protected $casts = [
        'scheduled_at'           => 'datetime',
        'started_at'             => 'datetime',
        'ended_at'               => 'datetime',
        'tags'                   => 'array',
        'is_recording_available' => 'boolean',
        'max_participants'       => 'integer',
        'duration_min'           => 'integer',
    ];

    /** Never leak room credentials through a bare model serialisation. */
    protected $hidden = ['join_password', 'room_name'];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(LiveClassParticipant::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LiveClassMessage::class);
    }

    public function polls(): HasMany
    {
        return $this->hasMany(LiveClassPoll::class);
    }

    public function isLive(): bool
    {
        return $this->status === self::STATUS_LIVE;
    }

    public function isEnded(): bool
    {
        return $this->status === self::STATUS_ENDED;
    }

    public function isOwnedBy(?User $user): bool
    {
        return $user !== null && (int) $this->teacher_id === (int) $user->id;
    }

    /** Teacher of this class, or any admin. */
    public function canBeManagedBy(?User $user): bool
    {
        return $user !== null && ($this->isOwnedBy($user) || $user->isAdminUser());
    }

    public function stateCacheKey(): string
    {
        return "live:{$this->id}:state";
    }

    /** Count of people currently in the room (joined, not left). */
    public function activeParticipantsCount(): int
    {
        return $this->participants()->whereNull('left_at')->count();
    }

    /** Public, student-safe representation used by list/show. */
    public function toPublicArray(): array
    {
        return [
            'id'                     => $this->id,
            'title'                  => $this->title,
            'description'            => $this->description,
            'subject'                => $this->subject,
            'exam'                   => $this->exam,
            'tags'                   => $this->tags ?? [],
            'thumbnail'              => $this->thumbnail,
            'provider'               => $this->provider,
            'status'                 => $this->status,
            'duration_min'           => $this->duration_min,
            'max_participants'       => $this->max_participants,
            'scheduled_at'           => $this->scheduled_at?->toISOString(),
            'started_at'             => $this->started_at?->toISOString(),
            'ended_at'               => $this->ended_at?->toISOString(),
            'recording_url'          => $this->is_recording_available ? $this->recording_url : null,
            'is_recording_available' => (bool) $this->is_recording_available,
            'youtube_video_id'       => $this->provider === self::PROVIDER_YOUTUBE ? $this->youtube_video_id : null,
            'teacher'                => $this->relationLoaded('teacher') && $this->teacher ? [
                'id'     => $this->teacher->id,
                'name'   => $this->teacher->name,
                'avatar' => $this->teacher->avatar,
            ] : null,
            'participants_count'     => (int) ($this->participants_count ?? 0),
        ];
    }
}
