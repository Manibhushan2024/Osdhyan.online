<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

/**
 * Every attempt stays reachable: listed, numbered per test, openable by id
 * with its own answers — not only the latest one.
 */
class AttemptHistoryTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    /** Take the test once, answering question 0 right or wrong; returns the attempt id. */
    private function takeTest(int $testId, array $key, bool $right): int
    {
        $id = $this->postJson("/api/tests/{$testId}/attempts")->assertOk()->json('attempt.id');
        $q = $key[0];
        $choice = $right ? $q['correct'] : $q['wrong'];
        $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $q['question_id'], 'selected_option_id' => $choice],
        ]])->assertOk();

        return (int) $id;
    }

    public function test_each_attempt_keeps_its_own_answers_and_number(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest();
        $key = $this->answerKey($test);

        $first = $this->takeTest($test->id, $key, right: true);
        $second = $this->takeTest($test->id, $key, right: false);
        $this->assertNotSame($first, $second);

        $one = $this->getJson("/api/attempts/{$first}")->assertOk();
        $two = $this->getJson("/api/attempts/{$second}")->assertOk();

        // The first attempt still shows the first attempt's answer.
        $this->assertSame($key[0]['correct'], (int) $one->json('responses.0.selected_option_id'));
        $this->assertSame($key[0]['wrong'], (int) $two->json('responses.0.selected_option_id'));

        $this->assertSame(1, $one->json('attempt_number'));
        $this->assertSame(2, $two->json('attempt_number'));
        $this->assertCount(2, $one->json('attempts'));
        $this->assertSame([$first, $second], array_column($two->json('attempts'), 'id'));
    }

    public function test_my_attempts_lists_every_attempt_newest_first(): void
    {
        $this->actingAsStudent();
        $a = $this->makeTest();
        $b = $this->makeTest();
        $keyA = $this->answerKey($a);
        $keyB = $this->answerKey($b);

        $a1 = $this->takeTest($a->id, $keyA, right: true);
        $b1 = $this->takeTest($b->id, $keyB, right: true);
        $a2 = $this->takeTest($a->id, $keyA, right: false);

        $res = $this->getJson('/api/attempts')->assertOk();
        $this->assertSame([$a2, $b1, $a1], array_column($res->json('data'), 'id'));
        $this->assertSame(3, $res->json('total'));

        $rows = collect($res->json('data'))->keyBy('id');
        $this->assertSame(2, $rows[$a2]['attempt_number']);
        $this->assertSame(1, $rows[$a1]['attempt_number']);
        $this->assertSame(2, $rows[$a1]['attempts_at_test']);
        $this->assertSame('completed', $rows[$a1]['status']);
        $this->assertNotEmpty($rows[$a1]['test_name_en']);

        // Filter by test keeps the per-test numbering.
        $onlyA = $this->getJson("/api/attempts?test_id={$a->id}")->assertOk();
        $this->assertSame([$a2, $a1], array_column($onlyA->json('data'), 'id'));
        $this->assertSame([2, 1], array_column($onlyA->json('data'), 'attempt_number'));
    }

    public function test_students_cannot_see_each_others_attempts(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest();
        $mine = $this->takeTest($test->id, $this->answerKey($test), right: true);

        $this->actingAsStudent($this->student());
        $this->getJson("/api/attempts/{$mine}")->assertForbidden();
        $this->assertSame(0, $this->getJson('/api/attempts')->assertOk()->json('total'));
    }

    public function test_last_completed_attempt_stays_reachable_during_a_reattempt(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest();
        $done = $this->takeTest($test->id, $this->answerKey($test), right: true);
        $this->postJson("/api/tests/{$test->id}/attempts")->assertOk(); // re-attempt, still open

        $row = collect($this->getJson('/api/tests')->assertOk()->json())->firstWhere('id', $test->id);
        $this->assertSame('in_progress', $row['attempt_status']);
        $this->assertSame($done, $row['last_completed_attempt_id']);
        $this->assertSame(1, $row['attempts_count']);
    }

    public function test_guests_cannot_list_attempts(): void
    {
        $this->getJson('/api/attempts')->assertUnauthorized();
    }
}
