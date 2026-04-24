<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestSeries extends Model
{
    protected $fillable = [
        'exam_id',
        'name_en',
        'name_hi',
        'description_en',
        'description_hi',
        'category',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function tests()
    {
        return $this->belongsToMany(Test::class, 'test_series_tests');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_test_series');
    }
}
