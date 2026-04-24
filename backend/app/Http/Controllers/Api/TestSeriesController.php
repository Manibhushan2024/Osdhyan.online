<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestSeries;
use App\Models\UserTestSeries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestSeriesController extends Controller
{
    public function index(Request $request)
    {
        $query = TestSeries::with(['exam'])->where('is_published', true);

        if ($request->has('exam_id')) {
            $query->where('exam_id', $request->exam_id);
        }

        $series = $query->get();

        // Check enrollment status for current user if logged in
        if (Auth::check()) {
            $enrolledIds = Auth::user()->enrolledTestSeries()->pluck('test_series.id')->toArray();
            $series->map(function($s) use ($enrolledIds) {
                $s->is_enrolled = in_array($s->id, $enrolledIds);
                return $s;
            });
        }

        return response()->json($series);
    }

    public function enrolled(Request $request)
    {
        $user = Auth::user();
        $series = $user->enrolledTestSeries()->with(['exam'])->get();
        
        return response()->json($series);
    }

    public function show(TestSeries $series)
    {
        $series->load(['exam', 'tests' => function($query) {
            $query->where('status', 'published');
        }]);

        $isEnrolled = false;
        if (Auth::check()) {
            $isEnrolled = Auth::user()
                ->enrolledTestSeries()
                ->where('test_series.id', $series->id)
                ->exists();
        }

        if (Auth::check()) {
            $testIds = $series->tests->pluck('id');
            $attempts = \App\Models\TestAttempt::where('user_id', Auth::id())
                ->whereIn('test_id', $testIds)
                ->orderBy('id', 'desc')
                ->get()
                ->groupBy('test_id');
            
            $series->tests->each(function($test) use ($attempts) {
                 $latest = $attempts->get($test->id)?->first();
                 $test->attempt_status = $latest ? $latest->status : 'none';
                 $test->attempt_id = $latest ? $latest->id : null;
            });
        } else {
            $series->tests->each(function ($test) {
                $test->attempt_status = 'none';
                $test->attempt_id = null;
            });
        }

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
            'content' => $groupedContent,
            'stats' => [
                'total_tests' => $series->tests->count(),
                'free_tests' => 0, // Logic for free tests can be added later
                'users_count' => UserTestSeries::where('test_series_id', $series->id)->count(),
            ]
        ]);
    }

    public function enroll(TestSeries $series)
    {
        $user = Auth::user();
        
        UserTestSeries::firstOrCreate([
            'user_id' => $user->id,
            'test_series_id' => $series->id,
        ]);

        return response()->json(['message' => 'Enrolled successfully']);
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
