<?php

namespace Tests\Feature;

use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class TestAttemptFlowTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake(); // result e-mails / AI jobs are not under test here
    }

    private function start(int $testId)
    {
        return $this->postJson("/api/tests/{$testId}/attempts");
    }

    // ─── Start / resume ───────────────────────────────────────────────────────

    public function test_start_returns_server_side_timer(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(durationSec: 600);

        $res = $this->start($test->id)->assertOk();

        $attempt = $res->json('attempt');
        $this->assertSame('in_progress', $attempt['status']);
        $this->assertIsInt($attempt['remaining_sec']);
        $this->assertGreaterThan(590, $attempt['remaining_sec']);
        $this->assertLessThanOrEqual(600, $attempt['remaining_sec']);
        $this->assertNotEmpty($attempt['deadline_at']);
        $this->assertNotEmpty($attempt['server_time']);
    }

    public function test_second_start_resumes_the_same_attempt_with_saved_answers(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest();
        $key = $this->answerKey($test);

        $id = $this->start($test->id)->json('attempt.id');
        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']],
        ]])->assertOk();

        $this->travel(2)->minutes();
        $res = $this->start($test->id)->assertOk();

        $this->assertTrue($res->json('is_resume'));
        $this->assertSame($id, $res->json('attempt.id'));
        $this->assertCount(1, $res->json('attempt.responses'));
        // Timer keeps running across resume — it is not reset.
        $this->assertLessThanOrEqual(600 - 120, $res->json('attempt.remaining_sec'));
    }

    public function test_draft_tests_cannot_be_started_or_viewed_by_students(): void
    {
        $this->actingAsStudent();
        $draft = $this->makeTest(status: 'draft');

        $this->start($draft->id)->assertForbidden();
        $this->getJson("/api/tests/{$draft->id}")->assertNotFound();
    }

    public function test_admins_can_preview_draft_tests(): void
    {
        $this->actingAsStudent($this->admin());
        $draft = $this->makeTest(status: 'draft');

        $this->getJson("/api/tests/{$draft->id}")->assertOk();
        $this->start($draft->id)->assertOk();
    }

    public function test_max_attempts_is_enforced(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(attributes: ['max_attempts' => 1]);

        $id = $this->start($test->id)->json('attempt.id');
        $this->postJson("/api/attempts/{$id}/complete")->assertOk();

        $this->start($test->id)->assertForbidden()
            ->assertJsonFragment(['message' => 'You have used all 1 attempt(s) for this test.']);
    }

    public function test_students_cannot_touch_someone_elses_attempt(): void
    {
        $owner = $this->actingAsStudent();
        $test = $this->makeTest();
        $id = $this->start($test->id)->json('attempt.id');

        $this->actingAsStudent();
        $this->getJson("/api/attempts/{$id}")->assertForbidden();
        $this->postJson("/api/attempts/{$id}/sync", ['responses' => []])->assertForbidden();
        $this->postJson("/api/attempts/{$id}/complete")->assertForbidden();
        $this->assertSame('ongoing', TestAttempt::find($id)->status);
        $this->assertNotNull($owner);
    }

    // ─── Sync ─────────────────────────────────────────────────────────────────

    public function test_sync_upserts_in_bulk_and_last_write_wins(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 3);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');

        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['wrong']],
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['correct'], 'is_marked_for_review' => true],
        ]])->assertOk()->assertJson(['saved' => 2, 'rejected' => 0]);

        // Change answer 1, keep answer 2 — no duplicate rows.
        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct'], 'time_taken_sec' => 42],
        ]])->assertOk();

        $rows = DB::table('test_responses')->where('test_attempt_id', $id)->orderBy('question_id')->get();
        $this->assertCount(2, $rows);
        $first = $rows->firstWhere('question_id', $key[0]['question_id']);
        $this->assertSame($key[0]['correct'], (int) $first->selected_option_id);
        $this->assertSame(42, (int) $first->time_taken_sec);
        $this->assertTrue((bool) $rows->firstWhere('question_id', $key[1]['question_id'])->is_marked_for_review);
    }

    public function test_sync_rejects_questions_and_options_outside_the_test(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2);
        $key = $this->answerKey($test);
        $foreign = $this->question();
        $id = $this->start($test->id)->json('attempt.id');

        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            ['question_id' => $foreign->id, 'selected_option_id' => $foreign->options[0]->id],             // not in test
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $foreign->options[0]->id],   // option of another question
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => null],                       // cleared answer — valid
        ]])->assertOk()->assertJson(['saved' => 1, 'rejected' => 2]);

        $this->assertSame(1, DB::table('test_responses')->where('test_attempt_id', $id)->count());
    }

    public function test_legacy_single_response_endpoint_still_works(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');

        $this->postJson("/api/attempts/{$id}/responses", [
            'question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct'],
        ])->assertOk();

        $this->postJson("/api/attempts/{$id}/responses", [
            'question_id' => $key[0]['question_id'], 'selected_option_id' => 999999,
        ])->assertStatus(422);
    }

    public function test_sync_after_submit_is_rejected_with_409(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');
        $this->postJson("/api/attempts/{$id}/complete")->assertOk();

        $this->postJson("/api/attempts/{$id}/sync", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']],
        ]])->assertStatus(409)->assertJson(['code' => 'ATTEMPT_CLOSED']);
    }

    public function test_sync_is_accepted_within_grace_and_rejected_after_it(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1, durationSec: 600);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');
        $payload = ['responses' => [['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']]]];

        $this->travel(600 + TestAttempt::GRACE_SEC - 10)->seconds();
        $this->postJson("/api/attempts/{$id}/sync", $payload)->assertOk()->assertJson(['remaining_sec' => 0]);

        $this->travel(20)->seconds();
        $this->postJson("/api/attempts/{$id}/sync", $payload)->assertStatus(409)->assertJson(['code' => 'ATTEMPT_CLOSED']);
    }

    // ─── Scoring ──────────────────────────────────────────────────────────────

    public function test_complete_scores_with_test_level_negative_marking(): void
    {
        $user = $this->actingAsStudent();
        $test = $this->makeTest(count: 10, mark: 2, negative: 0.5);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');

        // 6 correct, 3 wrong, 1 unanswered → 6*2 - 3*0.5 = 10.5
        $responses = [];
        foreach (array_slice($key, 0, 6) as $k) {
            $responses[] = ['question_id' => $k['question_id'], 'selected_option_id' => $k['correct']];
        }
        foreach (array_slice($key, 6, 3) as $k) {
            $responses[] = ['question_id' => $k['question_id'], 'selected_option_id' => $k['wrong']];
        }

        $res = $this->postJson("/api/attempts/{$id}/complete", ['responses' => $responses])->assertOk();

        $this->assertEquals(10.5, (float) $res->json('total_score'));
        $this->assertSame('completed', $res->json('status'));
        $meta = $res->json('metadata');
        $this->assertSame(6, $meta['correct_count']);
        $this->assertSame(3, $meta['incorrect_count']);
        $this->assertSame(1, $meta['unattempted_count']);
        $this->assertSame(10, $meta['total_questions']);
        $this->assertEquals(66.67, $meta['accuracy']);
        // Sectional totals count every question, so the UI can derive "unattempted".
        $section = array_values($meta['sectional_stats'])[0];
        $this->assertSame(10, $section['total']);
        $this->assertEquals(10.5, $section['marks']);

        $user->refresh();
        $this->assertSame(1, (int) $user->total_tests_attempted);
        $this->assertEquals(66.67, (float) $user->avg_accuracy);

        $marks = DB::table('test_responses')->where('test_attempt_id', $id)->pluck('marks_obtained')->map(fn ($m) => (float) $m)->sort()->values()->all();
        $this->assertSame([-0.5, -0.5, -0.5, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0], $marks);
    }

    public function test_per_question_pivot_marks_override_test_defaults(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2, mark: 1, negative: 0.25);
        $key = $this->answerKey($test);
        DB::table('question_test')->where('test_id', $test->id)->where('question_id', $key[0]['question_id'])
            ->update(['marks' => 4, 'negative_marks' => 1]);

        $id = $this->start($test->id)->json('attempt.id');
        $res = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['wrong']],   // -1
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['correct']], // +1
        ]])->assertOk();

        $this->assertEquals(0.0, (float) $res->json('total_score'));
    }

    public function test_zero_pivot_negative_falls_back_to_test_negative_marking(): void
    {
        // Regression: tests created before the fix had pivot negative_marks = 0.
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2, mark: 1, negative: 0.25);
        $key = $this->answerKey($test);
        DB::table('question_test')->where('test_id', $test->id)->update(['negative_marks' => 0]);

        $id = $this->start($test->id)->json('attempt.id');
        $res = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['wrong']],
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['wrong']],
        ]])->assertOk();

        $this->assertEquals(-0.5, (float) $res->json('total_score'));
    }

    public function test_double_submit_is_idempotent_and_counts_stats_once(): void
    {
        $user = $this->actingAsStudent();
        $test = $this->makeTest(count: 2);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');
        $answers = ['responses' => [['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']]]];

        $first = $this->postJson("/api/attempts/{$id}/complete", $answers)->assertOk();
        // A retry (e.g. network hiccup) with different answers must not re-score.
        $second = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['correct']],
        ]])->assertOk();

        $this->assertEquals($first->json('total_score'), $second->json('total_score'));
        $this->assertSame(1, (int) $user->fresh()->total_tests_attempted);
        $this->assertSame(1, DB::table('test_responses')->where('test_attempt_id', $id)->count());
    }

    public function test_final_answers_sent_with_complete_after_the_grace_period_are_ignored(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1, durationSec: 600);
        $key = $this->answerKey($test);
        $id = $this->start($test->id)->json('attempt.id');

        $this->travel(600 + TestAttempt::GRACE_SEC + 30)->seconds();
        $res = $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']],
        ]])->assertOk();

        $this->assertEquals(0.0, (float) $res->json('total_score'));
        // Time taken is capped at the test duration.
        $this->assertSame(600, (int) $res->json('time_taken_sec'));
    }

    public function test_starting_again_after_time_ran_out_finalises_the_old_attempt(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1, durationSec: 600);
        $old = $this->start($test->id)->json('attempt.id');

        $this->travel(1)->hours();
        $new = $this->start($test->id)->assertOk()->json('attempt.id');

        $this->assertNotSame($old, $new);
        $this->assertSame('completed', TestAttempt::find($old)->status);
    }

    public function test_finalize_expired_command_closes_abandoned_attempts_only(): void
    {
        $test = $this->makeTest(count: 1, durationSec: 600);
        $abandoned = TestAttempt::create(['user_id' => $this->student()->id, 'test_id' => $test->id, 'status' => 'ongoing', 'started_at' => now()->subHour()]);
        $running = TestAttempt::create(['user_id' => $this->student()->id, 'test_id' => $test->id, 'status' => 'ongoing', 'started_at' => now()->subMinutes(5)]);

        $this->artisan('attempts:finalize-expired')->assertSuccessful();

        $this->assertSame('completed', $abandoned->fresh()->status);
        $this->assertSame('ongoing', $running->fresh()->status);
    }

    public function test_question_order_follows_admin_sort_order(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 4);
        $ids = DB::table('question_test')->where('test_id', $test->id)->orderBy('sort_order')->pluck('question_id')->all();
        // Reverse the admin order.
        foreach (array_reverse($ids) as $i => $qid) {
            DB::table('question_test')->where('test_id', $test->id)->where('question_id', $qid)->update(['sort_order' => $i]);
        }
        \App\Services\TestPayload::forget($test->id);

        $returned = array_column($this->getJson("/api/tests/{$test->id}")->assertOk()->json('questions'), 'id');
        $this->assertSame(array_reverse($ids), $returned);
    }

    // ─── Answer leakage ───────────────────────────────────────────────────────

    public function test_answers_and_explanations_are_hidden_until_submit(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2);
        $id = $this->start($test->id)->json('attempt.id');

        foreach ([$this->getJson("/api/tests/{$test->id}"), $this->getJson("/api/attempts/{$id}")] as $res) {
            $res->assertOk();
            $questions = $res->json('questions') ?? $res->json('test.questions');
            $this->assertNotEmpty($questions);
            foreach ($questions as $q) {
                $this->assertArrayNotHasKey('explanation_en', $q);
                foreach ($q['options'] as $o) {
                    $this->assertArrayNotHasKey('is_correct', $o);
                }
            }
        }

        $result = $this->postJson("/api/attempts/{$id}/complete")->assertOk();
        $q = $result->json('test.questions.0');
        $this->assertArrayHasKey('explanation_en', $q);
        $this->assertArrayHasKey('is_correct', $q['options'][0]);
    }

    public function test_explanation_endpoint_is_locked_until_the_student_submits(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1);
        $qid = $this->answerKey($test)[0]['question_id'];

        $this->getJson("/api/analytics/explanation/{$qid}")->assertForbidden();

        $id = $this->start($test->id)->json('attempt.id');
        $this->getJson("/api/analytics/explanation/{$qid}")->assertForbidden();

        $this->postJson("/api/attempts/{$id}/complete")->assertOk();
        $this->getJson("/api/analytics/explanation/{$qid}")->assertOk()
            ->assertJsonPath('explanation.step_by_step', 'Because reasons.');
    }

    public function test_analytics_overview_reflects_a_new_submission_immediately(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2);

        $this->getJson('/api/analytics/overview')->assertOk()->assertJson(['tests_completed' => 0]);

        $id = $this->start($test->id)->json('attempt.id');
        $this->postJson("/api/attempts/{$id}/complete")->assertOk();

        $this->getJson('/api/analytics/overview')->assertOk()->assertJson(['tests_completed' => 1]);
    }

    public function test_guests_get_401(): void
    {
        $test = $this->makeTest(count: 1);
        $this->getJson("/api/tests/{$test->id}")->assertUnauthorized();
        $this->postJson("/api/tests/{$test->id}/attempts")->assertUnauthorized();
        $this->assertInstanceOf(User::class, $this->student());
    }
}
