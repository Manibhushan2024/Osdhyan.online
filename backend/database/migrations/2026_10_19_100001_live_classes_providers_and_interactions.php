<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Live classes v2: pluggable video provider (Jitsi / YouTube Live), room
 * credentials, and the in-app interaction tables (participants, chat,
 * polls). Everything here is portable SQL — it runs on sqlite (tests) and
 * Postgres/MySQL alike.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            $table->string('provider', 20)->default('jitsi')->after('status');
            $table->string('room_name', 80)->nullable()->after('provider');
            $table->string('join_password', 40)->nullable()->after('room_name');
            $table->string('youtube_video_id', 32)->nullable()->after('join_password');
            $table->boolean('is_recording_available')->default(false)->after('recording_url');
            $table->string('exam', 50)->nullable()->after('subject');
            $table->json('tags')->nullable()->after('exam');

            $table->index(['status', 'scheduled_at']);
            $table->index('teacher_id');
        });

        Schema::create('live_class_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_class_id')->constrained('live_classes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 10)->default('student'); // teacher|student
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamp('hand_raised_at')->nullable();
            $table->timestamps();

            $table->unique(['live_class_id', 'user_id']);
            $table->index(['live_class_id', 'left_at']);
            $table->index(['live_class_id', 'hand_raised_at']);
        });

        Schema::create('live_class_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_class_id')->constrained('live_classes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('body', 1000);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_answered')->default(false);
            $table->timestamps();

            // ?after={id} polling and "pinned messages" both hit these.
            $table->index(['live_class_id', 'id']);
            $table->index(['live_class_id', 'is_pinned']);
            $table->index('created_at');
        });

        Schema::create('live_class_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_class_id')->constrained('live_classes')->cascadeOnDelete();
            $table->string('question', 500);
            $table->json('options'); // [{id, text}]
            $table->boolean('is_open')->default(true);
            $table->timestamp('revealed_at')->nullable();
            $table->timestamps();

            $table->index(['live_class_id', 'id']);
        });

        Schema::create('live_class_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('live_class_polls')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('option_id', 16);
            $table->timestamps();

            $table->unique(['poll_id', 'user_id']);
            $table->index(['poll_id', 'option_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_class_poll_votes');
        Schema::dropIfExists('live_class_polls');
        Schema::dropIfExists('live_class_messages');
        Schema::dropIfExists('live_class_participants');

        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropIndex(['status', 'scheduled_at']);
            $table->dropIndex(['teacher_id']);
            $table->dropColumn([
                'provider', 'room_name', 'join_password', 'youtube_video_id',
                'is_recording_available', 'exam', 'tags',
            ]);
        });
    }
};
