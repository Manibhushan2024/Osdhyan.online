<?php

use App\Models\Question;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Normalised-text hash for duplicate detection in bulk imports. A plain
 * LOWER(question_en) comparison missed differences in spacing and can't use
 * an index on large question banks.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->char('content_hash', 40)->nullable()->index();
        });

        DB::table('questions')->select('id', 'question_en')->orderBy('id')
            ->chunkById(1000, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('questions')->where('id', $row->id)
                        ->update(['content_hash' => Question::fingerprint((string) $row->question_en)]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex(['content_hash']);
            $table->dropColumn('content_hash');
        });
    }
};
