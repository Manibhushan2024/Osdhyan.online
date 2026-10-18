<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\TestSeries;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for "can this user open this series / test".
 *
 * An enrolment row in user_test_series is active while access_expires_at is
 * null (lifetime) or in the future. Paid series only ever get a row through a
 * paid order (or an admin), because the enroll endpoint refuses them.
 *
 * A test is locked when it sits in at least one paid series, in no free
 * series, is not flagged is_free, and the user holds no active enrolment in
 * any of its paid series.
 */
class UserAccess
{
    // ─── Series ───────────────────────────────────────────────────────────────

    public static function hasActiveAccess(?User $user, TestSeries|int $series): bool
    {
        if (!$user) {
            return false;
        }

        return self::activeSeriesIds($user, [$series instanceof TestSeries ? $series->id : $series])->isNotEmpty();
    }

    /** Expiry of the user's enrolment in a series (null = lifetime or not enrolled). */
    public static function accessExpiresAt(?User $user, TestSeries|int $series): ?Carbon
    {
        if (!$user) {
            return null;
        }

        $value = DB::table('user_test_series')
            ->where('user_id', $user->id)
            ->where('test_series_id', $series instanceof TestSeries ? $series->id : $series)
            ->value('access_expires_at');

        return $value ? Carbon::parse($value) : null;
    }

    /**
     * Ids of the series the user currently has access to, optionally limited
     * to $onlyIds. One query.
     *
     * @return Collection<int, int>
     */
    public static function activeSeriesIds(?User $user, ?array $onlyIds = null): Collection
    {
        if (!$user) {
            return collect();
        }

        $query = DB::table('user_test_series')
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('access_expires_at')->orWhere('access_expires_at', '>', now());
            });

        if ($onlyIds !== null) {
            if ($onlyIds === []) {
                return collect();
            }
            $query->whereIn('test_series_id', $onlyIds);
        }

        return $query->pluck('test_series_id')->map(fn ($id) => (int) $id)->values();
    }

    /**
     * Enrol the user (idempotent). For paid orders the expiry comes from the
     * order; a later purchase extends access rather than shortening it.
     */
    public static function grant(User $user, TestSeries $series, ?Order $order = null, ?Carbon $expiresAt = null): void
    {
        $existing = DB::table('user_test_series')
            ->where('user_id', $user->id)
            ->where('test_series_id', $series->id)
            ->first();

        $expiry = $order?->expires_at ?? $expiresAt;

        if ($existing) {
            $current = $existing->access_expires_at ? Carbon::parse($existing->access_expires_at) : null;
            // Lifetime (null) wins; otherwise keep the later of the two dates.
            $newExpiry = ($current === null || $expiry === null)
                ? null
                : ($current->gt($expiry) ? $current : $expiry);

            DB::table('user_test_series')
                ->where('id', $existing->id)
                ->update([
                    'access_expires_at' => $newExpiry,
                    'order_id'          => $order?->id ?? $existing->order_id,
                    'updated_at'        => now(),
                ]);

            return;
        }

        DB::table('user_test_series')->insert([
            'user_id'           => $user->id,
            'test_series_id'    => $series->id,
            'access_expires_at' => $expiry,
            'order_id'          => $order?->id,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    /**
     * Compute purchase flags for a set of tests in two queries.
     *
     * @param  Collection<int, \App\Models\Test>|array $tests  models exposing id + is_free
     * @return array<int, array{requires_purchase: bool, is_locked: bool, test_series_id: ?int}>
     */
    public static function flagsForTests(Collection|array $tests, ?User $user): array
    {
        $tests = collect($tests);
        if ($tests->isEmpty()) {
            return [];
        }

        $ids = $tests->pluck('id')->map(fn ($id) => (int) $id)->all();

        // test_id → [[series_id, is_paid], ...]
        $memberships = DB::table('test_series_tests as tst')
            ->join('test_series as ts', 'ts.id', '=', 'tst.test_series_id')
            ->whereIn('tst.test_id', $ids)
            ->get(['tst.test_id', 'tst.test_series_id', 'ts.is_paid'])
            ->groupBy('test_id');

        $paidSeriesIds = $memberships->flatten(1)
            ->filter(fn ($row) => (bool) $row->is_paid)
            ->pluck('test_series_id')
            ->unique()
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $accessible = $paidSeriesIds === []
            ? collect()
            : self::activeSeriesIds($user, $paidSeriesIds)->flip();

        $flags = [];
        foreach ($tests as $test) {
            $id = (int) $test->id;
            $rows = $memberships->get($id, collect());

            $paid = $rows->filter(fn ($r) => (bool) $r->is_paid)->pluck('test_series_id')->map(fn ($v) => (int) $v);
            $inFree = $rows->contains(fn ($r) => !(bool) $r->is_paid);
            $isFree = (bool) ($test->is_free ?? true);

            $requires = $paid->isNotEmpty() && !$inFree && !$isFree;
            $hasAccess = $paid->contains(fn ($sid) => $accessible->has($sid));

            $flags[$id] = [
                'requires_purchase' => $requires,
                'is_locked'         => $requires && !$hasAccess,
                'test_series_id'    => $requires && !$hasAccess ? (int) $paid->first() : null,
            ];
        }

        return $flags;
    }

    /** The paid series blocking this test for the user, or null when open. */
    public static function lockingSeriesId(\App\Models\Test $test, ?User $user): ?int
    {
        $flags = self::flagsForTests([$test], $user);

        return $flags[(int) $test->id]['test_series_id'] ?? null;
    }
}
