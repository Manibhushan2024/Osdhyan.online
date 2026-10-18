<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Indexes for the student hot path (Postgres does not index foreign keys on
 * its own), a unique key that lets answer sync use a single UPSERT, and a
 * backfill for question_test marks that admin-created tests never set.
 */
return new class extends Migration
{
    private array $indexes = [
        'test_attempts_user_test_status_idx'  => 'test_attempts (user_id, test_id, status)',
        'test_attempts_user_status_idx'       => 'test_attempts (user_id, status)',
        'test_attempts_test_idx'              => 'test_attempts (test_id)',
        'question_options_question_idx'       => 'question_options (question_id)',
        'question_test_test_sort_idx'         => 'question_test (test_id, sort_order)',
        'test_series_tests_test_idx'          => 'test_series_tests (test_id)',
        'user_test_series_series_idx'         => 'user_test_series (test_series_id)',
        'subjects_exam_idx'                   => 'subjects (exam_id)',
        'chapters_subject_idx'                => 'chapters (subject_id)',
        'topics_chapter_idx'                  => 'topics (chapter_id)',
        'questions_subject_idx'               => 'questions (subject_id)',
        'questions_chapter_idx'               => 'questions (chapter_id)',
        'questions_topic_idx'                 => 'questions (topic_id)',
        'tests_status_idx'                    => 'tests (status)',
        'tests_exam_idx'                      => 'tests (exam_id)',
        'users_lower_email_idx'               => 'users (lower(email))',
        'users_phone_idx'                     => 'users (phone)',
    ];

    public function up(): void
    {
        // Drop duplicate answers left by the old updateOrCreate race, keeping the latest.
        DB::statement('DELETE FROM test_responses WHERE id NOT IN (
            SELECT MAX(id) FROM test_responses GROUP BY test_attempt_id, question_id
        )');
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS test_responses_attempt_question_unique
            ON test_responses (test_attempt_id, question_id)');

        foreach ($this->indexes as $name => $definition) {
            DB::statement("CREATE INDEX IF NOT EXISTS {$name} ON {$definition}");
        }

        // Tests created from the admin panel/automation attached questions with
        // the pivot defaults (marks 1, negative 0), so their negative marking
        // and per-question marks were silently ignored when scoring.
        DB::statement('UPDATE question_test SET negative_marks = (
                SELECT negative_marking FROM tests WHERE tests.id = question_test.test_id)
            WHERE negative_marks = 0 AND EXISTS (
                SELECT 1 FROM tests WHERE tests.id = question_test.test_id AND tests.negative_marking > 0)');
        DB::statement('UPDATE question_test SET marks = (
                SELECT question_mark FROM tests WHERE tests.id = question_test.test_id)
            WHERE marks = 1 AND EXISTS (
                SELECT 1 FROM tests WHERE tests.id = question_test.test_id
                AND tests.question_mark > 0 AND tests.question_mark <> 1)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS test_responses_attempt_question_unique');
        foreach (array_keys($this->indexes) as $name) {
            DB::statement("DROP INDEX IF EXISTS {$name}");
        }
    }
};
