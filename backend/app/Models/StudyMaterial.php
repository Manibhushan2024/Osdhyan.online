<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyMaterial extends Model
{
    protected $fillable = [
        'subject_id',
        'chapter_id',
        'topic_id',
        'title',
        'description',
        'file_path',
        'type',
        'is_published',
        'view_count',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function progressRecords(): HasMany
    {
        return $this->hasMany(MaterialProgress::class, 'material_id');
    }
}
