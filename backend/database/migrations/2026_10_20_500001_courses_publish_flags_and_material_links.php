<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Courses content system:
 *  - chapters / topics get an is_published flag (visible by default; the
 *    admin can hide one). The subject's own flag stays the main gate.
 *  - study_materials can be a video link (YouTube) instead of an uploaded
 *    file, so file_path becomes nullable and external_url is added. The
 *    detected MIME type and size are kept for the player.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('chapters', 'is_published')) {
            Schema::table('chapters', function (Blueprint $table) {
                $table->boolean('is_published')->default(true);
            });
        }

        if (!Schema::hasColumn('topics', 'is_published')) {
            Schema::table('topics', function (Blueprint $table) {
                $table->boolean('is_published')->default(true);
            });
        }

        Schema::table('study_materials', function (Blueprint $table) {
            $table->string('file_path')->nullable()->change();
        });

        Schema::table('study_materials', function (Blueprint $table) {
            if (!Schema::hasColumn('study_materials', 'external_url')) {
                $table->string('external_url', 500)->nullable();
            }
            if (!Schema::hasColumn('study_materials', 'mime_type')) {
                $table->string('mime_type', 100)->nullable();
            }
            if (!Schema::hasColumn('study_materials', 'file_size')) {
                $table->unsignedBigInteger('file_size')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('study_materials', function (Blueprint $table) {
            $table->dropColumn(['external_url', 'mime_type', 'file_size']);
        });
        Schema::table('topics', function (Blueprint $table) {
            $table->dropColumn('is_published');
        });
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn('is_published');
        });
    }
};
