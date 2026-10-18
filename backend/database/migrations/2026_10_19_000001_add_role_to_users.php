<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Account type. Admins are still flagged by is_admin/admin_role; `role`
 * distinguishes students from teachers (live classes, home tuition).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('student')->index()->after('admin_role');
            $table->string('city', 100)->nullable()->after('state');
            $table->text('bio')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'city', 'bio']);
        });
    }
};
