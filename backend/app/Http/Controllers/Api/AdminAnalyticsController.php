<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
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
        $data = Cache::remember('admin_analytics_overview_v2', 300, function () {

            $totalStudents     = User::where('is_admin', false)->count();
            $newStudentsToday  = User::where('is_admin', false)->whereDate('created_at', today())->count();
            $totalAttempts     = TestAttempt::where('status', 'completed')->count();
            $attemptsToday     = TestAttempt::where('status', 'completed')->whereDate('completed_at', today())->count();
            $totalSubjects     = Subject::count();
            $totalTests        = Test::where('status', 'published')->count();

            // Study hours: sum of total_study_time_prod_sec / 3600
            $totalStudyHours   = (int) round(
                User::where('is_admin', false)->sum('total_study_time_prod_sec') / 3600
            );

            // Last 7 days acquisition trend
            $acquisitionTrend = DB::table('users')
                ->select(DB::raw("DATE(created_at) as date"), DB::raw("COUNT(*) as count"))
                ->where('is_admin', false)
                ->where('created_at', '>=', now()->subDays(6)->startOfDay())
                ->groupBy(DB::raw("DATE(created_at)"))
                ->orderBy('date')
                ->get()
                ->map(fn($row) => ['date' => $row->date, 'count' => (int) $row->count])
                ->toArray();

            // Recent activity: latest completed attempts with user + test info
            $recentActivity = TestAttempt::with(['user:id,name', 'test:id,name_en'])
                ->where('status', 'completed')
                ->whereNotNull('completed_at')
                ->latest('completed_at')
                ->limit(8)
                ->get()
                ->map(fn($a) => [
                    'user_name'    => $a->user?->name ?? 'Unknown',
                    'test_title'   => $a->test?->name_en ?? 'Unknown Test',
                    'total_score'  => (int) ($a->total_score ?? 0),
                    'completed_at' => $a->completed_at,
                ])
                ->toArray();

            return [
                'stats' => [
                    'total_students'    => $totalStudents,
                    'new_students_today'=> $newStudentsToday,
                    'total_attempts'    => $totalAttempts,
                    'attempts_today'    => $attemptsToday,
                    'total_study_hours' => $totalStudyHours,
                    'total_subjects'    => $totalSubjects,
                    'total_tests'       => $totalTests,
                ],
                'acquisition_trend' => $acquisitionTrend,
                'recent_activity'   => $recentActivity,
            ];
        });

        return response()->json($data);
    }
}
