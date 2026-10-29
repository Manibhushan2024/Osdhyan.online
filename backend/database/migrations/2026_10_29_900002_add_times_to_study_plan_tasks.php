<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clock time of each study-plan task ("HH:MM", student's local time), laid
 * into the plan's timetable windows. Null for tasks planned before times.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_plan_tasks', function (Blueprint $table) {
            $table->string('start_time', 5)->nullable()->after('position');
            $table->string('end_time', 5)->nullable()->after('start_time');
        });
    }

    public function down(): void
    {
        Schema::table('study_plan_tasks', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time']);
        });
    }
};
