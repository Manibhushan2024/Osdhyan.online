<?php

namespace App\Services;

use App\Models\ConceptNote;
use App\Models\Question;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Everything the visual result page needs for one completed attempt:
 * score, rank and percentile among students, score distribution, section
 * comparison with the average and the topper, time per section, a two-set
 * Venn of Attempted × Marked-for-review, qualifying status and a list of
 * concrete things to improve.
 *
 * Rank basis (exam-like): each student's FIRST completed attempt at the
 * test. A re-attempt is ranked against those first attempts without
 * displacing anyone. Admins and automation accounts are excluded.
 */
class AttemptAnalysis
{
    private const CUTOFFS = ['General / EWS' => 40, 'OBC' => 35, 'SC / ST / PwBD' => 30];

    private const EXCLUDED_EMAILS = ['%@local.test', '%.check.%@example.test', 'smoke%@example.test', 'loadtest%@example.test'];

    public static function for(TestAttempt $attempt): array
    {
        return Cache::remember(
            "attempt_analysis_v1_{$attempt->id}",
            300,
            fn () => (new self())->build($attempt)
        );
    }

    public static function forget(int $attemptId): void
    {
        Cache::forget("attempt_analysis_v1_{$attemptId}");
    }

    private function build(TestAttempt $attempt): array
    {
        $test = $attempt->test;
        $key = TestAnswerKey::for($test);
        $meta = $attempt->metadata ?? [];
        $evaluateMarked = $test->evaluate_marked ?? true;

        $responses = DB::table('test_responses')
            ->where('test_attempt_id', $attempt->id)
            ->get(['question_id', 'selected_option_id', 'is_marked_for_review', 'time_taken_sec', 'marks_obtained'])
            ->keyBy('question_id');

        // ── Per question outcome ────────────────────────────────────────
        $maxMarks = 0.0;
        $correct = $incorrect = $unattempted = $markedNotEvaluated = 0;
        $negativeLost = 0.0;
        $venn = ['attempted_only' => 0, 'marked_only' => 0, 'both' => 0, 'neither' => 0,
                 'correct_attempted_only' => 0, 'correct_both' => 0];
        $outcome = [];
        foreach ($key as $qid => $q) {
            $maxMarks += (float) $q['marks'];
            $r = $responses->get($qid);
            $selected = $r?->selected_option_id ? (int) $r->selected_option_id : null;
            $marked = (bool) ($r?->is_marked_for_review);
            $isCorrect = $selected !== null && $selected === (int) $q['correct'];

            if ($selected !== null && $marked && !$evaluateMarked) {
                $markedNotEvaluated++;
                $state = 'not_evaluated';
            } elseif ($selected === null) {
                $unattempted++;
                $state = 'skipped';
            } elseif ($isCorrect) {
                $correct++;
                $state = 'correct';
            } else {
                $incorrect++;
                $negativeLost += (float) $q['negative'];
                $state = 'wrong';
            }
            $outcome[$qid] = $state;

            if ($selected !== null && $marked) {
                $venn['both']++;
                $venn['correct_both'] += $isCorrect ? 1 : 0;
            } elseif ($selected !== null) {
                $venn['attempted_only']++;
                $venn['correct_attempted_only'] += $isCorrect ? 1 : 0;
            } elseif ($marked) {
                $venn['marked_only']++;
            } else {
                $venn['neither']++;
            }
        }
        $score = (float) $attempt->total_score;
        $attempted = $correct + $incorrect;

        // ── Sections (exam blocks if the test has them, else subjects) ──
        $sections = $this->sections($test, $key, $responses, $outcome);

        // ── Others: first completed attempt of each real student ───────
        $firsts = $this->firstAttempts($test->id);
        $myFirstId = $firsts->firstWhere('user_id', $attempt->user_id)?->id;
        $isFirst = $myFirstId === $attempt->id;
        $others = $firsts->reject(fn ($a) => (int) $a->user_id === (int) $attempt->user_id);
        $scores = $others->pluck('total_score')->map(fn ($s) => (float) $s)->values();
        $pool = $scores->concat([$score])->sort()->values(); // others + me

        $better = $scores->filter(fn ($s) => $s > $score)->count();
        $rank = $better + 1;
        $outOf = $scores->count() + 1;
        $below = $scores->filter(fn ($s) => $s < $score)->count();
        $percentile = $outOf > 1 ? round(($below / ($outOf - 1)) * 100, 1) : 100.0;

        $sectionAvg = $this->sectionAverages($others, $sections);

        // ── Distribution: 10 buckets of the maximum score ──────────────
        $buckets = [];
        $step = $maxMarks > 0 ? $maxMarks / 10 : 1;
        for ($i = 0; $i < 10; $i++) {
            $lo = round($i * $step, 2);
            $hi = round(($i + 1) * $step, 2);
            $buckets[] = ['from' => $lo, 'to' => $hi, 'students' => 0, 'you' => false];
        }
        $bucketOf = fn (float $s) => max(0, min(9, (int) floor(($s / max($step, 0.0001)))));
        foreach ($pool as $s) {
            $buckets[$bucketOf($s)]['students']++;
        }
        $buckets[$bucketOf($score)]['you'] = true;

        // ── Time ────────────────────────────────────────────────────────
        $timeTaken = (int) ($attempt->time_taken_sec ?? 0);
        $duration = (int) ($test->duration_sec ?: 0);

        // ── Trend: this student's attempts at this test ────────────────
        $trend = TestAttempt::where('user_id', $attempt->user_id)
            ->where('test_id', $test->id)
            ->where('status', 'completed')
            ->orderBy('id')
            ->get(['id', 'total_score', 'completed_at'])
            ->values()
            ->map(fn ($a, $i) => ['attempt_id' => $a->id, 'number' => $i + 1, 'score' => (float) $a->total_score, 'date' => $a->completed_at?->toISOString()]);

        $weakChapters = $this->weakChapters($outcome);

        return [
            'attempt_id'   => $attempt->id,
            'test'         => ['id' => $test->id, 'name_en' => $test->name_en, 'duration_sec' => $duration, 'negative_marking' => (float) $test->negative_marking, 'evaluate_marked' => $evaluateMarked],
            'score'        => round($score, 2),
            'max_marks'    => round($maxMarks, 2),
            'percentage'   => $maxMarks > 0 ? round($score / $maxMarks * 100, 2) : 0,
            'counts'       => [
                'total' => count($key), 'attempted' => $attempted, 'correct' => $correct, 'incorrect' => $incorrect,
                'unattempted' => $unattempted, 'marked_not_evaluated' => $markedNotEvaluated,
            ],
            'accuracy'     => $attempted ? round($correct / $attempted * 100, 2) : 0,
            'negative_marks_lost' => round($negativeLost, 2),
            'rank'         => [
                'rank' => $rank, 'out_of' => $outOf, 'percentile' => $percentile,
                'basis' => $isFirst ? 'first_attempt' : 'reattempt_compared_with_first_attempts',
            ],
            'comparison'   => [
                'topper'  => $pool->isEmpty() ? $score : round((float) $pool->max(), 2),
                'average' => $pool->isEmpty() ? $score : round((float) $pool->avg(), 2),
                'median'  => $pool->isEmpty() ? $score : round((float) $pool->median(), 2),
                'you'     => round($score, 2),
            ],
            'distribution' => $buckets,
            'sections'     => array_map(fn ($s) => $s + ['avg_marks' => $sectionAvg[$s['key']]['avg'] ?? null, 'topper_marks' => $sectionAvg[$s['key']]['max'] ?? null], $sections),
            'time'         => [
                'taken_sec' => $timeTaken, 'allowed_sec' => $duration,
                'per_question_sec' => count($key) ? round($timeTaken / count($key), 1) : 0,
            ],
            'venn'         => $venn,
            'qualifying'   => $this->qualifying($score, $maxMarks, $sections),
            'improve'      => $this->improve($sections, $correct, $incorrect, $unattempted, $markedNotEvaluated, $negativeLost, $timeTaken, $duration, $weakChapters, $attempted),
            'weak_chapters' => $weakChapters,
            'trend'        => $trend,
        ];
    }

    /** Section rows: test blocks when present, otherwise question subjects. */
    private function sections(Test $test, array $key, $responses, array $outcome): array
    {
        $groups = [];
        $blocks = SectionState::questionIdsBySection($test);
        if ($blocks) {
            foreach (SectionState::sectionsOf($test) as $s) {
                $groups[] = ['key' => $s['key'], 'name' => $s['name_en'], 'ids' => $blocks[$s['key']] ?? []];
            }
        } else {
            $bySubject = [];
            foreach ($key as $qid => $q) {
                $bySubject[$q['subject'] ?: 'General'][] = $qid;
            }
            foreach ($bySubject as $name => $ids) {
                $groups[] = ['key' => 'subj_' . substr(md5($name), 0, 8), 'name' => $name, 'ids' => $ids];
            }
        }

        $rows = [];
        foreach ($groups as $g) {
            $row = ['key' => $g['key'], 'name' => $g['name'], 'total' => 0, 'correct' => 0, 'incorrect' => 0, 'unattempted' => 0,
                    'marks' => 0.0, 'max_marks' => 0.0, 'time_sec' => 0];
            foreach ($g['ids'] as $qid) {
                $q = $key[$qid] ?? null;
                if (!$q) {
                    continue;
                }
                $row['total']++;
                $row['max_marks'] += (float) $q['marks'];
                $row['time_sec'] += (int) ($responses->get($qid)?->time_taken_sec ?? 0);
                switch ($outcome[$qid] ?? 'skipped') {
                    case 'correct':
                        $row['correct']++;
                        $row['marks'] += (float) $q['marks'];
                        break;
                    case 'wrong':
                        $row['incorrect']++;
                        $row['marks'] -= (float) $q['negative'];
                        break;
                    default:
                        $row['unattempted']++;
                }
            }
            $att = $row['correct'] + $row['incorrect'];
            $row['accuracy'] = $att ? round($row['correct'] / $att * 100, 1) : 0;
            $row['marks'] = round($row['marks'], 2);
            $row['percentage'] = $row['max_marks'] > 0 ? round($row['marks'] / $row['max_marks'] * 100, 1) : 0;
            $rows[] = $row;
        }

        return $rows;
    }

    private function firstAttempts(int $testId)
    {
        return DB::table('test_attempts as a')
            ->join('users as u', 'u.id', '=', 'a.user_id')
            ->where('a.test_id', $testId)
            ->where('a.status', 'completed')
            ->where(fn ($q) => $q->whereNull('u.is_admin')->orWhere('u.is_admin', false))
            // Leave out automation accounts (seeded local users, smoke checks, load tests).
            ->where(function ($q) {
                $q->whereNull('u.email')->orWhere(function ($w) {
                    foreach (self::EXCLUDED_EMAILS as $pattern) {
                        $w->where('u.email', 'not like', $pattern);
                    }
                });
            })
            ->whereRaw('a.id = (SELECT MIN(b.id) FROM test_attempts b WHERE b.user_id = a.user_id AND b.test_id = a.test_id AND b.status = ?)', ['completed'])
            ->get(['a.id', 'a.user_id', 'a.total_score', 'a.metadata']);
    }

    /** Average and best marks per section among other students' first attempts. */
    private function sectionAverages($others, array $sections): array
    {
        $byKey = [];
        $byName = [];
        foreach ($sections as $s) {
            $byName[$s['name']] = $s['key'];
        }
        foreach ($others as $a) {
            $meta = is_string($a->metadata) ? json_decode($a->metadata, true) : (array) $a->metadata;
            if (!empty($meta['section_results'])) {
                foreach ($meta['section_results'] as $r) {
                    $byKey[$r['key']][] = (float) $r['marks'];
                }
            } elseif (!empty($meta['sectional_stats'])) {
                foreach ($meta['sectional_stats'] as $name => $r) {
                    $k = $byName[$name] ?? null;
                    if ($k) {
                        $byKey[$k][] = (float) ($r['marks'] ?? 0);
                    }
                }
            }
        }
        $out = [];
        foreach ($byKey as $k => $vals) {
            $out[$k] = ['avg' => round(array_sum($vals) / count($vals), 2), 'max' => round(max($vals), 2)];
        }

        return $out;
    }

    /** DSSSB qualifying rule: Section B and the total must each reach the category's %. */
    private function qualifying(float $score, float $max, array $sections): array
    {
        $b = array_values(array_filter($sections, fn ($s) => str_starts_with($s['key'], 'cs')));
        $bMarks = array_sum(array_column($b, 'marks'));
        $bMax = array_sum(array_column($b, 'max_marks'));
        $totalPct = $max > 0 ? $score / $max * 100 : 0;
        $bPct = $bMax > 0 ? $bMarks / $bMax * 100 : null;

        $rows = [];
        foreach (self::CUTOFFS as $cat => $pct) {
            $needTotal = round($max * $pct / 100, 2);
            $rows[] = [
                'category'     => $cat,
                'percent'      => $pct,
                'total_needed' => $needTotal,
                'section_b_needed' => $bMax > 0 ? round($bMax * $pct / 100, 2) : null,
                'qualified'    => $totalPct >= $pct && ($bPct === null || $bPct >= $pct),
                'short_by'     => max(0, round(max($needTotal - $score, $bMax > 0 ? ($bMax * $pct / 100) - $bMarks : 0), 2)),
            ];
        }

        return [
            'total_percent'     => round($totalPct, 2),
            'section_b_marks'   => $bMax > 0 ? round($bMarks, 2) : null,
            'section_b_max'     => $bMax > 0 ? $bMax : null,
            'section_b_percent' => $bPct !== null ? round($bPct, 2) : null,
            'categories'        => $rows,
        ];
    }

    /** Wrong/skipped questions grouped by the notes chapter that explains them. */
    private function weakChapters(array $outcome): array
    {
        $wrongIds = array_keys(array_filter($outcome, fn ($s) => $s === 'wrong'));
        if (!$wrongIds) {
            return [];
        }
        $keys = Question::whereIn('id', $wrongIds)->whereNotNull('concept_key')->pluck('concept_key', 'id');
        $counts = array_count_values($keys->values()->all());
        arsort($counts);
        $titles = ConceptNote::whereIn('concept_key', array_keys($counts))->where('position', 0)->pluck('chapter_title', 'concept_key');
        $map = json_decode(@file_get_contents(base_path('database/data/dsssb/concept_map.json')) ?: '{}', true) ?: [];

        $out = [];
        foreach (array_slice($counts, 0, 8, true) as $k => $n) {
            $out[] = [
                'concept_key'   => $k,
                'chapter_title' => $titles[$k] ?? $this->bankLabel($k, $map),
                'wrong'         => $n,
                'question_ids'  => array_values(array_keys($keys->filter(fn ($v) => $v === $k)->all())),
            ];
        }

        return $out;
    }

    private function bankLabel(string $k, array $map): string
    {
        $labels = ['cs_os' => 'Operating Systems', 'cs_dbms' => 'DBMS & SQL', 'cs_net' => 'Computer Networks', 'cs_dsa' => 'Data Structures & Algorithms',
            'cs_prog' => 'Programming', 'cs_fund' => 'Computer Fundamentals & Digital Logic', 'cs_se' => 'Software Engineering', 'cs_web' => 'Web Technologies',
            'cs_it' => 'IT Tools & Emerging Tech', 'teach' => 'Teaching Methodology', 'ga_static' => 'Static GK', 'ga_current' => 'Current Affairs',
            'rea_verbal' => 'Verbal Reasoning', 'rea_nonverbal' => 'Non-verbal Reasoning', 'num_arith' => 'Arithmetic', 'num_adv' => 'Advanced Maths & DI',
            'english' => 'English Language', 'hindi' => 'Hindi Language'];

        return $labels[$k] ?? ucwords(str_replace('_', ' ', $k));
    }

    /** Plain-English, specific actions ordered by marks at stake. */
    private function improve(array $sections, int $correct, int $incorrect, int $unattempted, int $markedNotEvaluated, float $negLost, int $taken, int $allowed, array $weak, int $attempted): array
    {
        $tips = [];

        // Sections by marks left on the table.
        $gap = array_map(fn ($s) => $s + ['lost' => round($s['max_marks'] - $s['marks'], 2)], $sections);
        usort($gap, fn ($a, $b) => $b['lost'] <=> $a['lost']);
        foreach (array_slice($gap, 0, 3) as $s) {
            if ($s['lost'] <= 0) {
                continue;
            }
            $why = $s['incorrect'] > $s['unattempted'] ? "{$s['incorrect']} wrong answers" : "{$s['unattempted']} questions left";
            $tips[] = ['kind' => 'section', 'priority' => 'high', 'section_key' => $s['key'],
                'title' => "{$s['name']}: {$s['lost']} marks left ({$s['marks']}/{$s['max_marks']})",
                'detail' => "Mostly {$why}. Revise this block's notes and take its chapter tests before the next mock."];
        }

        if ($negLost >= 2) {
            $acc = $attempted ? round($correct / $attempted * 100) : 0;
            $tips[] = ['kind' => 'guessing', 'priority' => $negLost >= 5 ? 'high' : 'medium',
                'title' => "Negative marking cost you {$negLost} marks",
                'detail' => "Accuracy {$acc}%. Answer only when you can rule out two options; a blind guess loses on average."];
        }

        if ($markedNotEvaluated > 0) {
            $tips[] = ['kind' => 'marked', 'priority' => 'high',
                'title' => "{$markedNotEvaluated} answered questions were still marked for review",
                'detail' => 'In the DSSSB exam these are NOT evaluated. Before submitting a group, open each purple question and press Save & Next.'];
        }

        if ($allowed > 0 && $unattempted > 0 && $taken >= $allowed * 0.95) {
            $tips[] = ['kind' => 'speed', 'priority' => 'medium',
                'title' => "Time ran out with {$unattempted} questions untouched",
                'detail' => 'Budget about 12 minutes per group of 20. Skip a question after 60–70 seconds and come back only if time remains in that group.'];
        } elseif ($allowed > 0 && $taken < $allowed * 0.6 && $incorrect > $correct * 0.4) {
            $tips[] = ['kind' => 'rushing', 'priority' => 'medium',
                'title' => 'You finished early but with many wrong answers',
                'detail' => 'Use the spare time: re-read each stem for NOT/EXCEPT and check calculations before saving.'];
        }

        foreach (array_slice($weak, 0, 3) as $w) {
            $tips[] = ['kind' => 'concept', 'priority' => 'medium', 'concept_key' => $w['concept_key'],
                'title' => "Revise {$w['chapter_title']} ({$w['wrong']} wrong)",
                'detail' => 'Open the solutions page and use "Revise this concept" on these questions, then retake the chapter test.'];
        }

        return $tips;
    }
}
