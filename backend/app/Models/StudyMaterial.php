<?php

namespace App\Models;

use App\Support\CourseContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * type: pdf | image | video | audio | youtube | doc (see App\Support\CourseContent).
 * Uploaded files live on the public disk (file_path); a youtube item keeps
 * its link in external_url and exposes a ready-to-embed embed_url.
 */
class StudyMaterial extends Model
{
    protected $fillable = [
        'subject_id',
        'chapter_id',
        'topic_id',
        'title',
        'description',
        'file_path',
        'external_url',
        'mime_type',
        'file_size',
        'type',
        'is_published',
        'view_count',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'file_size'    => 'integer',
    ];

    protected $appends = ['embed_url'];

    protected static function booted(): void
    {
        static::saved(fn () => CourseContent::flushCache());
        static::deleted(fn () => CourseContent::flushCache());
    }

    public function getEmbedUrlAttribute(): ?string
    {
        return $this->type === 'youtube' ? CourseContent::youtubeEmbedUrl($this->external_url) : null;
    }

    /**
     * Published material whose subject / chapter / topic (when set) are
     * published too — i.e. what a student is allowed to open.
     */
    public function scopeVisibleToStudents(Builder $query): Builder
    {
        return $query->where('study_materials.is_published', true)
            ->whereDoesntHave('subject', fn ($q) => $q->where('is_published', false))
            ->whereDoesntHave('chapter', fn ($q) => $q->where('is_published', false))
            ->whereDoesntHave('topic', fn ($q) => $q->where('is_published', false));
    }

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
