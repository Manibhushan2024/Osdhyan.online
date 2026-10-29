<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConceptNote extends Model
{
    protected $fillable = [
        'pack', 'concept_key', 'chapter_title', 'position', 'title', 'markdown', 'html', 'material_id',
    ];

    public function material()
    {
        return $this->belongsTo(StudyMaterial::class, 'material_id');
    }
}
