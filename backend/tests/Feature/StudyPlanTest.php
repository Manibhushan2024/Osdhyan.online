<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\StudyMaterial;
use App\Models\StudyPlan;
use App\Models\StudyPlanTask;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class StudyPlanTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private const SETTINGS = [
        'exam_date'           => '2026-11-26',
        'weekday_office_min'  => 120,
        'weekday_library_min' => 390,
        'weekend_min'         => 480,
    ];

    /** @var array<string, int> */
    private array $ids = [];

    protected function setUp(): void
    {
        parent::setUp();
        // Thursday 29 Oct 2026, 10:00 IST.
        $this->travelTo(Carbon::parse('2026-10-29 04:30:00', 'UTC'));
        $this->seedCatalog();
    }

    // ─── Fixtures ─────────────────────────────────────────────────────────────

    private function test(string $name, array $attrs = []): Test
    {
        return Test::create(array_merge([
            'name_en'      => $name,
            'mode'         => 'chapter',
            'status'       => 'published',
            'duration_sec' => 1500,
            'is_free'      => true,
        ], $attrs));
    }

    private function series(string $name, array $tests, array $attrs = []): TestSeries
    {
        $s = TestSeries::create(array_merge(['name_en' => $name, 'is_published' => true], $attrs));
        $s->tests()->attach(collect($tests)->pluck('id')->all());

        return $s;
    }

    private function courseSubject(string $name, array $chapters, ?string $fastSheet = null): Subject
    {
        $subject = Subject::create([
            'exam_id' => $this->exam('DSSSB')->id, 'name_en' => $name, 'slug' => Str::slug($name) . '-' . Str::random(4),
            'category' => 'DSSSB', 'is_published' => true,
        ]);
        foreach ($chapters as $i => $title) {
            $ch = Chapter::create(['subject_id' => $subject->id, 'name_en' => ($i + 1) . ". {$title}", 'slug' => Str::random(10), 'is_published' => true]);
            $m = StudyMaterial::create([
                'subject_id' => $subject->id, 'chapter_id' => $ch->id, 'title' => "{$title} — revision notes",
                'file_path' => 'x.pdf', 'type' => 'pdf', 'is_published' => true,
            ]);
            $this->ids["notes:{$title}"] = $m->id;
        }
        $summary = Chapter::create(['subject_id' => $subject->id, 'name_en' => (count($chapters) + 1) . '. Complete notes, previous-year questions & 200 most expected', 'slug' => Str::random(10), 'is_published' => true]);
        foreach (array_filter([$fastSheet, "{$name} — complete notes (all chapters in one PDF)", "{$name} — previous-year questions 2023–24 with solutions"]) as $title) {
            StudyMaterial::create(['subject_id' => $subject->id, 'chapter_id' => $summary->id, 'title' => $title, 'file_path' => 'x.pdf', 'type' => 'pdf', 'is_published' => true]);
        }
        // A draft material must never be scheduled.
        $draft = StudyMaterial::create(['subject_id' => $subject->id, 'chapter_id' => $summary->id, 'title' => 'Draft sheet', 'file_path' => 'x.pdf', 'type' => 'pdf', 'is_published' => false]);
        $this->ids['draft_material'] = $draft->id;

        return $subject;
    }

    private function seedCatalog(): void
    {
        // Main series: mocks, an official paper (+ its mock copy), section & chapter tests.
        $main = [];
        foreach (range(1, 6) as $n) {
            $main[] = $this->test("Full Mock Test {$n}", ['mode' => 'full_mock', 'category' => 'Full Mock Tests', 'duration_sec' => 7200]);
        }
        $main[] = $official = $this->test('DSSSB TGT CS Official Paper — 24 June 2023 (Shift 3)', ['mode' => 'pyq', 'paper_type' => 'official', 'duration_sec' => 7200]);
        $main[] = $copy = $this->test('Full Mock Test 7 — Official Paper 24 June 2023 (Shift 3)', ['mode' => 'full_mock', 'category' => 'Full Mock Tests', 'duration_sec' => 7200]);
        $main[] = $this->test('Most Expected Questions — Set 1', ['mode' => 'full_mock', 'category' => 'Most Expected', 'duration_sec' => 3600]);
        $main[] = $this->test('Section Test — English Language 1', ['mode' => 'subject', 'duration_sec' => 1200]);
        $main[] = $this->test('Section Test — Hindi Language 1', ['mode' => 'subject', 'duration_sec' => 1200]);
        $main[] = $this->test('Chapter Test — Verbal Reasoning', ['mode' => 'chapter']);
        $main[] = $this->test('Chapter Test — Arithmetic', ['mode' => 'chapter']);
        $main[] = $draft = $this->test('Section Test — General Awareness 9', ['mode' => 'subject', 'status' => 'draft']);
        $main[] = $used = $this->test('Section Test — English Language 2', ['mode' => 'subject', 'duration_sec' => 1200, 'max_attempts' => 1]);
        $this->ids += ['official' => $official->id, 'copy' => $copy->id, 'draft_test' => $draft->id, 'used_up' => $used->id];

        // DBMS pack (free) + course.
        $pyq = $this->test('DBMS — Previous Year Questions (DSSSB 2023–24)', ['mode' => 'pyq', 'duration_sec' => 1380]);
        $p1 = $this->test('DBMS Practice — ER Model', ['duration_sec' => 1500]);
        $p2 = $this->test('DBMS Practice — Normalisation', ['duration_sec' => 1800]);
        $p3 = $this->test('DBMS Practice — SQL (Part 1)', ['duration_sec' => 2100]);
        $exp = $this->test('DBMS — 200 Most Expected Questions (Full Test)', ['mode' => 'subject', 'duration_sec' => 9000]);
        $dbmsDraft = $this->test('DBMS Practice — Indexing', ['status' => 'draft']);
        $packTests = [$pyq, $p1, $p2, $p3, $exp, $dbmsDraft];
        $this->series('DSSSB TGT CS — DBMS Complete (Notes + 200 Most Expected)', $packTests);
        $this->courseSubject('DBMS (Database Management System)', ['ER Model', 'Functional Dependencies & Normalisation', 'SQL']);
        $this->ids += ['dbms_er' => $p1->id, 'dbms_pyq' => $pyq->id];

        // OS pack sold as a PAID series: its tests are locked for this student.
        $osTests = [
            $this->test('OS — Previous Year Questions (DSSSB 2023–24)', ['mode' => 'pyq', 'is_free' => false]),
            $this->test('OS Practice — CPU Scheduling', ['is_free' => false]),
        ];
        $this->series('DSSSB TGT CS — OS Complete (Notes + 200 Most Expected)', $osTests, ['is_paid' => true, 'price' => 99]);
        $this->courseSubject('OS (Operating Systems)', ['CPU Scheduling'], 'OS — fast revision sheet (revise everything quickly)');
        $this->ids['os_locked'] = $osTests[1]->id;

        // (The paid OS tests are deliberately NOT in the free main series — a
        // test that is also in a free series would be open to everyone.)
        $this->series('DSSSB TGT Computer Science 2026 — Complete Test Series', array_merge($main, $packTests));
    }

    private function generate(array $overrides = [])
    {
        return $this->postJson('/api/study-plan/generate', array_merge(self::SETTINGS, $overrides));
    }

    private function signature(StudyPlan $plan): array
    {
        return $plan->tasks()->whereNull('done_at')->orderBy('date')->orderBy('slot')->orderBy('position')->get()
            ->map(fn ($t) => [$t->date->toDateString(), $t->slot, $t->position, $t->type, $t->ref_type, $t->ref_id, $t->minutes, $t->title])
            ->all();
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    public function test_show_without_a_plan_returns_defaults(): void
    {
        $this->actingAsStudent();

        $res = $this->getJson('/api/study-plan')->assertOk();
        $this->assertNull($res->json('plan'));
        $this->assertSame('2026-11-26', $res->json('defaults.exam_date'));
        $this->assertSame('2026-10-29', $res->json('today_date'));
        $this->assertContains('dbms', array_column($res->json('focus_options'), 'key'));
    }

    public function test_generation_is_deterministic_and_phased(): void
    {
        $user = $this->actingAsStudent();

        $res = $this->generate()->assertOk();
        $this->assertSame(29, $res->json('plan.days_left'));
        $this->assertNotEmpty($res->json('today'));
        $this->assertSame('2026-10-29', $res->json('today.0.date'));

        $plan = StudyPlan::where('user_id', $user->id)->firstOrFail();
        $first = $this->signature($plan);

        // Phases: 1 starts today, 3 covers the last 10 days up to the exam date.
        $phases = collect($plan->plan['phases'])->keyBy('phase');
        $this->assertSame('2026-10-29', $phases[1]['from']);
        $this->assertSame('2026-11-17', $phases[3]['from']);
        $this->assertSame('2026-11-26', $phases[3]['to']);
        $this->assertSame('2026-11-26', $plan->tasks()->orderByDesc('date')->first()->date->toDateString());

        // Weekdays have office + library slots, weekends only "weekend"; budgets respected.
        $tasks = $plan->tasks()->get();
        foreach ($tasks->groupBy(fn ($t) => $t->date->toDateString() . '|' . $t->slot) as $key => $group) {
            [$date, $slot] = explode('|', $key);
            $weekend = Carbon::parse($date)->isWeekend();
            $this->assertSame($weekend, $slot === 'weekend', $key);
            $budget = ['office' => 120, 'library' => 390, 'weekend' => 480][$slot];
            $this->assertLessThanOrEqual($budget, $group->sum('minutes'), $key);
        }
        // Office items are short (≤ 40 min).
        $this->assertLessThanOrEqual(40, $tasks->where('slot', 'office')->max('minutes'));

        // Notes come before the chapter's practice test.
        $order = $tasks->sortBy(fn ($t) => [$t->date->toDateString(), ['office' => 0, 'library' => 1, 'weekend' => 2][$t->slot], $t->position])->values();
        $notesIdx = $order->search(fn ($t) => $t->ref_type === 'material' && $t->ref_id === $this->ids['notes:ER Model'] && $t->type === 'notes');
        $testIdx = $order->search(fn ($t) => $t->ref_type === 'test' && $t->ref_id === $this->ids['dbms_er'] && $t->type === 'test');
        $this->assertNotFalse($notesIdx);
        $this->assertNotFalse($testIdx);
        $this->assertLessThan($testIdx, $notesIdx);

        // Every mock is followed by its "review wrong answers" task.
        foreach ($tasks->where('type', 'mock') as $mock) {
            $this->assertTrue($tasks->contains(fn ($t) => $t->type === 'review' && $t->ref_id === $mock->ref_id && $t->date->eq($mock->date)));
        }
        // Phase 3: a full-length paper every day; the official paper is used, its mock copy is not.
        foreach ($tasks->where('phase', 3)->groupBy(fn ($t) => $t->date->toDateString()) as $date => $day) {
            $this->assertTrue($day->contains('type', 'mock'), "no mock on {$date}");
        }
        $this->assertTrue($tasks->contains(fn ($t) => $t->type === 'mock' && $t->ref_id === $this->ids['official']));
        $this->assertFalse($tasks->contains(fn ($t) => $t->ref_type === 'test' && $t->ref_id === $this->ids['copy']));
        // Phase 2: two full mocks a week (Wednesday library + Saturday).
        $p2Mocks = $tasks->where('phase', 2)->where('type', 'mock');
        $this->assertNotEmpty($p2Mocks);
        $p2Mocks->each(fn ($m) => $this->assertTrue($m->date->isWednesday() || $m->date->isSaturday()));

        // Same "today" + same content → identical plan.
        $this->generate()->assertOk();
        $this->assertSame($first, $this->signature($plan->fresh()));
    }

    public function test_plan_never_schedules_content_the_user_cannot_open(): void
    {
        $user = $this->actingAsStudent();
        // The capped test has already been used up by this student.
        TestAttempt::create(['user_id' => $user->id, 'test_id' => $this->ids['used_up'], 'status' => 'completed', 'started_at' => now(), 'completed_at' => now()]);

        $this->generate()->assertOk();
        $tasks = StudyPlan::where('user_id', $user->id)->first()->tasks;
        $this->assertNotEmpty($tasks);

        $testIds = $tasks->where('ref_type', 'test')->pluck('ref_id')->unique();
        $this->assertNotContains($this->ids['os_locked'], $testIds);
        $this->assertNotContains($this->ids['draft_test'], $testIds);
        $this->assertNotContains($this->ids['used_up'], $testIds);
        $this->assertNotContains($this->ids['draft_material'], $tasks->where('ref_type', 'material')->pluck('ref_id'));

        foreach ($testIds as $id) {
            $test = Test::findOrFail($id);
            $this->assertSame('published', $test->status);
            // The student can really start it (no purchase / attempt-limit refusal).
            $this->postJson("/api/tests/{$id}/attempts")->assertOk();
            TestAttempt::where('user_id', $user->id)->where('test_id', $id)->where('status', 'ongoing')->update(['status' => 'completed', 'completed_at' => now()]);
        }
        foreach ($tasks->where('ref_type', 'material')->pluck('ref_id')->unique() as $id) {
            $this->getJson("/api/study-materials/{$id}")->assertOk();
        }
        foreach ($tasks as $t) {
            $expected = $t->ref_type === 'test' ? "/dashboard/tests/{$t->ref_id}" : "/dashboard/materials/{$t->ref_id}";
            $this->assertSame($expected, $t->link);
        }
        // The (unlocked) OS notes are still used even though its tests are paid.
        $this->assertTrue($tasks->contains(fn ($t) => $t->ref_id === $this->ids['notes:CPU Scheduling'] && $t->ref_type === 'material'));
    }

    public function test_task_completion_and_progress(): void
    {
        $user = $this->actingAsStudent();
        $this->generate()->assertOk();
        $task = StudyPlan::where('user_id', $user->id)->first()->tasks()->whereDate('date', '2026-10-29')->orderBy('position')->first();

        $res = $this->patchJson("/api/study-plan/tasks/{$task->id}", ['done' => true])->assertOk();
        $this->assertTrue($res->json('task.done'));
        $this->assertSame(1, $res->json('progress.done'));
        $this->assertGreaterThan(0, $res->json('today_progress.percent'));
        $this->assertNotNull($task->fresh()->done_at);

        $show = $this->getJson('/api/study-plan')->assertOk();
        $this->assertSame(1, $show->json('progress.done'));
        $this->assertTrue(collect($show->json('today'))->firstWhere('id', $task->id)['done']);

        $this->patchJson("/api/study-plan/tasks/{$task->id}", ['done' => false])->assertOk()->assertJsonPath('task.done', false);
        $this->assertNull($task->fresh()->done_at);

        // Someone else's task is not found.
        $this->actingAsStudent();
        $this->patchJson("/api/study-plan/tasks/{$task->id}", ['done' => true])->assertNotFound();
    }

    public function test_regenerate_keeps_done_tasks_and_does_not_repeat_them(): void
    {
        $user = $this->actingAsStudent();
        $this->generate()->assertOk();
        $plan = StudyPlan::where('user_id', $user->id)->first();
        $done = $plan->tasks()->where('type', 'notes')->orderBy('date')->orderBy('position')->first();
        $this->patchJson("/api/study-plan/tasks/{$done->id}", ['done' => true])->assertOk();

        // Next day, fewer hours.
        $this->travelTo(Carbon::parse('2026-10-30 04:30:00', 'UTC'));
        $res = $this->generate(['weekday_library_min' => 300])->assertOk();

        $this->assertNotNull(StudyPlanTask::find($done->id)?->done_at);
        $this->assertSame(1, $plan->tasks()->where('ref_type', 'material')->where('ref_id', $done->ref_id)->where('type', 'notes')->count());
        $this->assertSame(0, $plan->tasks()->whereNull('done_at')->whereDate('date', '<', '2026-10-30')->count());
        $this->assertSame(300, $res->json('plan.weekday_library_min'));
        $this->assertSame(1, $res->json('progress.done'));
    }

    public function test_weak_sections_and_new_packs_are_picked_up(): void
    {
        $user = $this->actingAsStudent();
        $mock = Test::where('name_en', 'Full Mock Test 1')->first();
        TestAttempt::create([
            'user_id' => $user->id, 'test_id' => $mock->id, 'status' => 'completed',
            'started_at' => now(), 'completed_at' => now(),
            'metadata' => ['sectional_stats' => [
                'English Language'  => ['correct' => 0, 'incorrect' => 8, 'total' => 20, 'marks' => -2],
                'Hindi Language'    => ['correct' => 18, 'incorrect' => 0, 'total' => 20, 'marks' => 18],
                'Computer Science'  => ['correct' => 60, 'incorrect' => 10, 'total' => 90, 'marks' => 57.5],
            ]],
        ]);

        // A Reasoning pack published later is used without any code change.
        $r = $this->test('Reasoning Practice — Coding-Decoding', ['duration_sec' => 1200]);
        $this->series('DSSSB TGT CS — Reasoning Complete (Notes + 200 Most Expected)', [$r]);

        // Generate on a Sunday so the first day is a weak-area day.
        $this->travelTo(Carbon::parse('2026-11-01 04:30:00', 'UTC'));
        $res = $this->generate()->assertOk();
        $plan = StudyPlan::where('user_id', $user->id)->first();

        $this->assertContains('reasoning', array_column($plan->plan['subjects'], 'key'));
        $this->assertTrue($plan->tasks()->where('ref_type', 'test')->where('ref_id', $r->id)->exists());
        // The completed mock is not given again as a fresh mock.
        $this->assertFalse($plan->tasks()->where('title', 'Full mock: Full Mock Test 1')->exists());

        $weights = $plan->settings['section_weights'];
        $this->assertGreaterThan($weights['hindi'], $weights['english']);
        $labels = $plan->plan['day_labels'];
        $this->assertNotEmpty($labels);
        $this->assertStringContainsString('English', $labels['2026-11-01'] ?? '');
        $firstSunday = $plan->tasks()->whereDate('date', '2026-11-01')->orderBy('position')->first();
        $this->assertStringContainsString('English', $firstSunday->title);
        $this->assertSame(0.0, (float) $plan->plan['sections'][array_search('english', array_column($plan->plan['sections'], 'key'))]['score_percent']);
        $this->assertNotEmpty($res->json('week'));
    }

    public function test_validation(): void
    {
        $this->actingAsStudent();
        $this->generate(['exam_date' => '2026-10-01'])->assertStatus(422)->assertJsonValidationErrors('exam_date');
        $this->generate(['weekday_office_min' => -5])->assertStatus(422);
        $this->getJson('/api/study-plan')->assertOk()->assertJsonPath('plan', null);
    }
}
