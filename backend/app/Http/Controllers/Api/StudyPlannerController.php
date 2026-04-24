<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DayClosing;
use App\Models\StudyGoal;
use App\Models\StudyNode;
use App\Models\StudySession;
use App\Models\StudyTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudyPlannerController extends Controller
{
    // ─── Dashboard ────────────────────────────────────────────────────────────

    public function getDashboardData(Request $request): JsonResponse
    {
        $user  = $request->user();
        $today = today();

        // ── Study time ────────────────────────────────────────────────────────
        $todayStudySec = (int) StudySession::where('user_id', $user->id)
            ->whereDate('started_at', $today)
            ->whereIn('status', ['completed', 'paused'])
            ->sum('duration_sec');

        $todayStudyMin = (int) round($todayStudySec / 60);

        // ── Goal / targets ────────────────────────────────────────────────────
        $activeGoal        = StudyGoal::where('user_id', $user->id)->where('status', 'active')->latest()->first();
        $baseTargetMin     = $activeGoal ? (int) $activeGoal->target_minutes : 120;

        // Overdue / rollover minutes from yesterday's unfinished goal
        $yesterdayStudyMin = (int) round(
            StudySession::where('user_id', $user->id)
                ->whereDate('started_at', $today->copy()->subDay())
                ->whereIn('status', ['completed', 'paused'])
                ->sum('duration_sec') / 60
        );
        $rolloverMin = max(0, $baseTargetMin - $yesterdayStudyMin);

        $todayTargetMin     = $baseTargetMin + $rolloverMin;
        $todayRemainingMin  = max(0, $todayTargetMin - $todayStudyMin);

        // ── Weekly data ───────────────────────────────────────────────────────
        $weekStart = $today->copy()->startOfWeek();
        $weeklyStudySec = (int) StudySession::where('user_id', $user->id)
            ->whereBetween('started_at', [$weekStart, $today->copy()->endOfDay()])
            ->whereIn('status', ['completed', 'paused'])
            ->sum('duration_sec');
        $weeklyStudyMin    = (int) round($weeklyStudySec / 60);
        $weeklyTargetMin   = $baseTargetMin * 7;
        $weeklyRemainingMin = max(0, $weeklyTargetMin - $weeklyStudyMin);

        // ── Monthly data ──────────────────────────────────────────────────────
        $monthStart = $today->copy()->startOfMonth();
        $monthlyStudySec = (int) StudySession::where('user_id', $user->id)
            ->whereBetween('started_at', [$monthStart, $today->copy()->endOfDay()])
            ->whereIn('status', ['completed', 'paused'])
            ->sum('duration_sec');
        $monthlyStudyMin    = (int) round($monthlyStudySec / 60);
        $daysInMonth        = (int) $today->daysInMonth;
        $monthlyTargetMin   = $baseTargetMin * $daysInMonth;
        $monthlyRemainingMin = max(0, $monthlyTargetMin - $monthlyStudyMin);

        // ── Weekly timeline (last 7 days) ─────────────────────────────────────
        $weeklyTimeline = [];
        for ($i = 6; $i >= 0; $i--) {
            $day    = $today->copy()->subDays($i);
            $daySec = (int) StudySession::where('user_id', $user->id)
                ->whereDate('started_at', $day)
                ->whereIn('status', ['completed', 'paused'])
                ->sum('duration_sec');
            $weeklyTimeline[] = [
                'date'           => $day->toDateString(),
                'label'          => $day->format('D'),
                'target_minutes' => $baseTargetMin,
                'actual_minutes' => (int) round($daySec / 60),
            ];
        }

        // ── Tasks ─────────────────────────────────────────────────────────────
        $todayTasks = StudyTask::where('user_id', $user->id)
            ->whereDate('scheduled_date', $today)
            ->orderBy('sort_order')->orderBy('id')
            ->get();

        $weeklyTasks = StudyTask::where('user_id', $user->id)
            ->whereBetween('scheduled_date', [$weekStart->toDateString(), $today->copy()->endOfWeek()->toDateString()])
            ->where('is_completed', false)
            ->orderBy('scheduled_date')->orderBy('sort_order')
            ->get();

        $overdueCount = StudyTask::where('user_id', $user->id)
            ->where('scheduled_date', '<', $today->toDateString())
            ->where('is_completed', false)
            ->count();

        // ── Today closing log ─────────────────────────────────────────────────
        $todayClosing = DayClosing::where('user_id', $user->id)
            ->whereDate('closed_date', $today)
            ->first();

        // ── Yesterday closing (for oath playback) ────────────────────────────
        $previousClosing = DayClosing::where('user_id', $user->id)
            ->whereDate('closed_date', $today->copy()->subDay())
            ->first();

        // ── Nodes (plan_nodes) ────────────────────────────────────────────────
        $nodes = StudyNode::where('user_id', $user->id)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')->orderBy('id')
            ->get()
            ->map(fn($n) => $this->nodeResource($n))
            ->values();

        // ── Suggestion ────────────────────────────────────────────────────────
        $suggestion = $todayStudyMin >= $todayTargetMin
            ? 'Great job! You\'ve hit your daily target.'
            : ($todayStudyMin > 0
                ? 'Keep going — you\'re ' . $this->fmtMin($todayRemainingMin) . ' away from today\'s goal.'
                : 'Start a study session to begin tracking your progress.');

        return response()->json([
            'monthly_plan'  => null,
            'weekly_plan'   => null,
            'today_log'     => [
                'total_study_time' => $todayStudyMin,
                'is_closed'        => (bool) $todayClosing,
                'tomorrow_task'    => $todayClosing?->tomorrow_task,
            ],
            'tasks'         => $todayTasks->values(),
            'today_tasks'   => $todayTasks->values(),
            'weekly_tasks'  => $weeklyTasks->values(),
            'report'        => [
                'daily'   => ['target_minutes' => $todayTargetMin,   'actual_minutes' => $todayStudyMin,   'remaining_minutes' => $todayRemainingMin],
                'weekly'  => ['target_minutes' => $weeklyTargetMin,  'actual_minutes' => $weeklyStudyMin,  'remaining_minutes' => $weeklyRemainingMin],
                'monthly' => ['target_minutes' => $monthlyTargetMin, 'actual_minutes' => $monthlyStudyMin, 'remaining_minutes' => $monthlyRemainingMin],
                'suggestion' => $suggestion,
            ],
            'targets'       => [
                'daily_base_target_minutes'  => $baseTargetMin,
                'today_target_minutes'       => $todayTargetMin,
                'today_remaining_minutes'    => $todayRemainingMin,
                'rollover_minutes'           => $rolloverMin,
                'weekly_remaining_minutes'   => $weeklyRemainingMin,
                'monthly_remaining_minutes'  => $monthlyRemainingMin,
            ],
            'weekly_timeline'        => $weeklyTimeline,
            'previous_day'           => $previousClosing ? [
                'voice_note_url' => $previousClosing->voice_note_path
                    ? asset('storage/' . $previousClosing->voice_note_path)
                    : null,
                'tomorrow_task' => $previousClosing->tomorrow_task,
                'play_oath'     => (bool) $previousClosing->voice_note_path,
            ] : null,
            'overdue_tasks_count'    => $overdueCount,
            'plan_nodes'             => $nodes,
            'focus_sections'         => $nodes,
            'active_section_session' => null,
        ]);
    }

    // ─── Goals ────────────────────────────────────────────────────────────────

    public function setGoal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id'        => 'nullable|exists:exams,id',
            'subject_id'     => 'nullable|exists:subjects,id',
            'target_minutes' => 'required|integer|min:1',
            'target_date'    => 'nullable|date|after:today',
        ]);

        StudyGoal::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        $goal = StudyGoal::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'status'  => 'active',
        ]));

        return response()->json(['data' => $goal], 201);
    }

    // ─── Activity log ─────────────────────────────────────────────────────────

    public function logActivity(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject_id'  => 'nullable|exists:subjects,id',
            'topic_id'    => 'nullable|exists:topics,id',
            'duration_sec'=> 'required|integer|min:1',
        ]);

        $session = StudySession::create(array_merge($data, [
            'user_id'    => $request->user()->id,
            'started_at' => now()->subSeconds($data['duration_sec']),
            'ended_at'   => now(),
            'status'     => 'completed',
        ]));

        DB::table('users')
            ->where('id', $request->user()->id)
            ->increment('total_study_time_prod_sec', $data['duration_sec']);

        return response()->json(['data' => $session], 201);
    }

    // ─── Close day ────────────────────────────────────────────────────────────

    public function closeDay(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tomorrow_task'    => 'nullable|string|max:500',
            'carry_unfinished' => 'nullable|boolean',
            'reschedule_date'  => 'nullable|date|after_or_equal:today',
            'voice_note'       => 'nullable|file|mimes:webm,mp4,ogg,wav,mp3|max:5120',
        ]);

        $user  = $request->user();
        $today = today();

        $voicePath = null;
        if ($request->hasFile('voice_note')) {
            $voicePath = $request->file('voice_note')
                ->store("voice-notes/{$user->id}", 'public');
        }

        DayClosing::updateOrCreate(
            ['user_id' => $user->id, 'closed_date' => $today],
            [
                'tomorrow_task'    => $data['tomorrow_task'] ?? null,
                'voice_note_path'  => $voicePath,
                'carry_unfinished' => (bool) ($data['carry_unfinished'] ?? true),
                'reschedule_date'  => $data['reschedule_date'] ?? $today->addDay()->toDateString(),
            ]
        );

        // Create tomorrow task if provided
        if (!empty($data['tomorrow_task'])) {
            $reschedule = $data['reschedule_date'] ?? $today->copy()->addDay()->toDateString();
            StudyTask::create([
                'user_id'        => $user->id,
                'title'          => $data['tomorrow_task'],
                'scheduled_date' => $reschedule,
            ]);
        }

        // Carry unfinished tasks to reschedule_date
        if ($data['carry_unfinished'] ?? true) {
            $targetDate = $data['reschedule_date'] ?? $today->copy()->addDay()->toDateString();
            StudyTask::where('user_id', $user->id)
                ->whereDate('scheduled_date', $today)
                ->where('is_completed', false)
                ->update(['scheduled_date' => $targetDate]);
        }

        return response()->json(['message' => 'Day closed successfully.']);
    }

    // ─── Tasks ────────────────────────────────────────────────────────────────

    public function addTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'scheduled_date' => 'nullable|date',
            'due_date'       => 'nullable|date',
        ]);

        $task = StudyTask::create(array_merge($data, ['user_id' => $request->user()->id]));

        return response()->json(['data' => $task], 201);
    }

    public function toggleTask(Request $request, int $task): JsonResponse
    {
        $studyTask = StudyTask::where('user_id', $request->user()->id)
            ->findOrFail($task);

        $studyTask->update([
            'is_completed' => !$studyTask->is_completed,
            'completed_at' => !$studyTask->is_completed ? now() : null,
        ]);

        return response()->json(['data' => $studyTask->fresh()]);
    }

    public function rescheduleTask(Request $request, int $task): JsonResponse
    {
        $data = $request->validate([
            'scheduled_date' => 'required|date',
        ]);

        $studyTask = StudyTask::where('user_id', $request->user()->id)
            ->findOrFail($task);

        $studyTask->update(['scheduled_date' => $data['scheduled_date']]);

        return response()->json(['data' => $studyTask->fresh()]);
    }

    // ─── Nodes ────────────────────────────────────────────────────────────────

    public function listNodes(Request $request): JsonResponse
    {
        $nodes = StudyNode::where('user_id', $request->user()->id)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn($n) => $this->nodeResource($n));

        return response()->json(['data' => $nodes]);
    }

    public function addNode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'parent_id'  => 'nullable|exists:study_nodes,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id'   => 'nullable|exists:topics,id',
            'color'      => 'nullable|string|max:20',
        ]);

        // Validate parent belongs to this user
        if (!empty($data['parent_id'])) {
            StudyNode::where('user_id', $request->user()->id)->findOrFail($data['parent_id']);
        }

        $node = StudyNode::create(array_merge($data, ['user_id' => $request->user()->id]));

        return response()->json(['data' => $this->nodeResource($node)], 201);
    }

    public function updateNode(Request $request, int $node): JsonResponse
    {
        $studyNode = StudyNode::where('user_id', $request->user()->id)->findOrFail($node);

        $data = $request->validate([
            'title'  => 'sometimes|string|max:255',
            'color'  => 'nullable|string|max:20',
            'status' => 'sometimes|string|in:pending,in_progress,done',
        ]);

        $studyNode->update($data);

        return response()->json(['data' => $this->nodeResource($studyNode->fresh())]);
    }

    public function moveNode(Request $request, int $node): JsonResponse
    {
        $studyNode = StudyNode::where('user_id', $request->user()->id)->findOrFail($node);

        $data = $request->validate([
            'parent_id'  => 'nullable|exists:study_nodes,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if (array_key_exists('parent_id', $data) && !empty($data['parent_id'])) {
            StudyNode::where('user_id', $request->user()->id)->findOrFail($data['parent_id']);
        }

        $studyNode->update(array_filter($data, fn($v) => $v !== null));

        return response()->json(['data' => $this->nodeResource($studyNode->fresh())]);
    }

    public function deleteNode(Request $request, int $node): JsonResponse
    {
        $studyNode = StudyNode::where('user_id', $request->user()->id)->findOrFail($node);

        // Re-parent children to deleted node's parent
        StudyNode::where('parent_id', $studyNode->id)
            ->update(['parent_id' => $studyNode->parent_id]);

        $studyNode->delete();

        return response()->json(['message' => 'Node deleted.']);
    }

    // ─── Node timers ──────────────────────────────────────────────────────────

    public function getActiveNodeTimer(Request $request): JsonResponse
    {
        $node = StudyNode::where('user_id', $request->user()->id)
            ->whereNotNull('timer_started_at')
            ->first();

        if (!$node) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => array_merge($this->nodeResource($node)->toArray(), [
                'elapsed_sec' => $node->elapsed_seconds,
            ]),
        ]);
    }

    public function startNodeTimer(Request $request, int $node): JsonResponse
    {
        $studyNode = StudyNode::where('user_id', $request->user()->id)->findOrFail($node);

        if ($studyNode->timer_started_at) {
            return response()->json(['message' => 'Timer already running.'], 409);
        }

        // Stop any other running timer for this user
        StudyNode::where('user_id', $request->user()->id)
            ->whereNotNull('timer_started_at')
            ->each(function ($n) {
                $elapsed = (int) now()->diffInSeconds($n->timer_started_at);
                $n->update([
                    'total_time_sec'  => $n->total_time_sec + $elapsed,
                    'timer_started_at'=> null,
                ]);
            });

        $studyNode->update([
            'timer_started_at' => now(),
            'status'           => 'in_progress',
        ]);

        return response()->json(['data' => $this->nodeResource($studyNode->fresh())]);
    }

    public function stopNodeTimer(Request $request, int $node): JsonResponse
    {
        $studyNode = StudyNode::where('user_id', $request->user()->id)->findOrFail($node);

        if (!$studyNode->timer_started_at) {
            return response()->json(['message' => 'Timer is not running.'], 409);
        }

        $elapsed = (int) now()->diffInSeconds($studyNode->timer_started_at);

        $studyNode->update([
            'total_time_sec'  => $studyNode->total_time_sec + $elapsed,
            'timer_started_at'=> null,
        ]);

        // Log the study session
        StudySession::create([
            'user_id'    => $request->user()->id,
            'topic_id'   => $studyNode->topic_id,
            'started_at' => $studyNode->timer_started_at ?? now()->subSeconds($elapsed),
            'ended_at'   => now(),
            'duration_sec'=> $elapsed,
            'status'     => 'completed',
        ]);

        DB::table('users')
            ->where('id', $request->user()->id)
            ->increment('total_study_time_prod_sec', $elapsed);

        return response()->json(['data' => $this->nodeResource($studyNode->fresh())]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function nodeResource(StudyNode $node): \Illuminate\Support\Collection
    {
        return collect([
            'id'           => $node->id,
            'title'        => $node->title,
            'color'        => $node->color,
            'status'       => $node->status,
            'parent_id'    => $node->parent_id,
            'subject_id'   => $node->subject_id,
            'topic_id'     => $node->topic_id,
            'total_time_sec'=> $node->total_time_sec,
            'elapsed_sec'  => $node->elapsed_seconds,
            'is_timing'    => (bool) $node->timer_started_at,
            'sort_order'   => $node->sort_order,
            'children'     => $node->relationLoaded('children')
                ? $node->children->map(fn($c) => $this->nodeResource($c))
                : [],
        ]);
    }

    private function fmtMin(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;
        return $h > 0 ? "{$h}h {$m}m" : "{$m}m";
    }
}
