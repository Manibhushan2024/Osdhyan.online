<?php

namespace App\Services;

use App\Models\Test;
use App\Models\TestAttempt;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Section bookkeeping for an attempt at a sectioned test.
 *
 * A test's `sections` are fixed ranges over its question order:
 *   [{key, name_en, name_hi, from, count, duration_sec|null}, …]
 * In `sequential` mode the student works through them in order; a section is
 * locked by the student ("Submit section") or by its own timer, and the next
 * one opens at that moment. Locked sections accept no more answers. When the
 * last section is locked the attempt is submitted.
 *
 * State lives in attempt.metadata['sections']:
 *   {key: {started_at, locked_at|null, locked_by: 'student'|'timer'|null}}
 */
class SectionState
{
    public const MODE_FREE = 'free';
    public const MODE_SEQUENTIAL = 'sequential';

    /** Normalised sections of a test (from/count filled in), or [] when it has none. */
    public static function sectionsOf(Test $test): array
    {
        $raw = $test->sections;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }
        if (!is_array($raw) || !$raw) {
            return [];
        }

        $out = [];
        $cursor = 0;
        foreach (array_values($raw) as $i => $s) {
            $count = max(0, (int) ($s['count'] ?? 0));
            $from = isset($s['from']) ? (int) $s['from'] : $cursor;
            $out[] = [
                'key'          => (string) ($s['key'] ?? ('s' . ($i + 1))),
                'name_en'      => (string) ($s['name_en'] ?? ('Section ' . ($i + 1))),
                'name_hi'      => $s['name_hi'] ?? null,
                'from'         => $from,
                'count'        => $count,
                'duration_sec' => isset($s['duration_sec']) && $s['duration_sec'] !== null ? (int) $s['duration_sec'] : null,
            ];
            $cursor = $from + $count;
        }

        return $out;
    }

    public static function isSequential(Test $test): bool
    {
        return ($test->section_mode ?? self::MODE_FREE) === self::MODE_SEQUENTIAL && self::sectionsOf($test) !== [];
    }

    /**
     * Question ids per section key, in question order (one query).
     * @return array<string, int[]>
     */
    public static function questionIdsBySection(Test $test): array
    {
        $sections = self::sectionsOf($test);
        if (!$sections) {
            return [];
        }
        $ids = \Illuminate\Support\Facades\DB::table('question_test')
            ->where('test_id', $test->id)
            ->orderBy('sort_order')->orderBy('id')
            ->pluck('question_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $map = [];
        foreach ($sections as $s) {
            $map[$s['key']] = array_slice($ids, $s['from'], $s['count']);
        }

        return $map;
    }

    /**
     * Current state of every section for an attempt. Applies timer locks
     * lazily (a section whose time ran out is locked as of its deadline and
     * the next one started then), persisting any change.
     *
     * @return array{mode:string, active_key:?string, all_locked:bool, sections:array<int,array>}
     */
    public static function compute(TestAttempt $attempt, Test $test, bool $persist = true): array
    {
        $sections = self::sectionsOf($test);
        $mode = self::isSequential($test) ? self::MODE_SEQUENTIAL : self::MODE_FREE;
        if (!$sections) {
            return ['mode' => $mode, 'active_key' => null, 'all_locked' => false, 'sections' => []];
        }

        $meta = $attempt->metadata ?? [];
        $state = is_array($meta['sections'] ?? null) ? $meta['sections'] : [];
        $changed = false;
        $now = now();
        $attemptStart = ($attempt->started_at ?? $attempt->created_at ?? $now)->copy();
        $attemptDeadline = $attempt->deadline($test->duration_sec);

        if ($mode === self::MODE_FREE) {
            $rows = [];
            foreach ($sections as $s) {
                $rows[] = $s + ['status' => 'open', 'started_at' => $attemptStart->toISOString(), 'deadline_at' => null, 'remaining_sec' => null, 'locked_at' => null, 'locked_by' => null];
            }

            return ['mode' => $mode, 'active_key' => null, 'all_locked' => false, 'sections' => $rows];
        }

        // Sequential: walk the sections in order; each starts when the previous
        // one locks (first one at attempt start).
        $rows = [];
        $activeKey = null;
        $prevLockedAt = $attemptStart;
        $allLocked = true;

        foreach ($sections as $s) {
            $k = $s['key'];
            $st = $state[$k] ?? [];
            $startedAt = isset($st['started_at']) ? Carbon::parse($st['started_at']) : null;
            $lockedAt = isset($st['locked_at']) ? Carbon::parse($st['locked_at']) : null;
            $lockedBy = $st['locked_by'] ?? null;

            if ($prevLockedAt === null) {
                // An earlier section is still active → this one is pending.
                $rows[] = $s + ['status' => 'pending', 'started_at' => null, 'deadline_at' => null, 'remaining_sec' => null, 'locked_at' => null, 'locked_by' => null];
                $allLocked = false;
                continue;
            }

            if ($startedAt === null) {
                $startedAt = $prevLockedAt->copy();
                $state[$k]['started_at'] = $startedAt->toISOString();
                $changed = true;
            }

            // Section deadline: its own timer (if any), never beyond the attempt deadline.
            $deadline = $s['duration_sec'] ? $startedAt->copy()->addSeconds($s['duration_sec']) : null;
            if ($deadline === null || $deadline->gt($attemptDeadline)) {
                $deadline = $s['duration_sec'] ? $attemptDeadline->copy() : null;
            }

            if ($lockedAt === null && $deadline !== null && $now->gte($deadline)) {
                $lockedAt = $deadline->copy();
                $lockedBy = 'timer';
                $state[$k]['locked_at'] = $lockedAt->toISOString();
                $state[$k]['locked_by'] = 'timer';
                $changed = true;
            }

            if ($lockedAt !== null) {
                $rows[] = $s + [
                    'status' => 'locked', 'started_at' => $startedAt->toISOString(),
                    'deadline_at' => $deadline?->toISOString(), 'remaining_sec' => 0,
                    'locked_at' => $lockedAt->toISOString(), 'locked_by' => $lockedBy,
                ];
                $prevLockedAt = $lockedAt;
                continue;
            }

            // Active section.
            $activeKey = $k;
            $allLocked = false;
            $rows[] = $s + [
                'status' => 'active', 'started_at' => $startedAt->toISOString(),
                'deadline_at' => $deadline?->toISOString(),
                'remaining_sec' => $deadline ? max(0, (int) $now->diffInSeconds($deadline, false)) : null,
                'locked_at' => null, 'locked_by' => null,
            ];
            $prevLockedAt = null;
        }

        if ($changed && $persist) {
            $meta['sections'] = $state;
            $attempt->forceFill(['metadata' => $meta])->save();
        }

        return ['mode' => $mode, 'active_key' => $activeKey, 'all_locked' => $allLocked, 'sections' => $rows];
    }

    /**
     * Lock a section by the student. Returns the new state, or null when the
     * section is not the active one (already locked / not yet open).
     */
    public static function lock(TestAttempt $attempt, Test $test, string $key): ?array
    {
        $state = self::compute($attempt, $test);
        if ($state['mode'] !== self::MODE_SEQUENTIAL || $state['active_key'] !== $key) {
            return null;
        }
        $meta = $attempt->metadata ?? [];
        $meta['sections'][$key]['locked_at'] = now()->toISOString();
        $meta['sections'][$key]['locked_by'] = 'student';
        $meta['sections'][$key]['started_at'] ??= $attempt->started_at?->toISOString();
        $attempt->forceFill(['metadata' => $meta])->save();

        return self::compute($attempt, $test);
    }

    /**
     * Question ids that may still be answered right now. Null = no restriction
     * (free mode or no sections).
     * @return int[]|null
     */
    public static function writableQuestionIds(TestAttempt $attempt, Test $test): ?array
    {
        if (!self::isSequential($test)) {
            return null;
        }
        $state = self::compute($attempt, $test);
        if ($state['active_key'] === null) {
            return [];
        }

        return self::questionIdsBySection($test)[$state['active_key']] ?? [];
    }

    /** Per-section results for a completed attempt (uses the test's sections). */
    public static function results(Test $test, array $key, iterable $responses): array
    {
        $bySection = self::questionIdsBySection($test);
        if (!$bySection) {
            return [];
        }
        $answers = [];
        foreach ($responses as $r) {
            $answers[(int) $r->question_id] = $r->selected_option_id ? (int) $r->selected_option_id : null;
        }
        $out = [];
        foreach (self::sectionsOf($test) as $s) {
            $row = ['key' => $s['key'], 'name_en' => $s['name_en'], 'name_hi' => $s['name_hi'], 'total' => 0, 'correct' => 0, 'incorrect' => 0, 'unattempted' => 0, 'marks' => 0.0, 'max_marks' => 0.0];
            foreach ($bySection[$s['key']] ?? [] as $qid) {
                $q = $key[$qid] ?? null;
                if (!$q) {
                    continue;
                }
                $row['total']++;
                $row['max_marks'] += (float) $q['marks'];
                $sel = $answers[$qid] ?? null;
                if ($sel === null) {
                    $row['unattempted']++;
                } elseif ($sel === (int) $q['correct']) {
                    $row['correct']++;
                    $row['marks'] += (float) $q['marks'];
                } else {
                    $row['incorrect']++;
                    $row['marks'] -= (float) $q['negative'];
                }
            }
            $attempted = $row['correct'] + $row['incorrect'];
            $row['accuracy'] = $attempted ? round($row['correct'] / $attempted * 100, 2) : 0;
            $row['marks'] = round($row['marks'], 2);
            $out[] = $row;
        }

        return $out;
    }
}
