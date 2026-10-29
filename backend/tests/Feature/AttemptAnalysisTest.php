<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class AttemptAnalysisTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    /** Take the test as the current user with $right correct answers out of the first $answered. */
    private function take(int $testId, array $key, int $right, int $answered, array $marked = []): int
    {
        $id = $this->postJson("/api/tests/{$testId}/attempts")->assertOk()->json('attempt.id');
        $rows = [];
        for ($i = 0; $i < $answered; $i++) {
            $rows[] = [
                'question_id' => $key[$i]['question_id'],
                'selected_option_id' => $i < $right ? $key[$i]['correct'] : $key[$i]['wrong'],
                'is_marked_for_review' => in_array($i, $marked, true),
            ];
        }
        $this->postJson("/api/attempts/{$id}/complete", ['responses' => $rows])->assertOk();

        return (int) $id;
    }

    public function test_rank_percentile_comparison_and_distribution(): void
    {
        $test = $this->makeTest(count: 10);
        $key = $this->answerKey($test);

        // Three other students: 8, 5 and 2 correct out of 10 attempted (−0.25 each wrong).
        foreach ([8, 5, 2] as $right) {
            $this->actingAsStudent($this->student());
            $this->take($test->id, $key, $right, 10);
        }

        $me = $this->actingAsStudent($this->student());
        $mine = $this->take($test->id, $key, 6, 8); // 6 right, 2 wrong, 2 skipped → 5.5

        $res = $this->getJson("/api/attempts/{$mine}/analysis")->assertOk();
        $this->assertEquals(5.5, $res->json('score'));
        $this->assertSame(2, $res->json('rank.rank'));          // only the 8-correct student (7.5) is above
        $this->assertSame(4, $res->json('rank.out_of'));
        $this->assertEquals(66.7, $res->json('rank.percentile')); // beat 2 of the other 3
        $this->assertSame('first_attempt', $res->json('rank.basis'));
        $this->assertEquals(7.5, $res->json('comparison.topper'));
        $this->assertCount(10, $res->json('distribution'));
        $this->assertSame(4, array_sum(array_column($res->json('distribution'), 'students')));
        $this->assertSame(1, count(array_filter(array_column($res->json('distribution'), 'you'))));
        $this->assertSame(['total' => 10, 'attempted' => 8, 'correct' => 6, 'incorrect' => 2, 'unattempted' => 2, 'marked_not_evaluated' => 0], $res->json('counts'));
        $this->assertEquals(0.5, $res->json('negative_marks_lost'));
        $this->assertSame(2, count($res->json('trend')) + 1); // one attempt so far
    }

    public function test_reattempt_is_ranked_against_first_attempts_without_displacing_anyone(): void
    {
        $test = $this->makeTest(count: 4);
        $key = $this->answerKey($test);
        $this->actingAsStudent($this->student());
        $this->take($test->id, $key, 3, 4);                     // other: 2.75

        $this->actingAsStudent($this->student());
        $this->take($test->id, $key, 1, 4);                     // me first: 0.25
        $second = $this->take($test->id, $key, 4, 4);           // me again: 4

        $res = $this->getJson("/api/attempts/{$second}/analysis")->assertOk();
        $this->assertSame(1, $res->json('rank.rank'));
        $this->assertSame(2, $res->json('rank.out_of'));
        $this->assertSame('reattempt_compared_with_first_attempts', $res->json('rank.basis'));
        $this->assertCount(2, $res->json('trend'));
    }

    public function test_venn_regions_and_marked_not_evaluated(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 6);
        $test->update(['evaluate_marked' => false]);
        $key = $this->answerKey($test);
        // 4 answered (3 right); question 0 and 3 marked; question 5 marked without an answer.
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');
        $this->postJson("/api/attempts/{$id}/complete", ['responses' => [
            ['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct'], 'is_marked_for_review' => true],
            ['question_id' => $key[1]['question_id'], 'selected_option_id' => $key[1]['correct']],
            ['question_id' => $key[2]['question_id'], 'selected_option_id' => $key[2]['correct']],
            ['question_id' => $key[3]['question_id'], 'selected_option_id' => $key[3]['wrong'], 'is_marked_for_review' => true],
            ['question_id' => $key[5]['question_id'], 'selected_option_id' => null, 'is_marked_for_review' => true],
        ]])->assertOk();

        $res = $this->getJson("/api/attempts/{$id}/analysis")->assertOk();
        $this->assertSame(['attempted_only' => 2, 'marked_only' => 1, 'both' => 2, 'neither' => 1, 'correct_attempted_only' => 2, 'correct_both' => 1], $res->json('venn'));
        $this->assertSame(2, $res->json('counts.marked_not_evaluated'));
        $kinds = array_column($res->json('improve'), 'kind');
        $this->assertContains('marked', $kinds);
    }

    public function test_dsssb_qualifying_uses_section_b_and_total(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 4);
        $test->update(['section_mode' => 'free', 'sections' => [
            ['key' => 'ga', 'name_en' => 'GA', 'from' => 0, 'count' => 2],
            ['key' => 'cs1', 'name_en' => 'CS 1', 'from' => 2, 'count' => 2],
        ]]);
        $key = $this->answerKey($test);
        $id = $this->take($test->id, $key, 2, 2); // both GA right, CS skipped → total 50 %, Section B 0 %

        $q = $this->getJson("/api/attempts/{$id}/analysis")->assertOk()->json('qualifying');
        $this->assertEquals(50, $q['total_percent']);
        $this->assertEquals(0, $q['section_b_percent']);
        $this->assertFalse($q['categories'][0]['qualified']); // 40 % needed in Section B too
    }

    public function test_only_the_owner_sees_the_analysis_and_only_after_submit(): void
    {
        $this->actingAsStudent();
        $test = $this->makeTest(count: 2);
        $key = $this->answerKey($test);
        $open = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');
        $this->getJson("/api/attempts/{$open}/analysis")->assertStatus(409);
        $this->postJson("/api/attempts/{$open}/complete")->assertOk();
        $this->getJson("/api/attempts/{$open}/analysis")->assertOk();

        $this->actingAsStudent($this->student());
        $this->getJson("/api/attempts/{$open}/analysis")->assertForbidden();
    }
}
