<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->string('code', 20)->nullable()->after('slug');
        });

        Schema::table('tests', function (Blueprint $table) {
            $table->decimal('passing_marks', 8, 2)->nullable()->after('total_marks');
            $table->boolean('is_free')->default(true)->after('passing_marks');
            $table->boolean('shuffle_questions')->default(false)->after('is_free');
            $table->unsignedInteger('max_attempts')->default(0)->after('shuffle_questions');
            $table->unsignedSmallInteger('year')->nullable()->after('max_attempts');
            $table->string('paper_type', 50)->nullable()->after('year');
        });

        Schema::table('test_series', function (Blueprint $table) {
            $table->string('image')->nullable()->after('is_published');
        });
    }

    public function down(): void
    {
        Schema::table('exams', fn($t) => $t->dropColumn('code'));
        Schema::table('tests', fn($t) => $t->dropColumn(['passing_marks', 'is_free', 'shuffle_questions', 'max_attempts', 'year', 'paper_type']));
        Schema::table('test_series', fn($t) => $t->dropColumn('image'));
    }
};
