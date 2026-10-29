<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Exam-style sections (DSSSB CBT: 10 blocks of 20 questions attempted one
 * after another) and the concept key that links a question to its revision
 * notes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            // [{key, name_en, name_hi, from, count, duration_sec|null}, …] in question order.
            $table->json('sections')->nullable()->after('total_marks');
            // free: move between sections at will; sequential: lock a section
            // before the next one opens (no going back).
            $table->string('section_mode', 20)->default('free')->after('sections');
        });

        Schema::table('questions', function (Blueprint $table) {
            // Chapter key of the question bank it came from (e.g. "cs_os",
            // "ga_polity") and its sub-topic — used to show the matching notes.
            $table->string('concept_key', 60)->nullable()->after('difficulty')->index();
            $table->string('subtopic', 160)->nullable()->after('concept_key');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn(['sections', 'section_mode']);
        });
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex(['concept_key']);
            $table->dropColumn(['concept_key', 'subtopic']);
        });
    }
};
