<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A student's tuition requirement (type=requirement, visible to matching
 * teachers as a lead) or a direct contact with a teacher from the directory
 * (type=direct, created already matched).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tuition_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 20)->default('requirement'); // requirement|direct
            $table->string('subject', 100);
            $table->string('exam', 100)->nullable();            // exam or class
            $table->string('mode', 10)->default('both');        // online|home|both
            $table->string('city', 100)->nullable();
            $table->string('area', 100)->nullable();
            $table->unsignedInteger('budget_per_hour')->nullable(); // INR
            $table->string('preferred_timing', 150)->nullable();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('open');      // open|matched|closed
            $table->foreignId('selected_teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('conversation_id')->nullable(); // set on match
            $table->timestamps();

            $table->index(['status', 'type', 'city']);
            $table->index('student_id');
            $table->index('selected_teacher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuition_requests');
    }
};
