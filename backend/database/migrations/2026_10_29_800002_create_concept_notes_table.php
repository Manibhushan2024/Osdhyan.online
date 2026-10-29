<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Revision notes split into sections, keyed by the chapter key that questions
 * carry (questions.concept_key), so a wrong answer can show the matching
 * concept right inside the solutions page.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concept_notes', function (Blueprint $table) {
            $table->id();
            $table->string('pack', 40);                 // e.g. "os", "ga"
            $table->string('concept_key', 60)->index(); // chapter key the notes file belongs to, e.g. "os_sched"
            $table->string('chapter_title', 160);
            $table->unsignedSmallInteger('position');   // order within the chapter (0 = "In 30 seconds")
            $table->string('title', 200);               // section heading
            $table->text('markdown');
            $table->text('html');
            $table->unsignedInteger('material_id')->nullable(); // the chapter's notes PDF (study_materials.id)
            $table->timestamps();
            $table->unique(['concept_key', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concept_notes');
    }
};
