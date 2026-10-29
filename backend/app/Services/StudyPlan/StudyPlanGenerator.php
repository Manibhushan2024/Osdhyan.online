<?php

namespace App\Services\StudyPlan;

use App\Models\StudyPlan;
use App\Models\StudyPlanTask;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Builds a day-by-day DSSSB TGT CS plan from "today" to the exam date.
 *
 *   Phase 1  learn + practise — subject by subject (heaviest / weakest first):
 *            chapter notes PDF, then that chapter's practice tests, then the
 *            subject's PYQ test. One full mock every Saturday, a weak-area day
 *            every Sunday.
 *   Phase 2  mixed practice — section-wise / chapter-wise tests and notes
 *            revision picked by weight, 2 full mocks a week (Wednesday library
 *            + Saturday), each followed by "review wrong answers".
 *   Phase 3  last 10 days — a full mock + review every day (two on weekends),
 *            official PYQ papers and fast-revision sheets.
 *
 * Slots: office (weekday, short 15–40-minute items), library (weekday
 * before / after work), weekend. Each slot has clock windows (the plan's
 * `timetable`); tasks are laid into them in order by SlotLayout, with a
 * 10-minute break after 90 minutes in a row in the library / at weekends.
 *
 * No finished full-length mock yet → the first library / weekend window gets
 * a baseline mock + review. After mocks, sections are weighted by the latest
 * mock's section scores (lower score → more time).
 *
 * Deterministic for a given user, content, "today" and time of day.
 */
class StudyPlanGenerator
{
    public const PHASE3_DAYS = 10;

    /** Section B (deep study in library/weekend hours) and Section A (short office slots). */
    public const SECTION_B = ['cs', 'teaching'];
    public const SECTION_A = ['ga', 'reasoning', 'arithmetic', 'hindi', 'english'];

    /**
     * Order of the Computer Science packs: by how many questions the 2023–24
     * DSSSB TGT CS papers asked (programming and DBMS most), the broad
     * fundamentals/teaching pack last.
     */
    public const CS_ORDER = ['programming', 'dbms', 'network', 'os', 'dsa', 'fundamental'];
    public const PHASE1_SHARE = 0.6;     // max share of the pre-phase-3 days spent in phase 1
    public const NOTES_MIN = 40;
    public const REVIEW_MIN = 45;
    public const SHEET_MIN = 40;
    public const REVISE_MIN = 30;
    public const OFFICE_MAX = 40;
    public const MIN_ITEM = 15;
    public const FULL_LENGTH_QUESTIONS = 150;
    public const MAX_WINDOWS = 4;
    public const BASELINE_TITLE = 'Baseline mock — find your weak sections';
    public const BASELINE_REVIEW_TITLE = 'Review the baseline: wrong answers + Revise this concept';

    /** Clock windows per slot: lunch hour + last office hour; 3 h before office + 3.5 h after; 10 h at weekends. */
    public const DEFAULT_TIMETABLE = [
        'office'  => [['13:00', '14:00'], ['17:00', '18:00']],
        'library' => [['05:30', '08:30'], ['19:00', '22:30']],
        'weekend' => [['07:00', '13:00'], ['15:00', '19:00']],
    ];

    public const DEFAULTS = [
        'exam_date'           => '2026-11-26',
        'weekday_office_min'  => 120,
        'weekday_library_min' => 390,
        'weekend_min'         => 480,
        'timetable'           => self::DEFAULT_TIMETABLE,
    ];

    private ContentCatalog $catalog;
    private array $sectionWeights = [];
    private array $sectionFactors = [];
    private array $sectionStats = [];
    private array $packOrder = [];
    private array $focus = [];

    private array $learn = [];
    private array $mixed = [];
    private array $mockPool = [];
    private array $paperPool = [];
    private array $sheets = [];
    private array $revisions = [];
    private array $pyqNotes = [];
    private array $fullTests = [];
    private array $retry = [];
    private int $sheetIdx = 0;
    private int $pyqIdx = 0;
    private array $revisionIdx = [];
    private array $picks = [];
    private array $readyUnits = [];
    private array $plannedTests = [];
    private array $doneRefs = [];
    private array $todayRefs = [];
    private array $dayLabels = [];
    private array $timetable = [];
    private array $mockStats = [];       // section => 0..1 from the latest full mock
    private ?array $latestMock = null;
    private bool $needBaseline = false;
    private ?array $baseline = null;     // the mock picked as the baseline
    private ?array $baselinePlaced = null;

    /**
     * (Re)generate the user's plan from $today. Done tasks are kept as
     * history; everything not done is replaced.
     */
    public function generate(User $user, array $input, CarbonInterface $today, ?CarbonInterface $now = null): StudyPlan
    {
        $today = CarbonImmutable::parse($today->toDateString());
        // Student's clock: today's windows (or the parts of them) already gone are skipped.
        $nowMinute = $now && $now->toDateString() === $today->toDateString()
            ? (int) (ceil(($now->hour * 60 + $now->minute) / 5) * 5)
            : null;
        $examDate = CarbonImmutable::parse($input['exam_date'] ?? self::DEFAULTS['exam_date']);
        $office = (int) ($input['weekday_office_min'] ?? self::DEFAULTS['weekday_office_min']);
        $library = (int) ($input['weekday_library_min'] ?? self::DEFAULTS['weekday_library_min']);
        $weekend = (int) ($input['weekend_min'] ?? self::DEFAULTS['weekend_min']);
        $this->focus = array_values(array_unique(array_map('strval', $input['focus'] ?? [])));

        $this->reset();
        $this->catalog = ContentCatalog::build($user);

        return DB::transaction(function () use ($user, $input, $today, $nowMinute, $examDate, $office, $library, $weekend) {
            $plan = StudyPlan::firstOrNew(['user_id' => $user->id]);
            // No timetable sent → keep the plan's own, else the defaults.
            $this->timetable = self::normalizeTimetable($input['timetable'] ?? ($plan->settings['timetable'] ?? null) ?? self::DEFAULT_TIMETABLE);
            $plan->fill([
                'exam_date'           => $examDate->toDateString(),
                'weekday_office_min'  => $office,
                'weekday_library_min' => $library,
                'weekend_min'         => $weekend,
            ]);
            $plan->save();

            // Keep done tasks as history; drop everything else.
            $plan->tasks()->whereNull('done_at')->delete();
            $kept = $plan->tasks()->get(['id', 'date', 'slot', 'position', 'type', 'ref_type', 'ref_id', 'end_time']);
            $busyUntil = [];   // today: ticked tasks keep their time; new ones go after them
            foreach ($kept as $t) {
                if ($t->ref_type && $t->ref_id && $t->type !== 'review') {
                    $this->doneRefs[$t->ref_type . ':' . $t->ref_id] = true;
                }
                $end = SlotLayout::minute($t->end_time);
                if ($end !== null && $t->date->toDateString() === $today->toDateString()) {
                    $busyUntil[$t->slot] = max($busyUntil[$t->slot] ?? 0, $end);
                }
            }

            $this->readMockHistory($user);
            $this->computeWeights($user);
            $this->buildPools();

            $rows = $this->schedule($today, $examDate, $office, $library, $weekend, $nowMinute, $busyUntil);

            // Positions continue after any kept (done) tasks on the same day/slot.
            $offsets = [];
            foreach ($kept as $t) {
                $k = $t->date->toDateString() . '|' . $t->slot;
                $offsets[$k] = max($offsets[$k] ?? 0, $t->position + 1);
            }
            $now = now();
            $insert = [];
            foreach ($rows as $r) {
                $k = $r['date'] . '|' . $r['slot'];
                $r['position'] += $offsets[$k] ?? 0;
                $insert[] = $r + ['plan_id' => $plan->id, 'created_at' => $now, 'updated_at' => $now];
            }
            foreach (array_chunk($insert, 300) as $chunk) {
                StudyPlanTask::insert($chunk);
            }

            $plan->settings = [
                'focus'           => $this->focus,
                'timetable'       => $this->timetable,
                'latest_mock'     => $this->latestMock,
                'section_weights' => $this->sectionWeights,
                'section_scores'  => $this->sectionStats,
                'content_notes'   => array_values($this->catalog->notes),
                'main_series_id'  => $this->catalog->mainSeriesId,
            ];
            $plan->plan = $this->summary($today, $examDate, $rows);
            $plan->generated_at = now();
            $plan->save();

            return $plan->fresh();
        });
    }

    private function reset(): void
    {
        foreach (['sectionWeights', 'sectionFactors', 'sectionStats', 'packOrder', 'learn', 'mixed', 'mockPool',
            'paperPool', 'sheets', 'revisions', 'revisionIdx', 'picks', 'readyUnits', 'plannedTests',
            'doneRefs', 'todayRefs', 'dayLabels', 'pyqNotes', 'fullTests', 'retry', 'mockStats'] as $p) {
            $this->{$p} = [];
        }
        $this->sheetIdx = 0;
        $this->pyqIdx = 0;
        $this->latestMock = null;
        $this->needBaseline = false;
        $this->baseline = null;
        $this->baselinePlaced = null;
    }

    // ─── Timetable ────────────────────────────────────────────────────────────

    /**
     * Valid windows per slot, sorted by start: {office: [["13:00","14:00"], …], …}.
     * A slot missing from $timetable gets its default; invalid windows are dropped.
     */
    public static function normalizeTimetable(?array $timetable): array
    {
        $out = [];
        foreach (StudyPlanTask::SLOTS as $slot) {
            $list = is_array($timetable) && array_key_exists($slot, $timetable) ? $timetable[$slot] : self::DEFAULT_TIMETABLE[$slot];
            $windows = [];
            foreach ((array) $list as $w) {
                if (!is_array($w) || count($w) < 2) {
                    continue;
                }
                [$start, $end] = array_values($w);
                $s = SlotLayout::minute($start);
                $e = SlotLayout::minute($end);
                if ($s !== null && $e !== null && $s < $e) {
                    $windows[] = [$start, $end];
                }
            }
            usort($windows, fn ($a, $b) => strcmp($a[0], $b[0]));
            $out[$slot] = array_slice($windows, 0, self::MAX_WINDOWS);
        }

        return $out;
    }

    /** Minutes the timetable gives each slot (before breaks). */
    public static function windowMinutes(array $timetable): array
    {
        $out = [];
        foreach ($timetable as $slot => $windows) {
            $out[$slot] = SlotLayout::total(array_map(fn ($w) => [SlotLayout::minute($w[0]), SlotLayout::minute($w[1])], $windows));
        }

        return $out;
    }

    /** One slot's windows as a layout; $from (today: now / after ticked tasks) cuts off what is gone. */
    private function layout(string $slot, int $budget, int $from = 0): SlotLayout
    {
        $windows = [];
        foreach ($this->timetable[$slot] ?? [] as [$start, $end]) {
            $s = max((int) SlotLayout::minute($start), $from);
            $e = (int) SlotLayout::minute($end);
            if ($e - $s >= self::MIN_ITEM) {
                $windows[] = [$s, $e];
            }
        }

        return new SlotLayout($windows, $slot !== 'office', $budget);
    }

    // ─── Weights ──────────────────────────────────────────────────────────────

    /**
     * Section weight = marks × weakness factor × latest-mock factor (× 1.5
     * when in focus). The weakness factor comes from the user's completed
     * attempts that carry per-section results: 0.5 (all right) … 1.5 (nothing
     * right); 1.0 without data. The latest-mock factor uses the same scale on
     * the newest full mock's section scores, so the plan re-weights after
     * every mock.
     */
    private function computeWeights(User $user): void
    {
        $agg = [];
        $attempts = TestAttempt::where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderByDesc('id')
            ->limit(30)
            ->get(['id', 'metadata']);

        foreach ($attempts as $a) {
            foreach (self::sectionScores($a->metadata ?? [], false) as $key => [$marks, $max]) {
                $agg[$key]['marks'] = ($agg[$key]['marks'] ?? 0) + $marks;
                $agg[$key]['max'] = ($agg[$key]['max'] ?? 0) + $max;
            }
        }

        foreach (ContentCatalog::SECTIONS as $key => [$label, $marks]) {
            $factor = 1.0;
            if (!empty($agg[$key]['max'])) {
                $ratio = max(0.0, min(1.0, $agg[$key]['marks'] / $agg[$key]['max']));
                $this->sectionStats[$key] = round($ratio * 100, 1);
                $factor = 1.5 - $ratio;
            }
            // Re-weighting by the latest full mock: 0% → ×1.5 … 100% → ×0.5.
            if (isset($this->mockStats[$key])) {
                $factor *= 1.5 - $this->mockStats[$key];
            }
            if (in_array($key, $this->focus, true)) {
                $factor *= 1.5;
            }
            $this->sectionFactors[$key] = $factor;
            $this->sectionWeights[$key] = round($marks * $factor, 2);
        }
    }

    /**
     * Section key => [marks, max marks] from an attempt's metadata. The mock
     * re-weighting reads section_results first (exam sections), the overall
     * weighting sectional_stats first (question subjects).
     */
    private static function sectionScores(array $meta, bool $sectionsFirst): array
    {
        $fromStats = function () use ($meta) {
            $rows = [];
            foreach ((array) ($meta['sectional_stats'] ?? []) as $name => $s) {
                $rows[] = ['name' => (string) $name, 'marks' => $s['marks'] ?? null, 'max' => $s['total'] ?? null, 'correct' => $s['correct'] ?? 0];
            }

            return $rows;
        };
        $fromResults = function () use ($meta) {
            $rows = [];
            foreach ((array) ($meta['section_results'] ?? []) as $s) {
                $rows[] = ['name' => (string) ($s['name_en'] ?? $s['key'] ?? ''), 'marks' => $s['marks'] ?? null, 'max' => $s['max_marks'] ?? $s['total'] ?? null, 'correct' => $s['correct'] ?? 0];
            }

            return $rows;
        };
        $rows = $sectionsFirst ? ($fromResults() ?: $fromStats()) : ($fromStats() ?: $fromResults());

        $out = [];
        foreach ($rows as $r) {
            $key = ContentCatalog::sectionKey($r['name']);
            $max = (float) ($r['max'] ?? 0);
            if (!$key || $max <= 0) {
                continue;
            }
            $marks = $r['marks'] !== null ? (float) $r['marks'] : (float) $r['correct'];
            $out[$key][0] = ($out[$key][0] ?? 0) + $marks;
            $out[$key][1] = ($out[$key][1] ?? 0) + $max;
        }

        return $out;
    }

    /**
     * Full-length (≥ 150 questions) DSSSB attempts, newest first: none → the
     * plan opens with a baseline mock; the newest one with section scores
     * re-weights the sections.
     */
    private function readMockHistory(User $user): void
    {
        $ids = array_keys($this->catalog->completedTestIds);
        $found = false;
        if ($ids) {
            $questions = DB::table('question_test')->whereIn('test_id', $ids)
                ->selectRaw('test_id, COUNT(*) AS n')->groupBy('test_id')->pluck('n', 'test_id');
            $titles = Test::whereIn('id', $ids)->pluck('name_en', 'id');
            $attempts = TestAttempt::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereIn('test_id', $ids)
                ->orderByDesc('id')
                ->get(['id', 'test_id', 'metadata', 'completed_at']);

            foreach ($attempts as $a) {
                $meta = $a->metadata ?? [];
                $count = max((int) ($meta['total_questions'] ?? 0), (int) ($questions[$a->test_id] ?? 0));
                if ($count < self::FULL_LENGTH_QUESTIONS) {
                    continue;
                }
                $found = true;
                $scores = self::sectionScores($meta, true);
                if (!$scores) {
                    continue;
                }
                $percent = [];
                foreach ($scores as $key => [$marks, $max]) {
                    $this->mockStats[$key] = max(0.0, min(1.0, $marks / $max));
                    $percent[$key] = round($this->mockStats[$key] * 100, 1);
                }
                $this->latestMock = [
                    'attempt_id' => (int) $a->id,
                    'test_id'    => (int) $a->test_id,
                    'title'      => (string) ($titles[$a->test_id] ?? 'Full mock'),
                    'date'       => $a->completed_at?->toDateString(),
                    'sections'   => $percent,
                ];
                break;
            }
        }
        $this->needBaseline = !$found;
    }

    /** Position of a Section B pack in CS_ORDER (Section A packs sort after, by weight). */
    private function csRank(array $pack): int
    {
        if (!in_array($pack['section'], self::SECTION_B, true)) {
            return 100;
        }
        $key = strtolower($pack['key'] . ' ' . ($pack['label'] ?? ''));
        foreach (self::CS_ORDER as $i => $needle) {
            if (str_contains($key, $needle)) {
                return $i;
            }
        }

        return 50;
    }

    private function packWeight(array $pack): float
    {
        $section = $pack['section'];
        $siblings = collect($this->catalog->packs)->where('section', $section)->count() ?: 1;
        $w = ($this->sectionWeights[$section] ?? 10) / $siblings;
        if ($pack['has_teaching']) {
            $w += $this->sectionWeights['teaching'] ?? 0;
        }
        if (in_array($pack['key'], $this->focus, true)) {
            $w *= 1.5;
        }

        return $w;
    }

    // ─── Pools ────────────────────────────────────────────────────────────────

    private function buildPools(): void
    {
        $c = $this->catalog;
        $packs = array_values($c->packs);
        $index = array_flip(array_keys($c->packs));
        usort($packs, function ($a, $b) use ($index) {
            $fa = in_array($a['key'], $this->focus, true) || in_array($a['section'], $this->focus, true) ? 0 : 1;
            $fb = in_array($b['key'], $this->focus, true) || in_array($b['section'], $this->focus, true) ? 0 : 1;

            return [$fa, $this->csRank($a), -$this->packWeight($a), $index[$a['key']]] <=> [$fb, $this->csRank($b), -$this->packWeight($b), $index[$b['key']]];
        });
        $this->packOrder = array_column($packs, 'key');

        foreach ($packs as $pack) {
            $key = $pack['key'];
            foreach ($pack['units'] as $unit) {
                $needs = null;
                if ($unit['notes'] && !isset($this->doneRefs['material:' . $unit['notes']['id']])) {
                    $this->learn[] = $this->item('notes', "Read notes: {$unit['title']} ({$pack['label']})", self::NOTES_MIN,
                        'material', $unit['notes']['id'], $key, $pack['section'], unit: $unit['key']);
                    $needs = $unit['key'];
                } elseif (!$unit['notes'] && !empty($unit['chapter'])) {
                    $ch = $unit['chapter'];
                    if (!isset($this->doneRefs['chapter:' . $ch['id']])) {
                        $this->learn[] = $this->item('notes', "Study chapter: {$unit['title']} ({$pack['label']})", self::NOTES_MIN,
                            'chapter', $ch['id'], $key, $pack['section'], unit: $unit['key'],
                            link: '/dashboard/courses/' . strtolower(ContentCatalog::COURSE_CATEGORY) . "/{$ch['subject_id']}?chapter={$ch['id']}");
                        $needs = $unit['key'];
                    }
                }
                foreach ($unit['tests'] as $t) {
                    if ($this->isNewTest($t['id'])) {
                        $this->learn[] = $this->testItem('test', "Practice test: {$t['title']}", $t, $key, $pack['section'], $needs);
                    }
                    $this->retry[] = ['section' => $pack['section'], 'pack' => $key] + $t;
                }
                if ($unit['notes']) {
                    $this->revisions[$pack['section']][] = $this->item('revision', "Revise: {$unit['title']} notes ({$pack['label']})",
                        self::REVISE_MIN, 'material', $unit['notes']['id'], $key, $pack['section']);
                }
            }
            foreach ($pack['pyq'] as $t) {
                if ($this->isNewTest($t['id'])) {
                    $this->learn[] = $this->testItem('test', "PYQ test: {$t['title']}", $t, $key, $pack['section']);
                }
                $this->retry[] = ['section' => $pack['section'], 'pack' => $key] + $t;
            }
            if ($sheet = $pack['fast_sheet']) {
                $this->sheets[] = $this->item('revision', "Fast revision: {$sheet['title']}", self::SHEET_MIN,
                    'material', $sheet['id'], $key, $pack['section']);
            } elseif ($sheet = $pack['complete']) {
                $this->sheets[] = $this->item('revision', "Quick skim: {$sheet['title']}", self::SHEET_MIN,
                    'material', $sheet['id'], $key, $pack['section']);
            }
            if ($notes = $pack['pyq_notes']) {
                $this->pyqNotes[] = $this->item('revision', "PYQ revision: {$notes['title']}", self::SHEET_MIN,
                    'material', $notes['id'], $key, $pack['section']);
            }
            foreach ($pack['expected'] as $t) {
                if ($this->isNewTest($t['id'])) {
                    $this->fullTests[] = ['test' => ['pack' => $key] + $t, 'title' => "Full-length subject test: {$t['title']}"];
                }
            }
        }

        foreach ($c->mixedTests as $t) {
            if ($this->isNewTest($t['id'])) {
                $prefix = preg_match('/^section/i', $t['title']) ? 'Section practice' : 'Mixed practice';
                $this->mixed[] = $this->testItem('test', "{$prefix}: {$t['title']}", $t, $t['section'], $t['section']);
            }
            $this->retry[] = $t;
        }

        foreach ($c->mocks as $t) {
            if ($this->isNewTest($t['id'])) {
                $this->mockPool[] = ['test' => $t, 'title' => "Full mock: {$t['title']}"];
            }
        }
        foreach ($c->expectedSets as $t) {
            if ($this->isNewTest($t['id'])) {
                $this->mockPool[] = ['test' => $t, 'title' => "Full-length practice: {$t['title']}"];
            }
        }
        foreach ($c->officialPapers as $t) {
            if ($this->isNewTest($t['id'])) {
                $this->paperPool[] = ['test' => $t, 'title' => "PYQ paper (full mock): {$t['title']}"];
            }
        }

        if ($this->needBaseline) {
            $this->pickBaseline();
        }
    }

    /**
     * Baseline: the earliest unused sectioned "Full Mock Test N" with N ≥ 5
     * (1–4 re-use official papers); failing that, another fresh full mock.
     */
    private function pickBaseline(): void
    {
        $best = null;
        $bestKey = null;
        foreach ($this->mockPool as $i => $m) {
            $title = $m['test']['title'];
            if (preg_match('/official/i', $title) || !preg_match('/^full mock test\s*(\d+)/i', $title, $mm)) {
                continue;
            }
            $n = (int) $mm[1];
            $key = [$n >= 5 ? 0 : 1, empty($m['test']['sectioned']) ? 1 : 0, $n, $m['test']['id']];
            if ($bestKey === null || $key < $bestKey) {
                $best = $i;
                $bestKey = $key;
            }
        }
        $best ??= array_key_first($this->mockPool);
        if ($best === null) {
            return;
        }
        $m = $this->mockPool[$best];
        array_splice($this->mockPool, $best, 1);
        $this->baseline = ['test' => $m['test'], 'title' => self::BASELINE_TITLE];
    }

    private function isNewTest(int $id): bool
    {
        return !isset($this->catalog->completedTestIds[$id]) && !isset($this->doneRefs['test:' . $id]);
    }

    private function item(string $type, string $title, int $minutes, string $refType, int $refId, ?string $subject, ?string $section, ?string $unit = null, ?string $needs = null, ?string $link = null): array
    {
        return [
            'type'        => $type,
            'title'       => mb_substr($title, 0, 255),
            'minutes'     => $minutes,
            'ref_type'    => $refType,
            'ref_id'      => $refId,
            'link'        => $link ?? ($refType === 'test' ? "/dashboard/tests/{$refId}" : "/dashboard/materials/{$refId}"),
            'subject_key' => $subject,
            'section'     => $section,
            'unit'        => $unit,
            'needs'       => $needs,
        ];
    }

    private function testItem(string $type, string $title, array $t, ?string $subject, ?string $section, ?string $needs = null): array
    {
        // Test time plus a few minutes to check the solutions, rounded to 5.
        $minutes = max(self::MIN_ITEM, (int) (ceil(($t['duration_min'] + 5) / 5) * 5));

        return $this->item($type, $title, $minutes, 'test', $t['id'], $subject, $section, needs: $needs);
    }

    // ─── Scheduling ───────────────────────────────────────────────────────────

    private function schedule(CarbonImmutable $today, CarbonImmutable $exam, int $office, int $library, int $weekend, ?int $nowMinute, array $busyUntil): array
    {
        $rows = [];
        if ($exam->lt($today)) {
            return $rows;
        }
        $n = $today->diffInDays($exam) + 1;
        $p3Start = max(0, $n - self::PHASE3_DAYS);
        $p1Max = $p3Start > 0 ? max(1, (int) ceil($p3Start * self::PHASE1_SHARE)) : 0;
        $phase = $p3Start > 0 ? 1 : 3;

        for ($i = 0; $i < $n; $i++) {
            $date = $today->addDays($i);
            if ($i >= $p3Start) {
                if ($phase !== 3) {
                    $this->mixed = array_merge($this->learn, $this->mixed);
                    $this->learn = [];
                }
                $phase = 3;
            } elseif ($phase === 1 && ($this->learn === [] || $i >= $p1Max)) {
                $phase = 2;
                $this->mixed = array_merge($this->learn, $this->mixed);
                $this->learn = [];
            }

            $this->todayRefs = [];
            $ds = $date->toDateString();
            // Today: start after "now" and after tasks already ticked today.
            $from = fn (string $slot) => $i === 0 ? max($nowMinute ?? 0, $busyUntil[$slot] ?? 0) : 0;
            $slots = [];
            if ($date->isWeekend()) {
                $slots['weekend'] = $this->planWeekend($phase, $date, $this->layout('weekend', $weekend, $from('weekend')));
            } else {
                $slots['office'] = $this->planOffice($phase, $this->layout('office', $office, $from('office')));
                $slots['library'] = $this->planLibrary($phase, $date, $this->layout('library', $library, $from('library')));
            }

            foreach ($slots as $slot => $items) {
                foreach (array_values($items) as $pos => $it) {
                    $rows[] = [
                        'date'        => $ds,
                        'slot'        => $slot,
                        'position'    => $pos,
                        'start_time'  => $it['start_time'],
                        'end_time'    => $it['end_time'],
                        'type'        => $it['type'],
                        'title'       => $it['title'],
                        'minutes'     => $it['minutes'],
                        'ref_type'    => $it['ref_type'],
                        'ref_id'      => $it['ref_id'],
                        'link'        => $it['link'],
                        'subject_key' => $it['subject_key'],
                        'phase'       => $phase,
                    ];
                }
            }
        }

        return $rows;
    }

    private function planOffice(int $phase, SlotLayout $lay): array
    {
        $out = [];
        $step = 0;
        $this->fill($out, $lay, function (int $max) use ($phase, &$step) {
            $max = min($max, self::OFFICE_MAX);

            return match ($phase) {
                // Office: Section A chapter notes and practice tests (short, interruptible).
                1       => $this->takeLearn($max, 8, self::SECTION_A) ?? $this->takeLearn($max, 8) ?? $this->takeMixed($max) ?? $this->takeRevision($max),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $max),
                default => $this->takeSheet($max) ?? $this->takeRevision($max) ?? $this->takeRetry($max),
            };
        });

        return $out;
    }

    private function planLibrary(int $phase, CarbonImmutable $date, SlotLayout $lay): array
    {
        $out = [];
        $baseline = $this->addBaseline($out, $lay, $date);

        if ($phase === 3) {
            if (!$baseline) {
                $this->addFullLength($out, $lay, true);
            }
            $this->fill($out, $lay, fn (int $m) => $this->takeRotating($this->pyqNotes, $this->pyqIdx, $m), 1);
            $this->fill($out, $lay, fn (int $m) => $this->takeSheet($m), 1);
        } elseif ($phase === 2 && !$baseline) {
            if ($date->isWednesday()) {
                $this->addFullLength($out, $lay, false);
            } else {
                $this->addSubjectTest($out, $lay);
            }
        }

        $step = 0;
        $this->fill($out, $lay, function (int $max) use ($phase, &$step) {
            $cap = min($max, self::OFFICE_MAX);

            return match ($phase) {
                // Library: Section B learning (core Computer Science first).
                1       => $this->takeLearn($max, 12, self::SECTION_B) ?? $this->takeLearn($max, 12) ?? $this->takeMixed($max) ?? $this->takeRevision($cap) ?? $this->takeRetry($max),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $max),
                default => $this->takeCycle(['revision', 'retry'], $step++, $cap),
            };
        });

        return $out;
    }

    private function planWeekend(int $phase, CarbonImmutable $date, SlotLayout $lay): array
    {
        $out = [];
        $baseline = $this->addBaseline($out, $lay, $date);

        if ($phase === 3) {
            if (!$baseline) {
                $this->addFullLength($out, $lay, true);
            }
            $this->addFullLength($out, $lay, true);
            $this->fill($out, $lay, fn (int $m) => $this->takeSheet($m), 1);
        } elseif ($date->isSaturday()) {
            if (!$baseline) {
                $this->addFullLength($out, $lay, false);
            }
        } else {
            $this->weakAreaDay($out, $lay, $date);
        }

        $step = 0;
        $this->fill($out, $lay, function (int $max) use ($phase, &$step) {
            $cap = min($max, self::OFFICE_MAX);

            return match ($phase) {
                // Weekend: Section B with a Section A item every third pick.
                1       => ($step++ % 3 === 2 ? $this->takeLearn(min($max, $cap), 12, self::SECTION_A) : $this->takeLearn($max, 12, self::SECTION_B))
                    ?? $this->takeLearn($max, 12) ?? $this->takeMixed($max) ?? $this->takeRevision($cap) ?? $this->takeRetry($max),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $max),
                default => $this->takeSheet($cap) ?? $this->takeCycle(['revision', 'retry'], $step++, $cap),
            };
        });

        return $out;
    }

    /**
     * Keep taking items while something fits: first one that fits the rest
     * of the current window, else one for a later (longer) window.
     */
    private function fill(array &$out, SlotLayout $lay, callable $pick, int $limit = PHP_INT_MAX): int
    {
        $n = 0;
        while ($n < $limit && ($it = $this->takeFitting($lay, $pick))) {
            $this->push($out, $lay, $it);
            $n++;
        }

        return $n;
    }

    private function takeFitting(SlotLayout $lay, callable $pick): ?array
    {
        $room = $lay->room();
        if ($room < self::MIN_ITEM) {
            return null;
        }
        $current = $lay->currentRoom();
        $it = $current >= self::MIN_ITEM ? $pick($current) : null;
        if (!$it && $room > $current) {
            $it = $pick($room);
        }

        return $it;
    }

    /** Give the item its clock time and add it. */
    private function push(array &$out, SlotLayout $lay, array $it): void
    {
        [$it['start_time'], $it['end_time']] = $lay->place($it['minutes']);
        $out[] = $it;
    }

    /** Take from the pool named by the cycle position, falling back to the others. */
    private function takeCycle(array $kinds, int $step, int $max): ?array
    {
        $first = $kinds[$step % count($kinds)];
        foreach (array_unique(array_merge([$first], $kinds)) as $kind) {
            $it = match ($kind) {
                'mixed'    => $this->takeMixed($max),
                'revision' => $this->takeRevision(min($max, self::OFFICE_MAX)),
                'retry'    => $this->takeRetry($max),
                default    => null,
            };
            if ($it) {
                return $it;
            }
        }

        return null;
    }

    /** Sunday in phases 1–2: up to 5 items for the weakest sections first. */
    private function weakAreaDay(array &$out, SlotLayout $lay, CarbonImmutable $date): void
    {
        $ranked = array_keys(ContentCatalog::SECTIONS);
        usort($ranked, fn ($a, $b) => [-$this->sectionFactors[$a], -ContentCatalog::SECTIONS[$a][1], $a]
            <=> [-$this->sectionFactors[$b], -ContentCatalog::SECTIONS[$b][1], $b]);

        // Without attempt data every factor is equal; rotate through Section A
        // subjects week by week (CS is covered every day anyway).
        if (!$this->sectionStats && !$this->mockStats) {
            $ranked = array_values(array_filter($ranked, fn ($s) => !in_array($s, ['cs', 'teaching'], true)));
            $shift = ((int) floor($date->dayOfYear / 7)) % max(1, count($ranked));
            $ranked = array_merge(array_slice($ranked, $shift), array_slice($ranked, 0, $shift), ['teaching', 'cs']);
        }

        $used = [];
        $count = 0;
        foreach ($ranked as $section) {
            while ($count < 5) {
                $it = $this->takeFitting($lay, fn (int $m) => $this->takeLearn($m, 40, $section)
                    ?? $this->takeFrom($this->mixed, $m, $section)
                    ?? $this->takeRetry($m, $section));
                if (!$it) {
                    break;
                }
                $this->push($out, $lay, $it);
                $used[$section] = true;
                $count++;
            }
            if ($count >= 5 || count($used) >= 2) {
                break;
            }
        }
        if ($used) {
            $labels = array_map(fn ($s) => ContentCatalog::sectionLabel($s), array_keys($used));
            $this->dayLabels[$date->toDateString()] = 'Weak-area day: ' . implode(' + ', $labels);
        }
    }

    /**
     * Room for a full-length paper and its review: the paper inside one
     * window (the review may follow in a later one). When no window is long
     * enough at all, the paper starts at the start of the longest window.
     */
    private function canHost(SlotLayout $lay, int $minutes): bool
    {
        if ($lay->left() < $minutes + self::REVIEW_MIN) {
            return false;
        }
        if ($lay->fitsAll([$minutes, self::REVIEW_MIN])) {
            return true;
        }

        return $lay->isEmpty() && $lay->longest() > 0 && $lay->longest() < $minutes;
    }

    /** No finished full mock yet: the first library / weekend window gets the baseline mock. */
    private function addBaseline(array &$out, SlotLayout $lay, CarbonImmutable $date): bool
    {
        if (!$this->needBaseline || !$this->baseline || $this->baselinePlaced) {
            return false;
        }
        $t = $this->baseline['test'];
        if (!$this->canHost($lay, max(60, (int) $t['duration_min']))) {
            return false;
        }
        $this->pushFullLength($out, $lay, $this->baseline, 'mock', self::BASELINE_REVIEW_TITLE);
        $mock = $out[count($out) - 2];
        $this->baselinePlaced = [
            'test_id'    => $t['id'],
            'test_title' => $t['title'],
            'date'       => $date->toDateString(),
            'start_time' => $mock['start_time'],
            'end_time'   => $mock['end_time'],
        ];

        return true;
    }

    /**
     * One full-length paper + "review wrong answers". Phases 1–2 use fresh
     * full mocks / "Most Expected" sets; phase 3 uses the official PYQ papers
     * first, then fresh mocks, subject full tests, and finally re-attempts.
     */
    private function addFullLength(array &$out, SlotLayout $lay, bool $final): void
    {
        $pools = $final ? ['paperPool', 'mockPool', 'fullTests'] : ['mockPool'];
        $pick = null;
        foreach ($pools as $pool) {
            foreach ($this->{$pool} as $i => $m) {
                if ($this->canHost($lay, max(60, (int) $m['test']['duration_min']))) {
                    $pick = $m;
                    array_splice($this->{$pool}, $i, 1);
                    break 2;
                }
            }
        }
        $pick ??= $this->mockReattempt($lay);
        if ($pick) {
            $this->pushFullLength($out, $lay, $pick, 'mock');
        }
    }

    /** Phase 2, non-mock library days: one subject "200 Most Expected" full test. */
    private function addSubjectTest(array &$out, SlotLayout $lay): void
    {
        foreach ($this->fullTests as $i => $m) {
            if ($this->canHost($lay, max(60, (int) $m['test']['duration_min']))) {
                array_splice($this->fullTests, $i, 1);
                $this->pushFullLength($out, $lay, $m, 'test');

                return;
            }
        }
    }

    private function pushFullLength(array &$out, SlotLayout $lay, array $m, string $type, ?string $reviewTitle = null): void
    {
        $t = $m['test'];
        $mins = max(60, (int) $t['duration_min']);
        $pack = $t['pack'] ?? null;
        $section = $pack ? ($this->catalog->packs[$pack]['section'] ?? null) : null;
        $subject = $pack ?? 'mock';
        $this->plannedTests[$t['id']] = ($this->plannedTests[$t['id']] ?? 0) + 1;
        $this->todayRefs['test:' . $t['id']] = true;
        $this->push($out, $lay, $this->item($type, $m['title'], $mins, 'test', $t['id'], $subject, $section));
        $this->push($out, $lay, $this->item('review', $reviewTitle ?? "Review wrong answers: {$t['title']} (Revise this concept)", self::REVIEW_MIN,
            'test', $t['id'], $subject, $section));
    }

    /** Pools used up: re-attempt a full mock (least used first) while attempts allow. */
    private function mockReattempt(SlotLayout $lay): ?array
    {
        $best = null;
        foreach ($this->catalog->mocks as $t) {
            if (!$this->canHost($lay, max(60, $t['duration_min'])) || !$this->canAttemptAgain($t['id'])) {
                continue;
            }
            if ($best === null || $this->mockUses($t['id']) < $this->mockUses($best['id'])) {
                $best = $t;
            }
        }

        return $best ? ['test' => $best, 'title' => "Full mock (re-attempt): {$best['title']}"] : null;
    }

    /** Times a mock has been / will have been sat: planned uses + an earlier finished attempt. */
    private function mockUses(int $testId): int
    {
        return ($this->plannedTests[$testId] ?? 0) + (isset($this->catalog->completedTestIds[$testId]) ? 1 : 0);
    }

    private function canAttemptAgain(int $testId): bool
    {
        if (!isset($this->catalog->openableTestIds[$testId])) {
            return false;
        }
        $left = $this->catalog->attemptsLeft[$testId] ?? null;

        return $left === null || ($this->plannedTests[$testId] ?? 0) < $left;
    }

    /**
     * Re-attempt a practice / PYQ / section test already done (or scheduled
     * on an earlier day of the plan). Weighted round-robin by section.
     */
    private function takeRetry(int $max, ?string $section = null): ?array
    {
        $candidates = [];
        foreach ($this->retry as $i => $t) {
            $s = $t['section'] ?? 'cs';
            if (isset($candidates[$s]) || ($section !== null && $s !== $section)) {
                continue;
            }
            $id = $t['id'];
            $seen = isset($this->catalog->completedTestIds[$id]) || isset($this->doneRefs['test:' . $id])
                || (($this->plannedTests[$id] ?? 0) > 0 && !isset($this->todayRefs['test:' . $id]));
            $mins = max(self::MIN_ITEM, (int) (ceil(($t['duration_min'] + 5) / 5) * 5));
            if ($seen && $mins <= $max && $this->canAttemptAgain($id)) {
                $candidates[$s] = $i;
            }
        }
        if (!$candidates) {
            return null;
        }
        $best = null;
        $bestScore = -1;
        foreach ($candidates as $s => $i) {
            $score = ($this->sectionWeights[$s] ?? 10) / (1 + ($this->picks['retry:' . $s] ?? 0));
            if ($score > $bestScore) {
                $best = $s;
                $bestScore = $score;
            }
        }
        $this->picks['retry:' . $best] = ($this->picks['retry:' . $best] ?? 0) + 1;
        $t = $this->retry[$candidates[$best]];
        array_splice($this->retry, $candidates[$best], 1);

        return $this->mark($this->testItem('test', "Re-attempt: {$t['title']}", $t, $t['pack'] ?? $t['section'], $t['section']));
    }

    private function takeRotating(array $list, int &$idx, int $max): ?array
    {
        $n = count($list);
        for ($k = 0; $k < $n; $k++) {
            $it = $list[($idx + $k) % $n];
            if ($it['minutes'] <= $max && !isset($this->todayRefs[$it['ref_type'] . ':' . $it['ref_id']])) {
                $idx = ($idx + $k + 1) % $n;
                $this->todayRefs[$it['ref_type'] . ':' . $it['ref_id']] = true;

                return $it;
            }
        }

        return null;
    }

    /** Next ready item from the learn queue that fits (optionally one section only). */
    private function takeLearn(int $max, int $lookahead, string|array|null $section = null): ?array
    {
        return $this->takeFrom($this->learn, $max, $section, $lookahead, $max <= self::OFFICE_MAX);
    }

    /** Weighted round-robin across sections over the mixed pool. */
    private function takeMixed(int $max): ?array
    {
        $candidates = [];
        foreach ($this->mixed as $i => $it) {
            $s = $it['section'] ?? 'cs';
            if (!isset($candidates[$s]) && $it['minutes'] <= $max && $this->ready($it)) {
                $candidates[$s] = $i;
            }
        }
        if (!$candidates) {
            return null;
        }
        $bestSection = null;
        $bestScore = -1;
        foreach ($candidates as $s => $i) {
            $score = ($this->sectionWeights[$s] ?? 10) / (1 + ($this->picks[$s] ?? 0));
            if ($score > $bestScore) {
                $bestSection = $s;
                $bestScore = $score;
            }
        }
        $this->picks[$bestSection] = ($this->picks[$bestSection] ?? 0) + 1;
        $idx = $candidates[$bestSection];
        $it = $this->mixed[$idx];
        array_splice($this->mixed, $idx, 1);

        return $this->mark($it);
    }

    private function takeFrom(array &$pool, int $max, string|array|null $section = null, int $lookahead = PHP_INT_MAX, bool $officeOnly = false): ?array
    {
        $seen = 0;
        foreach ($pool as $i => $it) {
            if ($section !== null) {
                $wanted = is_array($section) ? $section : [$section];
                if (!in_array($it['section'] ?? null, $wanted, true)) {
                    continue;
                }
            }
            if (++$seen > $lookahead) {
                break;
            }
            if ($it['minutes'] > $max || ($officeOnly && $it['minutes'] > self::OFFICE_MAX) || !$this->ready($it)) {
                continue;
            }
            array_splice($pool, $i, 1);

            return $this->mark($it);
        }

        return null;
    }

    private function ready(array $it): bool
    {
        return empty($it['needs']) || isset($this->readyUnits[$it['needs']]);
    }

    private function mark(array $it): array
    {
        if (!empty($it['unit'])) {
            $this->readyUnits[$it['unit']] = true;
        }
        if ($it['ref_type'] === 'test') {
            $this->plannedTests[$it['ref_id']] = ($this->plannedTests[$it['ref_id']] ?? 0) + 1;
        }
        $this->todayRefs[$it['ref_type'] . ':' . $it['ref_id']] = true;

        return $it;
    }

    /** Fast-revision sheets in rotation (never twice on one day). */
    private function takeSheet(int $max): ?array
    {
        return $this->takeRotating($this->sheets, $this->sheetIdx, $max);
    }

    /** Chapter-notes revision, section picked by weighted round-robin. */
    private function takeRevision(int $max): ?array
    {
        if ($max < self::REVISE_MIN) {
            return null;
        }
        $best = null;
        $bestScore = -1;
        foreach ($this->revisions as $s => $list) {
            if (!$list) {
                continue;
            }
            $score = ($this->sectionWeights[$s] ?? 10) / (1 + ($this->picks['rev:' . $s] ?? 0));
            if ($score > $bestScore) {
                $best = $s;
                $bestScore = $score;
            }
        }
        if ($best === null) {
            return null;
        }
        $list = $this->revisions[$best];
        $n = count($list);
        for ($k = 0; $k < $n; $k++) {
            $idx = (($this->revisionIdx[$best] ?? 0) + $k) % $n;
            $it = $list[$idx];
            // Only revise notes the plan has already had you read (or that were done before).
            $read = isset($this->doneRefs['material:' . $it['ref_id']]) || $this->wasRead($it['ref_id']);
            if ($read && !isset($this->todayRefs['material:' . $it['ref_id']])) {
                $this->revisionIdx[$best] = $idx + 1;
                $this->picks['rev:' . $best] = ($this->picks['rev:' . $best] ?? 0) + 1;
                $this->todayRefs['material:' . $it['ref_id']] = true;

                return $it;
            }
        }
        // Nothing read yet in the best section — let other sections have a go next time.
        $this->picks['rev:' . $best] = ($this->picks['rev:' . $best] ?? 0) + 1;

        return null;
    }

    /** Notes count as read once they have left the learn / mixed queues. */
    private function wasRead(int $materialId): bool
    {
        return !$this->isQueued($materialId);
    }

    private function isQueued(int $materialId): bool
    {
        foreach ([$this->learn, $this->mixed] as $pool) {
            foreach ($pool as $it) {
                if ($it['ref_type'] === 'material' && $it['ref_id'] === $materialId) {
                    return true;
                }
            }
        }

        return false;
    }

    // ─── Summary ──────────────────────────────────────────────────────────────

    /** Plain-English lines shown above the plan: why it starts / is weighted the way it is. */
    private function advice(): array
    {
        $out = [];
        if ($b = $this->baselinePlaced) {
            $when = CarbonImmutable::parse($b['date'])->format('D j M') . " at {$b['start_time']}";
            $out[] = "You have not taken a full mock yet, so the plan starts with a baseline mock ({$b['test_title']}) on {$when}, "
                . 'followed by a review of your wrong answers. When you have finished it, press Regenerate: the plan re-weights '
                . 'every section by your scores (weaker sections get more time) and keeps the tasks you have ticked.';
        } elseif ($this->needBaseline) {
            $out[] = 'Take a full mock as soon as you can, then press Regenerate: the plan re-weights every section by your scores.';
        }
        if ($m = $this->latestMock) {
            $sections = $m['sections'];
            asort($sections);
            $weak = [];
            foreach (array_slice($sections, 0, 3, true) as $key => $pct) {
                $weak[] = ContentCatalog::sectionLabel($key) . ' ' . rtrim(rtrim(number_format($pct, 1), '0'), '.') . '%';
            }
            $date = $m['date'] ? ', ' . CarbonImmutable::parse($m['date'])->format('j M') : '';
            $out[] = "Time per section follows your latest full mock ({$m['title']}{$date}) — weakest first: " . implode(', ', $weak)
                . '. After your next mock, press Regenerate to re-weight (ticked tasks are kept).';
        }
        $out[] = 'Times follow your timetable. In the library and at weekends a 10-minute break comes after every 90 minutes of study.';

        return $out;
    }

    private function summary(CarbonImmutable $today, CarbonImmutable $exam, array $rows): array
    {
        $byPhase = [];
        foreach ($rows as $r) {
            $p = $r['phase'];
            $byPhase[$p]['from'] = min($byPhase[$p]['from'] ?? $r['date'], $r['date']);
            $byPhase[$p]['to'] = max($byPhase[$p]['to'] ?? $r['date'], $r['date']);
        }
        $names = [
            1 => ['Learn + practise', 'Subject by subject: chapter notes, then that chapter\'s practice tests, then the subject\'s PYQ test. A full mock on Saturdays, a weak-area day on Sundays.'],
            2 => ['Mixed practice + mocks', 'Section-wise and chapter-wise tests across all subjects, a subject full-length test on most library days, re-attempts and notes revision, and 2 full mocks a week (Wednesday + Saturday) — each followed by reviewing your wrong answers.'],
            3 => ['Final 10 days', 'A full-length paper every day (two on weekends) — the official previous-year papers first, then full mocks — each with a review, plus previous-year questions and fast-revision sheets.'],
        ];
        $phases = [];
        foreach ($byPhase as $p => $range) {
            $phases[] = ['phase' => $p, 'name' => $names[$p][0], 'description' => $names[$p][1], 'from' => $range['from'], 'to' => $range['to']];
        }
        usort($phases, fn ($a, $b) => $a['phase'] <=> $b['phase']);

        $subjects = [];
        foreach ($this->packOrder as $key) {
            $p = $this->catalog->packs[$key];
            $subjects[] = [
                'key'      => $key,
                'label'    => $p['label'],
                'section'  => $p['section'],
                'chapters' => count($p['units']),
                'weight'   => round($this->packWeight($p), 2),
            ];
        }
        $sections = [];
        foreach (ContentCatalog::SECTIONS as $key => [$label, $marks]) {
            $sections[] = [
                'key'    => $key,
                'label'  => $label,
                'marks'  => $marks,
                'weight' => $this->sectionWeights[$key],
                'score_percent' => $this->sectionStats[$key] ?? null,
                'mock_percent'  => $this->latestMock['sections'][$key] ?? null,
                'has_pack' => collect($this->catalog->packs)->contains(fn ($p) => $p['section'] === $key || ($key === 'teaching' && $p['has_teaching'])),
            ];
        }

        return [
            'today'      => $today->toDateString(),
            'exam_date'  => $exam->toDateString(),
            'days'       => $exam->lt($today) ? 0 : $today->diffInDays($exam) + 1,
            'phases'     => $phases,
            'subjects'   => $subjects,
            'sections'   => $sections,
            'day_labels' => $this->dayLabels,
            'timetable'  => $this->timetable,
            'baseline'   => $this->baselinePlaced,
            'latest_mock' => $this->latestMock,
            'advice'     => $this->advice(),
            'counts'     => [
                'tasks'   => count($rows),
                'minutes' => array_sum(array_column($rows, 'minutes')),
                'mocks'   => count(array_filter($rows, fn ($r) => $r['type'] === 'mock')),
            ],
            'notes'      => array_values($this->catalog->notes),
        ];
    }
}
