<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** A teacher's offer on a tuition requirement — one per teacher per request. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tuition_proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tuition_request_id')->constrained('tuition_requests')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->unsignedInteger('fee_per_hour'); // INR
            $table->string('status', 20)->default('pending'); // pending|accepted|rejected
            $table->timestamps();

            $table->unique(['tuition_request_id', 'teacher_id']);
            $table->index(['teacher_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuition_proposals');
    }
};
