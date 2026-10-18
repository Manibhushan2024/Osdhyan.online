<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_migrations_run_and_create_core_tables(): void
    {
        foreach (['users', 'tests', 'questions', 'question_options', 'question_test', 'test_attempts', 'test_responses', 'personal_access_tokens'] as $table) {
            $this->assertTrue(Schema::hasTable($table), "missing table {$table}");
        }
        $this->assertTrue(Schema::hasColumns('question_test', ['marks', 'negative_marks', 'sort_order']));
        $this->assertSame(0, \DB::table('questions')->count(), 'content seed migration must not run in tests');
    }
}
