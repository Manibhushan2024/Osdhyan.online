<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DSSSB's CBT (TCS iON, ConsiderMarkForReview=NO) does not evaluate a question
 * that is both answered and marked for review. Tests that replicate that exam
 * set evaluate_marked = false; everything else keeps scoring marked answers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->boolean('evaluate_marked')->default(true)->after('section_mode');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn('evaluate_marked');
        });
    }
};
