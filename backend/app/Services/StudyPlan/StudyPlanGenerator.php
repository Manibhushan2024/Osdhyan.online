<?php

namespace App\Services\StudyPlan;

use App\Models\StudyPlan;
use App\Models\StudyPlanTask;
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
 * evening), weekend. Deterministic for a given user, content and "today".
 */
class StudyPlanGenerator
{
    public const PHASE3_DAYS = 10;
    public const PHASE1_SHARE = 0.6;     // max share of the pre-phase-3 days spent in phase 1
    public const NOTES_MIN = 40;
    public const REVIEW_MIN = 45;
    public const SHEET_MIN = 40;
    public const REVISE_MIN = 30;
    public const OFFICE_MAX = 40;
    public const MIN_ITEM = 15;

    public const DEFAULTS = [
        'exam_date'           => '2026-11-26',
        'weekday_office_min'  => 120,
        'weekday_library_min' => 390,
        'weekend_min'         => 480,
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

    /**
     * (Re)generate the user's plan from $today. Done tasks are kept as
     * history; everything not done is replaced.
     */
    public function generate(User $user, array $input, CarbonInterface $today): StudyPlan
    {
        $today = CarbonImmutable::parse($today->toDateString());
        $examDate = CarbonImmutable::parse($input['exam_date'] ?? self::DEFAULTS['exam_date']);
        $office = (int) ($input['weekday_office_min'] ?? self::DEFAULTS['weekday_office_min']);
        $library = (int) ($input['weekday_library_min'] ?? self::DEFAULTS['weekday_library_min']);
        $weekend = (int) ($input['weekend_min'] ?? self::DEFAULTS['weekend_min']);
        $this->focus = array_values(array_unique(array_map('strval', $input['focus'] ?? [])));

        $this->reset();
        $this->catalog = ContentCatalog::build($user);

        return DB::transaction(function () use ($user, $today, $examDate, $office, $library, $weekend) {
            $plan = StudyPlan::firstOrNew(['user_id' => $user->id]);
            $plan->fill([
                'exam_date'           => $examDate->toDateString(),
                'weekday_office_min'  => $office,
                'weekday_library_min' => $library,
                'weekend_min'         => $weekend,
            ]);
            $plan->save();

            // Keep done tasks as history; drop everything else.
            $plan->tasks()->whereNull('done_at')->delete();
            $kept = $plan->tasks()->get(['id', 'date', 'slot', 'position', 'type', 'ref_type', 'ref_id']);
            foreach ($kept as $t) {
                if ($t->ref_type && $t->ref_id && $t->type !== 'review') {
                    $this->doneRefs[$t->ref_type . ':' . $t->ref_id] = true;
                }
            }

            $this->computeWeights($user);
            $this->buildPools();

            $rows = $this->schedule($today, $examDate, $office, $library, $weekend);

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
            'doneRefs', 'todayRefs', 'dayLabels', 'pyqNotes', 'fullTests', 'retry'] as $p) {
            $this->{$p} = [];
        }
        $this->sheetIdx = 0;
        $this->pyqIdx = 0;
    }

    // ─── Weights ──────────────────────────────────────────────────────────────

    /**
     * Section weight = marks × weakness factor (× 1.5 when in focus). The
     * factor comes from the user's completed attempts that carry per-section
     * results: 0.5 (all right) … 1.5 (nothing right); 1.0 without data.
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
            $meta = $a->metadata ?? [];
            $rows = [];
            if (!empty($meta['sectional_stats']) && is_array($meta['sectional_stats'])) {
                foreach ($meta['sectional_stats'] as $name => $s) {
                    $rows[] = ['name' => (string) $name, 'marks' => $s['marks'] ?? null, 'max' => $s['total'] ?? null, 'correct' => $s['correct'] ?? 0];
                }
            } elseif (!empty($meta['section_results']) && is_array($meta['section_results'])) {
                foreach ($meta['section_results'] as $s) {
                    $rows[] = ['name' => (string) ($s['name_en'] ?? $s['key'] ?? ''), 'marks' => $s['marks'] ?? null, 'max' => $s['max_marks'] ?? $s['total'] ?? null, 'correct' => $s['correct'] ?? 0];
                }
            }
            foreach ($rows as $r) {
                $key = ContentCatalog::sectionKey($r['name']);
                $max = (float) ($r['max'] ?? 0);
                if (!$key || $max <= 0) {
                    continue;
                }
                $marks = $r['marks'] !== null ? (float) $r['marks'] : (float) $r['correct'];
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
            if (in_array($key, $this->focus, true)) {
                $factor *= 1.5;
            }
            $this->sectionFactors[$key] = $factor;
            $this->sectionWeights[$key] = round($marks * $factor, 2);
        }
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

            return [$fa, -$this->packWeight($a), $index[$a['key']]] <=> [$fb, -$this->packWeight($b), $index[$b['key']]];
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

    private function schedule(CarbonImmutable $today, CarbonImmutable $exam, int $office, int $library, int $weekend): array
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
            $slots = [];
            if ($date->isWeekend()) {
                $slots['weekend'] = $this->planWeekend($phase, $date, $weekend);
            } else {
                $slots['office'] = $this->planOffice($phase, $office);
                $slots['library'] = $this->planLibrary($phase, $date, $library);
            }

            foreach ($slots as $slot => $items) {
                foreach (array_values($items) as $pos => $it) {
                    $rows[] = [
                        'date'        => $ds,
                        'slot'        => $slot,
                        'position'    => $pos,
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

    private function planOffice(int $phase, int $budget): array
    {
        $out = [];
        $left = $budget;
        $step = 0;
        while ($left >= self::MIN_ITEM) {
            $max = min($left, self::OFFICE_MAX);
            $it = match ($phase) {
                1       => $this->takeLearn($max, 8) ?? $this->takeMixed($max) ?? $this->takeRevision($max),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $max),
                default => $this->takeSheet($max) ?? $this->takeRevision($max) ?? $this->takeRetry($max),
            };
            if (!$it) {
                break;
            }
            $out[] = $it;
            $left -= $it['minutes'];
        }

        return $out;
    }

    private function planLibrary(int $phase, CarbonImmutable $date, int $budget): array
    {
        $out = [];
        $left = $budget;

        if ($phase === 3) {
            $this->addFullLength($out, $left, true);
            $this->addFrom($out, $left, $this->takeRotating($this->pyqNotes, $this->pyqIdx, $left));
            $this->addFrom($out, $left, $this->takeSheet($left));
        } elseif ($phase === 2) {
            if ($date->isWednesday()) {
                $this->addFullLength($out, $left, false);
            } else {
                $this->addSubjectTest($out, $left);
            }
        }

        $step = 0;
        while ($left >= self::MIN_ITEM) {
            $cap = min($left, self::OFFICE_MAX);
            $it = match ($phase) {
                1       => $this->takeLearn($left, 12) ?? $this->takeMixed($left) ?? $this->takeRevision($cap),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $left),
                default => $this->takeCycle(['revision', 'retry'], $step++, $cap),
            };
            if (!$it) {
                break;
            }
            $out[] = $it;
            $left -= $it['minutes'];
        }

        return $out;
    }

    private function planWeekend(int $phase, CarbonImmutable $date, int $budget): array
    {
        $out = [];
        $left = $budget;

        if ($phase === 3) {
            $this->addFullLength($out, $left, true);
            $this->addFullLength($out, $left, true);
            $this->addFrom($out, $left, $this->takeSheet($left));
        } elseif ($date->isSaturday()) {
            $this->addFullLength($out, $left, false);
        } else {
            $this->weakAreaDay($out, $left, $date);
        }

        $step = 0;
        while ($left >= self::MIN_ITEM) {
            $cap = min($left, self::OFFICE_MAX);
            $it = match ($phase) {
                1       => $this->takeLearn($left, 12) ?? $this->takeMixed($left) ?? $this->takeRevision($cap),
                2       => $this->takeCycle(['mixed', 'revision', 'retry', 'revision'], $step++, $left),
                default => $this->takeSheet($cap) ?? $this->takeCycle(['revision', 'retry'], $step++, $cap),
            };
            if (!$it) {
                break;
            }
            $out[] = $it;
            $left -= $it['minutes'];
        }

        return $out;
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

    private function addFrom(array &$out, int &$left, ?array $it): void
    {
        if ($it) {
            $out[] = $it;
            $left -= $it['minutes'];
        }
    }

    /** Sunday in phases 1–2: up to 5 items for the weakest sections first. */
    private function weakAreaDay(array &$out, int &$left, CarbonImmutable $date): void
    {
        $ranked = array_keys(ContentCatalog::SECTIONS);
        usort($ranked, fn ($a, $b) => [-$this->sectionFactors[$a], -ContentCatalog::SECTIONS[$a][1], $a]
            <=> [-$this->sectionFactors[$b], -ContentCatalog::SECTIONS[$b][1], $b]);

        // Without attempt data every factor is equal; rotate through Section A
        // subjects week by week (CS is covered every day anyway).
        if (!$this->sectionStats) {
            $ranked = array_values(array_filter($ranked, fn ($s) => !in_array($s, ['cs', 'teaching'], true)));
            $shift = ((int) floor($date->dayOfYear / 7)) % max(1, count($ranked));
            $ranked = array_merge(array_slice($ranked, $shift), array_slice($ranked, 0, $shift), ['teaching', 'cs']);
        }

        $used = [];
        $count = 0;
        foreach ($ranked as $section) {
            while ($count < 5 && $left >= self::MIN_ITEM) {
                $it = $this->takeLearn($left, 40, $section)
                    ?? $this->takeFrom($this->mixed, $left, $section)
                    ?? $this->takeRetry($left, $section);
                if (!$it) {
                    break;
                }
                $out[] = $it;
                $left -= $it['minutes'];
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
     * One full-length paper + "review wrong answers". Phases 1–2 use fresh
     * full mocks / "Most Expected" sets; phase 3 uses the official PYQ papers
     * first, then fresh mocks, subject full tests, and finally re-attempts.
     */
    private function addFullLength(array &$out, int &$left, bool $final): void
    {
        $pools = $final ? ['paperPool', 'mockPool', 'fullTests'] : ['mockPool'];
        $pick = null;
        foreach ($pools as $pool) {
            foreach ($this->{$pool} as $i => $m) {
                if (max(60, (int) $m['test']['duration_min']) + self::REVIEW_MIN <= $left) {
                    $pick = $m;
                    array_splice($this->{$pool}, $i, 1);
                    break 2;
                }
            }
        }
        $pick ??= $this->mockReattempt($left);
        if ($pick) {
            $this->pushFullLength($out, $left, $pick, 'mock');
        }
    }

    /** Phase 2, non-mock library days: one subject "200 Most Expected" full test. */
    private function addSubjectTest(array &$out, int &$left): void
    {
        foreach ($this->fullTests as $i => $m) {
            if (max(60, (int) $m['test']['duration_min']) + self::REVIEW_MIN <= $left) {
                array_splice($this->fullTests, $i, 1);
                $this->pushFullLength($out, $left, $m, 'test');

                return;
            }
        }
    }

    private function pushFullLength(array &$out, int &$left, array $m, string $type): void
    {
        $t = $m['test'];
        $mins = max(60, (int) $t['duration_min']);
        $pack = $t['pack'] ?? null;
        $section = $pack ? ($this->catalog->packs[$pack]['section'] ?? null) : null;
        $subject = $pack ?? 'mock';
        $this->plannedTests[$t['id']] = ($this->plannedTests[$t['id']] ?? 0) + 1;
        $this->todayRefs['test:' . $t['id']] = true;
        $out[] = $this->item($type, $m['title'], $mins, 'test', $t['id'], $subject, $section);
        $out[] = $this->item('review', "Review wrong answers: {$t['title']} (Revise this concept)", self::REVIEW_MIN,
            'test', $t['id'], $subject, $section);
        $left -= $mins + self::REVIEW_MIN;
    }

    /** Pools used up: re-attempt a full mock (least used first) while attempts allow. */
    private function mockReattempt(int $left): ?array
    {
        $best = null;
        foreach ($this->catalog->mocks as $t) {
            if (max(60, $t['duration_min']) + self::REVIEW_MIN > $left || !$this->canAttemptAgain($t['id'])) {
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
    private function takeLearn(int $max, int $lookahead, ?string $section = null): ?array
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

    private function takeFrom(array &$pool, int $max, ?string $section = null, int $lookahead = PHP_INT_MAX, bool $officeOnly = false): ?array
    {
        $seen = 0;
        foreach ($pool as $i => $it) {
            if ($section !== null && ($it['section'] ?? null) !== $section) {
                continue;
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
            'counts'     => [
                'tasks'   => count($rows),
                'minutes' => array_sum(array_column($rows, 'minutes')),
                'mocks'   => count(array_filter($rows, fn ($r) => $r['type'] === 'mock')),
            ],
            'notes'      => array_values($this->catalog->notes),
        ];
    }
}
