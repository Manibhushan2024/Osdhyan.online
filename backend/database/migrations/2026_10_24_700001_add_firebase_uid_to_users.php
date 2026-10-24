<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Firebase Authentication sign-in (phone OTP / e-mail link / Google on the
 * Android app and the web): the Firebase user id (`sub` of the ID token),
 * so a returning user is found even if their phone or e-mail changes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('firebase_uid', 128)->nullable()->index()->after('google_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['firebase_uid']);
            $table->dropColumn('firebase_uid');
        });
    }
};
