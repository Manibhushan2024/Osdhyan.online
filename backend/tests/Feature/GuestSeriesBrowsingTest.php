<?php

namespace Tests\Feature;

use App\Models\TestSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class GuestSeriesBrowsingTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private function series(bool $published = true): TestSeries
    {
        $series = TestSeries::create([
            'exam_id'      => $this->exam()->id,
            'name_en'      => $published ? 'DSSSB TGT CS 2026' : 'Draft series',
            'is_published' => $published,
        ]);
        $series->tests()->attach($this->makeTest(count: 2, attributes: ['category' => 'Chapter-wise Tests'])->id);

        return $series;
    }

    public function test_guest_can_list_and_open_published_series(): void
    {
        $published = $this->series();
        $this->series(false);

        $this->getJson('/api/test-series')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name_en', 'DSSSB TGT CS 2026')
            ->assertJsonMissingPath('0.is_enrolled');

        $this->getJson("/api/test-series/{$published->id}")
            ->assertOk()
            ->assertJsonPath('is_enrolled', false)
            ->assertJsonCount(1, 'content.Chapter-wise Tests');
    }

    public function test_guest_cannot_open_unpublished_series_or_enrol(): void
    {
        $draft = $this->series(false);

        $this->getJson("/api/test-series/{$draft->id}")->assertNotFound();
        $this->getJson('/api/test-series/enrolled')->assertUnauthorized();
        $this->postJson("/api/test-series/{$draft->id}/enroll")->assertUnauthorized();
    }

    public function test_signed_in_user_still_gets_enrolment_flags_with_a_bearer_token(): void
    {
        $series = $this->series();
        $user = $this->student();
        $user->enrolledTestSeries()->attach($series->id);
        $token = $user->createToken('t')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/test-series')
            ->assertOk()
            ->assertJsonPath('0.is_enrolled', true);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/test-series/{$series->id}")
            ->assertOk()
            ->assertJsonPath('is_enrolled', true);
    }
}
