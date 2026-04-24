<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'name',
        'title',
        'description',
        'earned',
        'earned_at',
        'awarded_at',
    ];
}
