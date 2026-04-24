<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('chapter_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name_en');
            $table->string('name_hi')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_hi')->nullable();
            $table->string('mode')->default('practice');
            $table->string('status')->default('draft');
            $table->string('category')->nullable();
            $table->unsignedInteger('duration_sec')->default(3600);
            $table->decimal('negative_marking', 4, 2)->default(0);
            $table->decimal('question_mark', 4, 2)->default(1);
            $table->decimal('total_marks', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('question_test', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unique(['question_id', 'test_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_test');
        Schema::dropIfExists('tests');
    }
};
