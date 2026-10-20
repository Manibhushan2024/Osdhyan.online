<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Live classes v3 (robustness):
 *  - participants.last_seen_at: a heartbeat touched by the state poll, so a
 *    student who closes the tab or loses network stops counting (and stops
 *    holding a seat) after a couple of minutes even if "leave" never arrived.
 *  - messages.deleted_at: soft delete, so every open chat window can be told
 *    which messages the teacher removed (state.removed_message_ids).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_class_participants', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('left_at');
            $table->index(['live_class_id', 'last_seen_at']);
        });

        DB::table('live_class_participants')
            ->whereNull('last_seen_at')
            ->update(['last_seen_at' => DB::raw('COALESCE(joined_at, created_at)')]);

        Schema::table('live_class_messages', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['live_class_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::table('live_class_messages', function (Blueprint $table) {
            $table->dropIndex(['live_class_id', 'deleted_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('live_class_participants', function (Blueprint $table) {
            $table->dropIndex(['live_class_id', 'last_seen_at']);
            $table->dropColumn('last_seen_at');
        });
    }
};
