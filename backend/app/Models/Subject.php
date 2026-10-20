<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'exam_id',
        'name_en',
        'name_hi',
        'slug',
        'code',
        'category',
        'class_level',
        'sort_order',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order'   => 'integer',
    ];

    protected static function booted(): void
    {
        // Course pages are cached; any change here must show up immediately.
        static::saved(fn () => \App\Support\CourseContent::flushCache());
        static::deleted(fn () => \App\Support\CourseContent::flushCache());
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }
}
