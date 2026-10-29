<?php

namespace Tests\Feature;

use App\Models\ConceptNote;
use App\Models\Question;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class ConceptNotesTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private function notes(string $key, string $pack = 'os'): void
    {
        foreach ([
            [0, 'In 30 seconds', '- **Burst time** = CPU time a process needs.'],
            [1, 'Basic concepts', 'CPU–I/O burst cycle. The short-term scheduler picks from the ready queue.'],
            [2, 'Scheduling algorithms: FCFS, SJF, Round Robin', 'SJF gives the minimum average waiting time. Round Robin uses a time quantum.'],
            [3, 'Deadlock', 'Four conditions: mutual exclusion, hold and wait, no preemption, circular wait.'],
        ] as [$pos, $title, $md]) {
            ConceptNote::create(['pack' => $pack, 'concept_key' => $key, 'chapter_title' => 'CPU Scheduling', 'position' => $pos, 'title' => $title, 'markdown' => $md, 'html' => '<p>' . e($md) . '</p>']);
        }
    }

    public function test_question_gets_the_best_matching_notes_section(): void
    {
        $this->actingAsStudent();
        $this->notes('os_sched');
        $q = $this->question();
        $q->update(['concept_key' => 'os_sched', 'subtopic' => 'Scheduling algorithms', 'question_en' => 'Which algorithm gives the minimum average waiting time?']);

        $res = $this->getJson("/api/questions/{$q->id}/concept")->assertOk();
        $this->assertTrue($res->json('found'));
        $this->assertSame('os_sched', $res->json('chapter_key'));
        $this->assertSame(2, $res->json('section.position'));
        $this->assertStringContainsString('SJF', $res->json('section.html'));
        $this->assertCount(4, $res->json('chapters.0.sections'));
    }

    public function test_bank_keys_resolve_through_the_concept_map(): void
    {
        $this->actingAsStudent();
        $this->notes('os_sched');
        $q = $this->question();
        // "cs_os" is a generated-bank key; concept_map.json sends it to the os pack.
        $q->update(['concept_key' => 'cs_os', 'subtopic' => 'Deadlock', 'question_en' => 'Which is not a necessary condition for deadlock?']);

        $res = $this->getJson("/api/questions/{$q->id}/concept")->assertOk();
        $this->assertTrue($res->json('found'));
        $this->assertSame('Deadlock', $res->json('section.title'));
    }

    public function test_question_without_notes_says_so(): void
    {
        $this->actingAsStudent();
        $q = $this->question();
        $q->update(['concept_key' => 'xx_none']);
        $this->getJson("/api/questions/{$q->id}/concept")->assertOk()->assertJson(['found' => false, 'reason' => 'no_notes_yet']);

        $q2 = $this->question();
        $this->getJson("/api/questions/{$q2->id}/concept")->assertOk()->assertJson(['found' => false, 'reason' => 'no_concept_key']);
    }

    public function test_chapter_notes_endpoint_and_guest_refusal(): void
    {
        $this->notes('os_sched');
        $this->getJson('/api/concepts/os_sched')->assertUnauthorized();

        $this->actingAsStudent();
        $res = $this->getJson('/api/concepts/os_sched')->assertOk();
        $this->assertSame('CPU Scheduling', $res->json('chapter_title'));
        $this->assertCount(4, $res->json('sections'));
        $this->getJson('/api/concepts/nope')->assertNotFound();
    }
}
