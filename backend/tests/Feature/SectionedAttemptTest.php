<?php

namespace Tests\Feature;

use App\Models\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

/**
 * DSSSB-style sectioned tests: blocks are attempted in order, a block must be
 * locked before the next opens, locked blocks take no more answers, a block
 * timer locks it by itself, and locking the last block submits the attempt.
 */
class SectionedAttemptTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    /** 6-question test in 3 blocks of 2, sequential; optional per-block timer. */
    private function sectionedTest(?int $blockSec = null, string $mode = 'sequential'): Test
    {
        $test = $this->makeTest(count: 6, durationSec: 1800);
        $test->update([
            'section_mode' => $mode,
            'sections' => [
                ['key' => 'a', 'name_en' => 'Block A', 'from' => 0, 'count' => 2, 'duration_sec' => $blockSec],
                ['key' => 'b', 'name_en' => 'Block B', 'from' => 2, 'count' => 2, 'duration_sec' => $blockSec],
                ['key' => 'c', 'name_en' => 'Block C', 'from' => 4, 'count' => 2, 'duration_sec' => $blockSec],
            ],
        ]);

        return $test->fresh();
    }

    private function answer(array $key, int $i, bool $right = true): array
    {
        return ['question_id' => $key[$i]['question_id'], 'selected_option_id' => $right ? $key[$i]['correct'] : $key[$i]['wrong']];
    }

    public function test_start_exposes_sections_and_only_the_first_block_is_active(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest();

        $res = $this->postJson("/api/tests/{$test->id}/attempts")->assertOk();
        $state = $res->json('attempt.section_state');

        $this->assertSame('sequential', $state['mode']);
        $this->assertSame('a', $state['active_key']);
        $this->assertSame(['active', 'pending', 'pending'], array_column($state['sections'], 'status'));

        $payload = $this->getJson("/api/tests/{$test->id}")->assertOk();
        $this->assertCount(3, $payload->json('sections'));
        $this->assertSame('sequential', $payload->json('section_mode'));
    }

    public function test_answers_outside_the_active_block_are_rejected(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest();
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        $res = $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            $this->answer($key, 0),      // block A → saved
            $this->answer($key, 3),      // block B → not yet open
        ]])->assertOk();

        $this->assertSame(1, $res->json('saved'));
        $this->assertSame(1, $res->json('locked_rejected'));
        $this->assertDatabaseMissing('test_responses', ['test_attempt_id' => $id, 'question_id' => $key[3]['question_id']]);
    }

    public function test_locking_a_block_opens_the_next_and_closes_the_old_one(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest();
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        // Lock A, sending its last answer with the lock (like Submit Section).
        $res = $this->postJson("/api/attempts/{$id}/sections/a/lock", ['responses' => [$this->answer($key, 1)]])->assertOk();
        $this->assertFalse($res->json('completed'));
        $this->assertSame('b', $res->json('section_state.active_key'));
        $this->assertSame('student', $res->json('section_state.sections.0.locked_by'));
        $this->assertDatabaseHas('test_responses', ['test_attempt_id' => $id, 'question_id' => $key[1]['question_id']]);

        // A is locked: a late answer for it is dropped; B is writable now.
        $sync = $this->postJson("/api/attempts/{$id}/sync", ['responses' => [$this->answer($key, 0), $this->answer($key, 2)]])->assertOk();
        $this->assertSame(1, $sync->json('saved'));
        $this->assertSame(1, $sync->json('locked_rejected'));

        // Locking a non-active block is refused.
        $this->postJson("/api/attempts/{$id}/sections/a/lock")->assertStatus(409);
        $this->postJson("/api/attempts/{$id}/sections/c/lock")->assertStatus(409);
    }

    public function test_locking_the_last_block_submits_the_attempt_with_section_results(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest();
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        $this->postJson("/api/attempts/{$id}/sections/a/lock", ['responses' => [$this->answer($key, 0), $this->answer($key, 1, false)]])->assertOk();
        $this->postJson("/api/attempts/{$id}/sections/b/lock", ['responses' => [$this->answer($key, 2)]])->assertOk();
        $res = $this->postJson("/api/attempts/{$id}/sections/c/lock", ['responses' => [$this->answer($key, 4)]])->assertOk();

        $this->assertTrue($res->json('completed'));
        $this->assertSame('completed', $res->json('attempt.status'));

        $results = $res->json('attempt.metadata.section_results');
        $this->assertCount(3, $results);
        $this->assertSame(['a', 'b', 'c'], array_column($results, 'key'));
        $this->assertSame(1, $results[0]['correct']);
        $this->assertSame(1, $results[0]['incorrect']);
        $this->assertSame(1, $results[1]['unattempted']);
        $this->assertSame(3, $res->json('attempt.metadata.correct_count'));

        // The attempt stays submitted.
        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [$this->answer($key, 5)]])->assertStatus(409);
    }

    public function test_a_block_timer_locks_it_and_starts_the_next_block_at_the_deadline(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest(blockSec: 300);
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        $this->travel(6)->minutes(); // block A expired a minute ago

        $show = $this->getJson("/api/attempts/{$id}")->assertOk();
        $state = $show->json('section_state');
        $this->assertSame('b', $state['active_key']);
        $this->assertSame('timer', $state['sections'][0]['locked_by']);
        // B started when A's timer ended (5 min after start), so ~4 min remain of its 5.
        $this->assertGreaterThan(200, $state['sections'][1]['remaining_sec']);
        $this->assertLessThanOrEqual(240, $state['sections'][1]['remaining_sec']);

        // Late answer for A is dropped.
        $sync = $this->postJson("/api/attempts/{$id}/sync", ['responses' => [$this->answer($key, 0)]])->assertOk();
        $this->assertSame(0, $sync->json('saved'));

        // All three timers gone → opening the attempt finalizes it.
        $this->travel(15)->minutes();
        $this->assertSame('completed', $this->getJson("/api/attempts/{$id}")->assertOk()->json('status'));
    }

    public function test_answered_and_marked_for_review_is_not_evaluated_when_the_test_says_so(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 4);
        $test->update(['evaluate_marked' => false]);
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        $res = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            $this->answer($key, 0),                                            // right
            $this->answer($key, 1) + ['is_marked_for_review' => true],         // right but marked → not evaluated
            $this->answer($key, 2, false) + ['is_marked_for_review' => true],  // wrong but marked → no negative either
            $this->answer($key, 3, false),                                     // wrong
        ]])->assertOk();

        $this->assertSame(1, $res->json('metadata.correct_count'));
        $this->assertSame(1, $res->json('metadata.incorrect_count'));
        $this->assertSame(2, $res->json('metadata.marked_not_evaluated'));
        $this->assertEquals(0.75, (float) $res->json('total_score'));

        // Default tests still evaluate marked answers.
        $plain = $this->makeTest(count: 2);
        $k2 = $this->answerKey($plain);
        $id2 = $this->postJson("/api/tests/{$plain->id}/attempts")->json('attempt.id');
        $r2 = $this->postJson("/api/attempts/{$id2}/complete", ['responses' => [$this->answer($k2, 0) + ['is_marked_for_review' => true]]])->assertOk();
        $this->assertSame(1, $r2->json('metadata.correct_count'));
        $this->assertSame(0, $r2->json('metadata.marked_not_evaluated'));
    }

    public function test_free_mode_sections_do_not_restrict_answers(): void
    {
        $this->actingAsStudent();
        $test = $this->sectionedTest(mode: 'free');
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');

        $sync = $this->postJson("/api/attempts/{$id}/sync", ['responses' => [$this->answer($key, 0), $this->answer($key, 5)]])->assertOk();
        $this->assertSame(2, $sync->json('saved'));
        $this->assertArrayNotHasKey('locked_rejected', $sync->json());
        $this->postJson("/api/attempts/{$id}/sections/a/lock")->assertStatus(422);
    }
}
