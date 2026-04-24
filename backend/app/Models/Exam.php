<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'name_en',
        'name_hi',
        'slug',
        'description_en',
        'description_hi',
    ];
}
