<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Enrolment rows learn when access ends (null = lifetime) and which order
 * granted it (null = free series / legacy enrolment / admin grant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_test_series', function (Blueprint $table) {
            $table->timestamp('access_expires_at')->nullable()->after('test_series_id');
            $table->foreignId('order_id')->nullable()->after('access_expires_at')
                ->constrained('orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('user_test_series', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_id');
            $table->dropColumn('access_expires_at');
        });
    }
};
