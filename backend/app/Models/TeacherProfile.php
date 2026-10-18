<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherProfile extends Model
{
    public const MODE_ONLINE = 'online';
    public const MODE_HOME = 'home';
    public const MODE_BOTH = 'both';
    public const MODES = [self::MODE_ONLINE, self::MODE_HOME, self::MODE_BOTH];

    protected $fillable = [
        'user_id', 'headline', 'bio', 'subjects', 'exams', 'teaching_mode', 'city', 'areas',
        'fee_per_hour', 'experience_years', 'qualifications', 'languages', 'availability',
        'is_available', 'verified_at', 'verified_by',
    ];

    protected $casts = [
        'subjects'         => 'array',
        'exams'            => 'array',
        'areas'            => 'array',
        'languages'        => 'array',
        'is_available'     => 'boolean',
        'verified_at'      => 'datetime',
        'fee_per_hour'     => 'integer',
        'experience_years' => 'integer',
    ];

    protected $appends = ['is_verified'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getIsVerifiedAttribute(): bool
    {
        return $this->verified_at !== null;
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /** Teaches online (mode online or both). */
    public function teachesOnline(): bool
    {
        return in_array($this->teaching_mode, [self::MODE_ONLINE, self::MODE_BOTH], true);
    }

    /** Visits students at home (mode home or both). */
    public function teachesAtHome(): bool
    {
        return in_array($this->teaching_mode, [self::MODE_HOME, self::MODE_BOTH], true);
    }

    /** Only verified + available teachers are listed or may send proposals. */
    public function scopeListed(Builder $query): Builder
    {
        return $query->whereNotNull('verified_at')->where('is_available', true);
    }

    /** Case-insensitive "tag is in JSON list" filter (works on SQLite and MySQL). */
    public function scopeWhereTag(Builder $query, string $column, string $tag): Builder
    {
        $needle = '%' . str_replace(['%', '_'], ['\\%', '\\_'], json_encode(mb_strtolower(trim($tag)))) . '%';

        return $query->whereRaw("LOWER({$column}) LIKE ?", [$needle]);
    }

    /** Normalise a tag list: trim, drop blanks/duplicates, cap at 20 entries. */
    public static function tags(?array $values): array
    {
        $out = [];
        foreach ((array) $values as $v) {
            $v = trim(preg_replace('/\s+/', ' ', (string) $v));
            if ($v === '' || mb_strlen($v) > 60) {
                continue;
            }
            $key = mb_strtolower($v);
            $out[$key] ??= $v; // first spelling wins
        }

        return array_slice(array_values($out), 0, 20);
    }

    public function hasSubject(string $subject): bool
    {
        return in_array(mb_strtolower(trim($subject)), array_map('mb_strtolower', $this->subjects ?? []), true);
    }

    public function hasExam(?string $exam): bool
    {
        return $exam !== null && $exam !== ''
            && in_array(mb_strtolower(trim($exam)), array_map('mb_strtolower', $this->exams ?? []), true);
    }

    /**
     * Public shape: never includes the user's email/phone. The `user` relation
     * must have been loaded with a restricted column list.
     */
    public function toPublicArray(): array
    {
        $user = $this->relationLoaded('user') ? $this->user : null;

        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'name'             => $user?->name,
            'avatar'           => $user?->avatar,
            'headline'         => $this->headline,
            'bio'              => $this->bio,
            'subjects'         => $this->subjects ?? [],
            'exams'            => $this->exams ?? [],
            'teaching_mode'    => $this->teaching_mode,
            'city'             => $this->city,
            'areas'            => $this->areas ?? [],
            'fee_per_hour'     => $this->fee_per_hour,
            'experience_years' => $this->experience_years,
            'qualifications'   => $this->qualifications,
            'languages'        => $this->languages ?? [],
            'availability'     => $this->availability,
            'is_available'     => $this->is_available,
            'is_verified'      => $this->isVerified(),
            'verified_at'      => $this->verified_at?->toISOString(),
        ];
    }
}
