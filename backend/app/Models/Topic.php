<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    protected $fillable = [
        'chapter_id',
        'name_en',
        'name_hi',
        'slug',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function booted(): void
    {
        // Course pages are cached; any change here must show up immediately.
        static::saved(fn () => \App\Support\CourseContent::flushCache());
        static::deleted(fn () => \App\Support\CourseContent::flushCache());
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function materials()
    {
        return $this->hasMany(StudyMaterial::class);
    }
}
