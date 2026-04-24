<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function getOverview(): JsonResponse
    {
        $data = Cache::remember('admin_analytics_overview', 600, function () {
            $totalUsers = User::count();
            $activeToday = User::whereDate('updated_at', today())->count();
            $totalAttempts = TestAttempt::where('status', 'completed')->count();
            $attemptsToday = TestAttempt::where('status', 'completed')
                ->whereDate('completed_at', today())->count();
            $avgAccuracy = TestAttempt::where('status', 'completed')
                ->join('tests', 'test_attempts.test_id', '=', 'tests.id')
                ->selectRaw('AVG(test_attempts.total_score / NULLIF(tests.total_marks, 0) * 100) as avg')
                ->value('avg');
            $popularTests = Test::withCount(['attempts' => fn($q) => $q->where('status', 'completed')])
                ->orderByDesc('attempts_count')
                ->limit(5)
                ->get(['id', 'name_en', 'attempts_count']);

            return compact('totalUsers', 'activeToday', 'totalAttempts', 'attemptsToday', 'avgAccuracy', 'popularTests');
        });

        return response()->json(['data' => $data]);
    }
}
