<?php

namespace App\Services\StudyPlan;

/**
 * Lays one slot's tasks (say Thursday's "library" time) into its clock
 * windows, in order. A task starts at the next free minute; when it does not
 * fit in the rest of the current window it moves to the next window where it
 * fits. With breaks on (library / weekend), a 10-minute break comes before
 * the next task once 90 minutes have run back to back — breaks are just the
 * gaps between tasks.
 *
 * Budget: the slot's minutes, capped at the windows' total.
 */
final class SlotLayout
{
    public const BREAK_AFTER = 90;
    public const BREAK_MIN = 10;

    /** @var array<int, array{0:int, 1:int}> [start, end] in minutes after midnight, sorted */
    private array $windows;
    private int $budget;
    private int $w = 0;       // current window
    private int $cursor = 0;  // next free minute in it
    private int $run = 0;     // minutes worked back to back up to the cursor
    private int $used = 0;    // task minutes placed

    public function __construct(array $windows, private bool $breaks, int $budget)
    {
        $this->windows = array_values($windows);
        $this->cursor = $this->windows[0][0] ?? 0;
        $this->budget = max(0, min($budget, self::total($this->windows)));
    }

    public static function total(array $windows): int
    {
        return (int) array_sum(array_map(fn ($w) => max(0, $w[1] - $w[0]), $windows));
    }

    /** "HH:MM" → minutes after midnight (null when not a valid time). */
    public static function minute(mixed $hhmm): ?int
    {
        if (!is_string($hhmm) || !preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $hhmm, $m)) {
            return null;
        }

        return (int) $m[1] * 60 + (int) $m[2];
    }

    public static function clock(int $minute): string
    {
        $minute = max(0, min(23 * 60 + 59, $minute));

        return sprintf('%02d:%02d', intdiv($minute, 60), $minute % 60);
    }

    public function budget(): int
    {
        return $this->budget;
    }

    public function left(): int
    {
        return max(0, $this->budget - $this->used);
    }

    public function isEmpty(): bool
    {
        return $this->used === 0;
    }

    /** Length of the longest window. */
    public function longest(): int
    {
        $best = 0;
        foreach ($this->windows as [$s, $e]) {
            $best = max($best, $e - $s);
        }

        return $best;
    }

    /** Longest task that can still be placed (in any window ahead), within the budget. */
    public function room(): int
    {
        $best = 0;
        foreach ($this->windows as $i => [$s, $e]) {
            if ($i >= $this->w) {
                $best = max($best, $e - ($i === $this->w ? $this->nextStart() : $s));
            }
        }

        return max(0, min($best, $this->left()));
    }

    /** Longest task that fits in the rest of the current window. */
    public function currentRoom(): int
    {
        if (!isset($this->windows[$this->w])) {
            return 0;
        }

        return max(0, min($this->windows[$this->w][1] - $this->nextStart(), $this->left()));
    }

    public function fits(int $minutes): bool
    {
        return $minutes <= $this->left() && $this->find($minutes) !== null;
    }

    /** Would these tasks, one after the other, all fit? */
    public function fitsAll(array $list): bool
    {
        $copy = clone $this;
        foreach ($list as $minutes) {
            if (!$copy->fits($minutes)) {
                return false;
            }
            $copy->place($minutes);
        }

        return true;
    }

    /** @return array{0:string, 1:string} start and end as "HH:MM" */
    public function place(int $minutes): array
    {
        $at = $this->find($minutes);
        if ($at === null) {
            if ($this->used === 0 && $this->windows) {
                // Fits in no window (a 2-hour mock, every window shorter):
                // start it at the start of the longest window.
                $best = 0;
                foreach ($this->windows as $i => [$s, $e]) {
                    if ($e - $s > $this->windows[$best][1] - $this->windows[$best][0]) {
                        $best = $i;
                    }
                }
                $at = [$best, $this->windows[$best][0]];
            } else {
                $at = [$this->w, $this->nextStart()];
            }
        }
        [$i, $start] = $at;
        $this->run = ($i === $this->w && $start === $this->cursor && $this->used > 0) ? $this->run + $minutes : $minutes;
        $this->w = $i;
        $this->cursor = $start + $minutes;
        $this->used += $minutes;

        return [self::clock($start), self::clock($start + $minutes)];
    }

    /** @return array{0:int, 1:int}|null [window, start minute] */
    private function find(int $minutes): ?array
    {
        foreach ($this->windows as $i => [$s, $e]) {
            if ($i < $this->w) {
                continue;
            }
            $start = $i === $this->w ? $this->nextStart() : $s;
            if ($start + $minutes <= $e) {
                return [$i, $start];
            }
        }

        return null;
    }

    private function nextStart(): int
    {
        return $this->cursor + ($this->breaks && $this->run >= self::BREAK_AFTER ? self::BREAK_MIN : 0);
    }
}
