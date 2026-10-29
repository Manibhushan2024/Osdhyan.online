<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyPlan extends Model
{
    protected $fillable = [
        'user_id', 'exam_date',
        'weekday_office_min', 'weekday_library_min', 'weekend_min',
        'settings', 'plan', 'generated_at',
    ];

    protected $casts = [
        'exam_date'           => 'date',
        'weekday_office_min'  => 'integer',
        'weekday_library_min' => 'integer',
        'weekend_min'         => 'integer',
        'settings'            => 'array',
        'plan'                => 'array',
        'generated_at'        => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(StudyPlanTask::class, 'plan_id');
    }
}
