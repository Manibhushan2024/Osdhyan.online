<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestSeries;
use App\Models\UserTestSeries;
use App\Services\Payments\UserAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestSeriesController extends Controller
{
    public function index(Request $request)
    {
        $query = TestSeries::with(['exam'])->withCount('tests')->where('is_published', true);

        if ($request->has('exam_id')) {
            $query->where('exam_id', $request->exam_id);
        }

        $series = $query->get();
        $series->each(fn ($s) => $s->stats = ['total_tests' => (int) $s->tests_count]);

        // Check enrollment status for current user if logged in
        if (Auth::check()) {
            $enrolledIds = Auth::user()->enrolledTestSeries()->pluck('test_series.id')->toArray();
            $activeIds = UserAccess::activeSeriesIds(Auth::user(), $series->pluck('id')->all())->flip();
            $series->map(function($s) use ($enrolledIds, $activeIds) {
                $s->is_enrolled = in_array($s->id, $enrolledIds);
                $s->has_access = $activeIds->has($s->id);
                $s->requires_payment = $s->requiresPayment();
                return $s;
            });
        }

        return response()->json($series);
    }

    public function enrolled(Request $request)
    {
        $user = Auth::user();
        $series = $user->enrolledTestSeries()
            ->withPivot(['access_expires_at', 'order_id'])
            ->with(['exam'])
            ->withCount('tests')
            ->get();

        $series->each(function ($s) {
            $s->stats = ['total_tests' => (int) $s->tests_count];
            $expires = $s->pivot?->access_expires_at;
            $s->access_expires_at = $expires ? \Illuminate\Support\Carbon::parse($expires)->toISOString() : null;
            $s->has_access = $expires === null || \Illuminate\Support\Carbon::parse($expires)->isFuture();
            $s->requires_payment = $s->requiresPayment();
            unset($s->pivot);
        });

        return response()->json($series);
    }

    public function show(TestSeries $series)
    {
        if (!$series->is_published && !Auth::user()?->isAdminUser()) {
            abort(404);
        }

        $series->load(['exam', 'tests' => function($query) {
            $query->where('status', 'published');
        }]);

        $isEnrolled = false;
        $hasAccess = false;
        $accessExpiresAt = null;
        if (Auth::check()) {
            $isEnrolled = Auth::user()
                ->enrolledTestSeries()
                ->where('test_series.id', $series->id)
                ->exists();
            $hasAccess = UserAccess::hasActiveAccess(Auth::user(), $series);
            $accessExpiresAt = UserAccess::accessExpiresAt(Auth::user(), $series)?->toISOString();
        }

        $requiresPayment = $series->requiresPayment();

        // Every test carries its latest attempt, its last COMPLETED attempt
        // (so a result stays reachable while a re-attempt is in progress)
        // and how many times it was completed.
        $history = Auth::check()
            ? \App\Services\AttemptHistory::forTests(Auth::id(), $series->tests->pluck('id'))
            : collect();
        $series->tests->each(function ($test) use ($history) {
            \App\Services\AttemptHistory::apply($test, $history->get($test->id));
        });

        // Lock flags per test (same rule startAttempt enforces).
        $isAdmin = (bool) Auth::user()?->isAdminUser();
        $flags = UserAccess::flagsForTests($series->tests, Auth::user());
        $series->tests->each(function ($test) use ($flags, $isAdmin) {
            $f = $flags[(int) $test->id] ?? null;
            $test->requires_purchase = (bool) ($f['requires_purchase'] ?? false);
            $test->is_locked = !$isAdmin && (bool) ($f['is_locked'] ?? false);
        });

        $groupedContent = $series->tests
            ->groupBy(function ($test) {
                return $test->category ?: 'full_test';
            })
            ->map(function ($tests) {
                return $tests->values();
            });

        return response()->json([
            'series' => $series,
            'is_enrolled' => $isEnrolled,
            'has_access' => $hasAccess,
            'access_expires_at' => $accessExpiresAt,
            'requires_payment' => $requiresPayment,
            'pricing' => [
                'is_paid'       => $requiresPayment,
                'price'         => (float) $series->price,
                'mrp'           => $series->mrp !== null ? (float) $series->mrp : null,
                'currency'      => $series->currencyCode(),
                'amount'        => $series->priceInPaise(),
                'validity_days' => $series->validity_days,
            ],
            'content' => $groupedContent,
            'stats' => [
                'total_tests' => $series->tests->count(),
                'free_tests' => $series->tests->filter(fn ($t) => (bool) $t->is_free || !($t->requires_purchase ?? false))->count(),
                'users_count' => UserTestSeries::where('test_series_id', $series->id)->count(),
            ]
        ]);
    }

    public function enroll(TestSeries $series)
    {
        $user = Auth::user();

        if ($series->requiresPayment() && !UserAccess::hasActiveAccess($user, $series)) {
            return response()->json([
                'message'  => 'This test series is paid. Complete the purchase to enroll.',
                'code'     => 'PAYMENT_REQUIRED',
                'price'    => (float) $series->price,
                'mrp'      => $series->mrp !== null ? (float) $series->mrp : null,
                'currency' => $series->currencyCode(),
                'amount'   => $series->priceInPaise(),
            ], 402);
        }

        UserAccess::grant($user, $series);

        return response()->json([
            'message'           => 'Enrolled successfully',
            'enrolled'          => true,
            'access_expires_at' => UserAccess::accessExpiresAt($user, $series)?->toISOString(),
        ]);
    }

    public function unenroll(TestSeries $series)
    {
        $user = Auth::user();

        UserTestSeries::where('user_id', $user->id)
            ->where('test_series_id', $series->id)
            ->delete();

        return response()->json(['message' => 'Unenrolled successfully']);
    }
}
