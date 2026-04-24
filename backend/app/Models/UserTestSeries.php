<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTestSeries extends Model
{
    protected $table = 'user_test_series';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'test_series_id',
    ];
}
