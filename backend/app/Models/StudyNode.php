<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyNode extends Model
{
    protected $fillable = [
        'user_id',
        'parent_id',
        'subject_id',
        'topic_id',
        'title',
        'color',
        'status',
        'total_time_sec',
        'timer_started_at',
        'sort_order',
    ];

    protected $casts = [
        'timer_started_at' => 'datetime',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(StudyNode::class, 'parent_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(StudyNode::class, 'parent_id');
    }

    /** Returns total_time_sec + elapsed seconds if timer is currently running. */
    public function getElapsedSecondsAttribute(): int
    {
        if ($this->timer_started_at) {
            return $this->total_time_sec + (int) now()->diffInSeconds($this->timer_started_at);
        }
        return $this->total_time_sec;
    }
}
