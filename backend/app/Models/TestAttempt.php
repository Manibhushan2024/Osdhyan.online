<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'test_id',
        'started_at',
        'completed_at',
        'status',
        'total_score',
        'time_taken_sec',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function responses()
    {
        return $this->hasMany(TestResponse::class);
    }

    /** Extra time after the deadline to absorb network latency on the final save. */
    public const GRACE_SEC = 120;

    public function isOngoing(): bool
    {
        return in_array($this->status, ['ongoing', 'in_progress'], true);
    }

    public function deadline(?int $durationSec = null): \Carbon\CarbonInterface
    {
        $duration = $durationSec ?? (int) ($this->test?->duration_sec ?: 3600);

        return ($this->started_at ?? $this->created_at ?? now())->copy()->addSeconds($duration);
    }

    public function remainingSeconds(?int $durationSec = null): int
    {
        return max(0, (int) now()->diffInSeconds($this->deadline($durationSec), false));
    }

    /** Answers may still be written (deadline + grace not yet passed). */
    public function acceptsAnswers(?int $durationSec = null): bool
    {
        return $this->isOngoing()
            && now()->lte($this->deadline($durationSec)->copy()->addSeconds(self::GRACE_SEC));
    }
}
