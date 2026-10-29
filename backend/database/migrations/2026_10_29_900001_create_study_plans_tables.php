<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Personal study plan: one plan per user (regenerated in place) and its
 * day-by-day tasks. Every task points at something the student can open:
 * a test, a study material or a course chapter.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->date('exam_date');
            $table->unsignedSmallInteger('weekday_office_min')->default(0);
            $table->unsignedSmallInteger('weekday_library_min')->default(0);
            $table->unsignedSmallInteger('weekend_min')->default(0);
            $table->json('settings')->nullable();   // focus, phase dates, resolved subjects + weights
            $table->json('plan')->nullable();       // summary shown above the task lists
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('study_plan_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('study_plans')->cascadeOnDelete();
            $table->date('date');
            $table->string('slot', 10);              // office | library | weekend
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('type', 10);              // notes | test | revision | mock | review
            $table->string('title', 255);
            $table->unsignedSmallInteger('minutes')->default(0);
            $table->string('ref_type', 20)->nullable(); // test | material | chapter
            $table->unsignedBigInteger('ref_id')->nullable();
            $table->string('link', 255)->nullable();    // portal path
            $table->string('subject_key', 60)->nullable();
            $table->unsignedTinyInteger('phase')->nullable();
            $table->timestamp('done_at')->nullable();
            $table->timestamps();
            $table->index(['plan_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_plan_tasks');
        Schema::dropIfExists('study_plans');
    }
};
