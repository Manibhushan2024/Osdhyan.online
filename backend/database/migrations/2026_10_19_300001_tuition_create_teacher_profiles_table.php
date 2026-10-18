<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Home-tuition marketplace: one profile per teacher account. Contact details
 * live on `users` and are never serialised by the tuition APIs — all contact
 * goes through chat so the platform can later meter it (lead fee/commission).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('headline', 150)->nullable();
            $table->text('bio')->nullable();
            $table->json('subjects')->nullable();   // ["Mathematics", "Physics"]
            $table->json('exams')->nullable();      // ["BPSC", "Class 10"]
            $table->string('teaching_mode', 10)->default('both'); // online|home|both
            $table->string('city', 100)->nullable();
            $table->json('areas')->nullable();      // localities within the city
            $table->unsignedInteger('fee_per_hour')->nullable(); // INR
            $table->unsignedTinyInteger('experience_years')->default(0);
            $table->string('qualifications', 255)->nullable();
            $table->json('languages')->nullable();
            $table->text('availability')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['verified_at', 'is_available']);
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
