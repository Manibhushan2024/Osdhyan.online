<?php

namespace App\Services\StudyPlan;

use App\Models\Chapter;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestSeries;
use App\Models\User;
use App\Services\Payments\UserAccess;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Everything the DSSSB TGT CS study plan can schedule, resolved by NAME at
 * generation time (never by id), and filtered to what this user can open:
 *
 *   - the main series "DSSSB TGT Computer Science 2026 — …": official papers,
 *     full mocks, "Most Expected" sets, section-wise and chapter-wise tests;
 *   - every subject pack "DSSSB TGT CS — <Subject> …": PYQ test, practice
 *     tests per chapter, "200 Most Expected" full test;
 *   - the DSSSB course subject matching each pack: per-chapter revision-notes
 *     PDFs, fast-revision sheet, complete notes, PYQ-with-solutions PDF.
 *
 * New packs (Reasoning, Numerical, English, Hindi…) are picked up as soon as
 * a published series with the pack naming exists.
 */
class ContentCatalog
{
    public const MAIN_SERIES_PREFIX = 'DSSSB TGT Computer Science 2026';
    public const PACK_PREFIX = 'DSSSB TGT CS';
    public const COURSE_CATEGORY = 'DSSSB';

    /** Exam pattern: section key => [label, marks]. */
    public const SECTIONS = [
        'cs'         => ['Computer Science', 90],
        'teaching'   => ['Teaching Methodology', 10],
        'ga'         => ['General Awareness', 20],
        'reasoning'  => ['Reasoning', 20],
        'arithmetic' => ['Arithmetic', 20],
        'hindi'      => ['Hindi', 20],
        'english'    => ['English', 20],
    ];

    private const STOP_WORDS = [
        'and', 'the', 'of', 'in', 'to', 'for', 'with', 'notes', 'complete', 'most', 'expected',
        'practice', 'part', 'test', 'tests', 'questions', 'plus', 'revision',
    ];

    /** @var array<string, array> pack key => pack */
    public array $packs = [];
    /** @var array<int, array> full mocks, in the order they should be used */
    public array $mocks = [];
    /** @var array<int, array> official previous-year papers */
    public array $officialPapers = [];
    /** @var array<int, array> "Most Expected Questions — Set n" */
    public array $expectedSets = [];
    /** @var array<int, array> section-wise and chapter-wise tests of the main series (each has 'section') */
    public array $mixedTests = [];
    /** @var array<string, string> human notes about missing content */
    public array $notes = [];

    /** @var array<int, true> */
    public array $completedTestIds = [];
    /** @var array<int, true> every test id the catalog considered openable */
    public array $openableTestIds = [];

    public ?int $mainSeriesId = null;

    public static function build(User $user): self
    {
        $c = new self();
        $c->load($user);

        return $c;
    }

    // ─── Section helpers ──────────────────────────────────────────────────────

    /** Map any section / subject / test label to an exam section key. */
    public static function sectionKey(?string $name): ?string
    {
        $n = mb_strtolower((string) $name);
        if ($n === '') {
            return null;
        }

        return match (true) {
            (bool) preg_match('/reason|intelligence/u', $n)                                   => 'reasoning',
            (bool) preg_match('/arith|numer|quant|math|data interpretation/u', $n)            => 'arithmetic',
            (bool) preg_match('/english/u', $n)                                               => 'english',
            (bool) preg_match('/hindi|हिंदी|हिन्दी/u', $n)                                       => 'hindi',
            (bool) preg_match('/awareness|\bgk\b|current affairs|general knowledge|static/u', $n) => 'ga',
            (bool) preg_match('/computer|\bcs\b|dbms|programming|network|operating|\bos\b|\bdsa\b|data structure/u', $n) => 'cs',
            (bool) preg_match('/teaching|pedagog/u', $n)                                      => 'teaching',
            default                                                                           => null,
        };
    }

    public static function sectionLabel(string $key): string
    {
        return self::SECTIONS[$key][0] ?? Str::headline($key);
    }

    /** @return string[] lower-case tokens with light stemming, stop words removed */
    public static function tokens(string $text): array
    {
        $text = mb_strtolower(preg_replace('/\(part\s*\d+\)/iu', ' ', $text));
        $text = preg_replace(['/\boops?\b/u', '/\bds\b/u'], ['object oriented programming', 'data structure'], $text);
        $parts = preg_split('/[^\p{L}\p{N}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
        $out = [];
        foreach ($parts as $p) {
            if (mb_strlen($p) < 2 || is_numeric($p) || in_array($p, self::STOP_WORDS, true)) {
                continue;
            }
            if (mb_strlen($p) > 3 && str_ends_with($p, 's')) {
                $p = mb_substr($p, 0, -1);
            }
            $out[$p] = true;
        }

        return array_keys($out);
    }

    private static function overlap(array $a, array $b): int
    {
        return count(array_intersect($a, $b));
    }

    /** Text after the last dash separator: "DBMS Practice — ER Model" → "ER Model". */
    private static function afterDash(string $name): string
    {
        $parts = preg_split('/\s+[—–-]\s+/u', $name);

        return trim((string) end($parts));
    }

    /** "… Official Paper — 24 June 2023 (Shift 3)" → "24june2023shift3". */
    private static function paperKey(string $name): string
    {
        $tail = preg_replace('/^.*official paper/iu', '', $name);

        return preg_replace('/[^a-z0-9]+/', '', mb_strtolower($tail));
    }

    /** "DSSSB TGT CS — DBMS Complete (Notes + 200 Most Expected)" → "DBMS". */
    public static function packLabel(string $seriesName): string
    {
        $rest = preg_replace('/^' . preg_quote(self::PACK_PREFIX, '/') . '\s*[—–-]\s*/u', '', $seriesName);
        $rest = preg_replace('/\s*\(.*$/u', '', $rest);
        $rest = preg_replace('/\s+(complete|pack|notes)\s*$/iu', '', trim($rest));

        return trim($rest);
    }

    // ─── Loading ──────────────────────────────────────────────────────────────

    private function load(User $user): void
    {
        $main = TestSeries::where('is_published', true)
            ->where('name_en', 'like', self::MAIN_SERIES_PREFIX . '%')
            ->orderBy('id')
            ->first();
        $this->mainSeriesId = $main?->id;

        $packSeries = TestSeries::where('is_published', true)
            ->where('name_en', 'like', self::PACK_PREFIX . ' %')
            ->where('name_en', 'not like', self::MAIN_SERIES_PREFIX . '%')
            ->orderBy('id')
            ->get();

        // All candidate tests, with series membership.
        $seriesIds = $packSeries->pluck('id')->push($main?->id)->filter()->values()->all();
        $membership = \Illuminate\Support\Facades\DB::table('test_series_tests')
            ->whereIn('test_series_id', $seriesIds ?: [0])
            ->get(['test_series_id', 'test_id']);
        $allIds = $membership->pluck('test_id')->unique()->values()->all();

        $tests = Test::with('subject:id,name_en')->whereIn('id', $allIds ?: [0])->orderBy('id')->get();
        $open = $this->openable($tests, $user);

        // Tests already finished by this user (skipped as new work, usable as re-attempts).
        $this->completedTestIds = TestAttempt::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereIn('test_id', $allIds ?: [0])
            ->pluck('test_id')->unique()->mapWithKeys(fn ($id) => [(int) $id => true])->all();

        $byId = $tests->keyBy('id');
        $inPack = [];

        // ── Subject packs ─────────────────────────────────────────────────────
        $courseSubjects = Subject::where('is_published', true)
            ->whereRaw('UPPER(category) = ?', [self::COURSE_CATEGORY])
            ->orderBy('sort_order')->orderBy('id')
            ->get();
        $takenSubjects = [];

        foreach ($packSeries as $series) {
            $label = self::packLabel($series->name_en);
            if ($label === '') {
                continue;
            }
            $key = Str::slug($label);
            if (isset($this->packs[$key])) {
                continue;
            }
            $rawSection = self::sectionKey($label);
            $section = in_array($rawSection, [null, 'teaching'], true) ? 'cs' : $rawSection;

            $packTests = $membership->where('test_series_id', $series->id)->pluck('test_id')
                ->map(fn ($id) => $byId->get($id))->filter()->sortBy('id')->values();
            foreach ($packTests as $t) {
                $inPack[$t->id] = true;
            }

            $pack = [
                'key'          => $key,
                'label'        => $label,
                'section'      => $section,
                'has_teaching' => $rawSection === 'teaching' || (bool) preg_match('/teaching/i', $label),
                'series_id'    => $series->id,
                'subject_id'   => null,
                'units'        => [],
                'pyq'          => [],
                'expected'     => [],
                'fast_sheet'   => null,
                'complete'     => null,
                'pyq_notes'    => null,
            ];

            $practice = [];
            foreach ($packTests as $t) {
                if (!isset($open[$t->id])) {
                    continue;
                }
                $row = $this->testRow($t, $section, $key);
                if ($t->mode === 'pyq' || preg_match('/previous year/i', $t->name_en)) {
                    $pack['pyq'][] = $row;
                } elseif (preg_match('/most expected/i', $t->name_en)) {
                    $pack['expected'][] = $row;
                } else {
                    $practice[] = $row;
                }
            }

            // Matching DSSSB course subject (best token overlap, each used once).
            $labelTokens = self::tokens($label);
            $best = null;
            $bestScore = 0;
            foreach ($courseSubjects as $s) {
                if (isset($takenSubjects[$s->id])) {
                    continue;
                }
                $score = self::overlap($labelTokens, self::tokens($s->name_en));
                if ($score > $bestScore) {
                    $best = $s;
                    $bestScore = $score;
                }
            }
            if ($best) {
                $takenSubjects[$best->id] = true;
                $pack['subject_id'] = $best->id;
                $this->attachCourse($pack, $best, $practice);
            } else {
                foreach ($practice as $row) {
                    $pack['units'][] = ['key' => "{$key}:t{$row['id']}", 'title' => $row['title'], 'notes' => null, 'tests' => [$row]];
                }
                $this->notes[$key] = "No course notes found for {$label} yet; using its practice tests only.";
            }

            $this->packs[$key] = $pack;
        }

        // ── Main series ───────────────────────────────────────────────────────
        if ($main) {
            $mainTests = $membership->where('test_series_id', $main->id)->pluck('test_id')
                ->map(fn ($id) => $byId->get($id))->filter()->sortBy('id')->values();
            $copies = [];
            foreach ($mainTests as $t) {
                if (isset($inPack[$t->id]) || !isset($open[$t->id])) {
                    continue;
                }
                $name = $t->name_en;
                if (preg_match('/^full mock/i', $name) || $t->category === 'Full Mock Tests') {
                    $row = $this->testRow($t, 'all', null);
                    // Mocks that re-use an official paper go after the fresh ones.
                    if (preg_match('/official/i', $name)) {
                        $copies[] = $row;
                    } else {
                        $this->mocks[] = $row;
                    }
                } elseif ($t->mode === 'pyq' || preg_match('/official paper|previous year paper/i', $name)) {
                    $this->officialPapers[] = $this->testRow($t, 'all', null);
                } elseif (preg_match('/most expected/i', $name)) {
                    $this->expectedSets[] = $this->testRow($t, 'all', null);
                } else {
                    $section = self::sectionKey(self::afterDash($name))
                        ?? self::sectionKey($t->subject?->name_en)
                        ?? 'cs';
                    $this->mixedTests[] = $this->testRow($t, $section, null);
                }
            }
            // A mock that is a copy of an official paper ("Full Mock Test 1 — Official
            // Paper 24 June 2023 (Shift 3)") is the same question set: keep it only
            // when that official paper itself is not available.
            $paperKeys = array_map(fn ($p) => self::paperKey($p['title']), $this->officialPapers);
            foreach ($copies as $row) {
                if (!in_array(self::paperKey($row['title']), $paperKeys, true)) {
                    $this->mocks[] = $row;
                }
            }
        } else {
            $this->notes['main'] = 'The main DSSSB TGT Computer Science 2026 test series was not found.';
        }

        foreach (array_keys(self::SECTIONS) as $sec) {
            if (in_array($sec, ['cs', 'teaching'], true)) {
                continue;
            }
            $hasPack = collect($this->packs)->contains(fn ($p) => $p['section'] === $sec);
            if (!$hasPack) {
                $this->notes[$sec] = self::sectionLabel($sec) . ': subject pack not published yet — using section-wise and chapter-wise tests.';
            }
        }
    }

    /**
     * Ids of tests this user can actually start: published, not locked behind
     * an unpaid series, and with attempts left.
     *
     * @return array<int, array{left: ?int}>
     */
    private function openable(Collection $tests, User $user): array
    {
        if ($tests->isEmpty()) {
            return [];
        }
        $flags = UserAccess::flagsForTests($tests, $user);
        $attempts = TestAttempt::where('user_id', $user->id)
            ->whereIn('test_id', $tests->pluck('id'))
            ->selectRaw('test_id, COUNT(*) as n')
            ->groupBy('test_id')
            ->pluck('n', 'test_id');

        $out = [];
        foreach ($tests as $t) {
            $available = $t->status === null || in_array($t->status, ['published', 'active'], true);
            if (!$available || ($flags[(int) $t->id]['is_locked'] ?? false)) {
                continue;
            }
            $max = (int) $t->max_attempts;
            $used = (int) ($attempts[$t->id] ?? 0);
            if ($max > 0 && $used >= $max) {
                continue;
            }
            $out[(int) $t->id] = ['left' => $max > 0 ? $max - $used : null];
            $this->openableTestIds[(int) $t->id] = true;
        }
        $this->attemptsLeft = array_map(fn ($r) => $r['left'], $out);

        return $out;
    }

    /** @var array<int, ?int> test id => attempts left (null = unlimited) */
    public array $attemptsLeft = [];

    private function testRow(Test $t, string $section, ?string $packKey): array
    {
        $durationMin = (int) ceil(((int) ($t->duration_sec ?: 1800)) / 60);

        return [
            'id'           => (int) $t->id,
            'title'        => $t->name_en,
            'duration_min' => $durationMin,
            'section'      => $section,
            'pack'         => $packKey,
            // Exam-style sections (e.g. the 10 DSSSB blocks): per-section results after an attempt.
            'sectioned'    => is_array($t->sections) && count($t->sections) > 0,
        ];
    }

    /** Course chapters → learning units (notes + matched practice tests). */
    private function attachCourse(array &$pack, Subject $subject, array $practice): void
    {
        $chapters = Chapter::where('subject_id', $subject->id)->where('is_published', true)->orderBy('id')->get();
        $materials = StudyMaterial::visibleToStudents()
            ->where('study_materials.subject_id', $subject->id)
            ->orderBy('study_materials.id')
            ->get(['study_materials.id', 'study_materials.title', 'study_materials.chapter_id', 'study_materials.type'])
            ->groupBy('chapter_id');

        $units = [];
        foreach ($chapters as $ch) {
            $mats = $materials->get($ch->id, collect());
            $isSummary = (bool) preg_match('/complete notes|previous[- ]year|most expected/i', $ch->name_en);
            if ($isSummary) {
                foreach ($mats as $m) {
                    if (!$pack['fast_sheet'] && preg_match('/fast revision/i', $m->title)) {
                        $pack['fast_sheet'] = $this->materialRow($m);
                    } elseif (!$pack['complete'] && preg_match('/complete notes/i', $m->title)) {
                        $pack['complete'] = $this->materialRow($m);
                    } elseif (!$pack['pyq_notes'] && preg_match('/previous[- ]year/i', $m->title)) {
                        $pack['pyq_notes'] = $this->materialRow($m);
                    }
                }
                continue;
            }
            $notes = $mats->first(fn ($m) => (bool) preg_match('/revision notes/i', $m->title))
                ?? $mats->firstWhere('type', 'pdf')
                ?? $mats->first();
            $title = trim(preg_replace('/^\d+\.\s*/', '', $ch->name_en));
            $units[] = [
                'key'      => "{$pack['key']}:c{$ch->id}",
                'title'    => $title,
                'chapter'  => ['id' => (int) $ch->id, 'subject_id' => (int) $subject->id],
                'notes'    => $notes ? $this->materialRow($notes) : null,
                'tokens'   => self::tokens($title),
                'tests'    => [],
            ];
        }

        // Attach each practice test to the chapter with the best name overlap.
        // Practice tests follow chapter order, so ties (and no overlap at all)
        // go to the chapter right after the previous test's chapter.
        $loose = [];
        $last = -1;
        foreach ($practice as $row) {
            $tokens = self::tokens(self::afterDash($row['title']));
            $bestIdx = null;
            $bestKey = null;
            foreach ($units as $i => $u) {
                $key = [self::overlap($tokens, $u['tokens']), -abs($i - ($last + 1))];
                if ($bestKey === null || $key > $bestKey) {
                    $bestIdx = $i;
                    $bestKey = $key;
                }
            }
            if ($bestIdx !== null && $bestKey[0] === 0) {
                // No shared words: next chapter in order if it has no test yet.
                $next = $last + 1;
                $bestIdx = isset($units[$next]) && $units[$next]['tests'] === [] ? $next : null;
            }
            if ($bestIdx !== null) {
                $units[$bestIdx]['tests'][] = $row;
                $last = $bestIdx;
            } else {
                $loose[] = $row;
            }
        }
        foreach ($loose as $row) {
            $units[] = ['key' => "{$pack['key']}:t{$row['id']}", 'title' => self::afterDash($row['title']), 'notes' => null, 'tests' => [$row]];
        }
        foreach ($units as &$u) {
            unset($u['tokens']);
        }
        unset($u);

        $pack['units'] = $units;
    }

    private function materialRow(StudyMaterial $m): array
    {
        return ['id' => (int) $m->id, 'title' => $m->title];
    }
}
