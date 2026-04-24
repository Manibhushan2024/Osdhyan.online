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
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}
