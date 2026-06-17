<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_test', function (Blueprint $table) {
            $table->decimal('marks', 5, 2)->default(1.00)->after('sort_order');
            $table->decimal('negative_marks', 5, 2)->default(0.00)->after('marks');
        });
    }

    public function down(): void
    {
        Schema::table('question_test', function (Blueprint $table) {
            $table->dropColumn(['marks', 'negative_marks']);
        });
    }
};
