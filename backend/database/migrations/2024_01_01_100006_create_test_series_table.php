<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name_en');
            $table->string('name_hi')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_hi')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('test_series_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_series_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_id')->constrained()->cascadeOnDelete();
            $table->unique(['test_series_id', 'test_id']);
        });

        Schema::create('user_test_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_series_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'test_series_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_test_series');
        Schema::dropIfExists('test_series_tests');
        Schema::dropIfExists('test_series');
    }
};
