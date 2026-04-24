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
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
