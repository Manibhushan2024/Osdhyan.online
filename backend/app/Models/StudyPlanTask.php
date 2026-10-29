<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyPlanTask extends Model
{
    public const SLOTS = ['office', 'library', 'weekend'];
    public const TYPES = ['notes', 'test', 'revision', 'mock', 'review'];

    protected $fillable = [
        'plan_id', 'date', 'slot', 'position', 'type', 'title', 'minutes',
        'ref_type', 'ref_id', 'link', 'subject_key', 'phase', 'done_at',
    ];

    protected $casts = [
        'date'     => 'date:Y-m-d',
        'position' => 'integer',
        'minutes'  => 'integer',
        'ref_id'   => 'integer',
        'phase'    => 'integer',
        'done_at'  => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(StudyPlan::class, 'plan_id');
    }
}
