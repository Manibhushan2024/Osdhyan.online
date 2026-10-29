<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyPlan;
use App\Models\StudyPlanTask;
use App\Models\TestAttempt;
use App\Services\StudyPlan\ContentCatalog;
use App\Services\StudyPlan\StudyPlanGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Personal DSSSB TGT CS study plan.
 *
 *   GET   /study-plan                plan + today's / this week's tasks + progress (?full=1 adds every task)
 *   POST  /study-plan/generate       (re)build from today; done tasks are kept as history
 *   PATCH /study-plan/tasks/{task}   {done: bool}
 */
class StudyPlanController extends Controller
{
    /** Students are in India; "today" follows their calendar, not UTC. */
    public const TIMEZONE = 'Asia/Kolkata';

    public static function today(): CarbonImmutable
    {
        return CarbonImmutable::parse(now(self::TIMEZONE)->toDateString());
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json($this->payload($request, (bool) $request->boolean('full')));
    }

    public function generate(Request $request, StudyPlanGenerator $generator): JsonResponse
    {
        $today = self::today();
        $data = $request->validate([
            'exam_date'           => 'required|date|after_or_equal:' . $today->toDateString(),
            'weekday_office_min'  => 'required|integer|min:0|max:600',
            'weekday_library_min' => 'required|integer|min:0|max:900',
            'weekend_min'         => 'required|integer|min:0|max:1200',
            'focus'               => 'nullable|array|max:20',
            'focus.*'             => 'string|max:60',
        ]);

        $generator->generate($request->user(), $data, $today);

        return response()->json($this->payload($request, (bool) $request->boolean('full')));
    }

    public function updateTask(Request $request, int $task): JsonResponse
    {
        $data = $request->validate(['done' => 'required|boolean']);

        $row = StudyPlanTask::whereKey($task)
            ->whereHas('plan', fn ($q) => $q->where('user_id', $request->user()->id))
            ->firstOrFail();

        $row->done_at = $data['done'] ? ($row->done_at ?? now()) : null;
        $row->save();

        $plan = $row->plan;
        $today = self::today()->toDateString();

        return response()->json([
            'task'           => $this->present($row, $this->attemptsFor($request, collect([$row]))),
            'progress'       => $this->progress($plan->tasks()->get(['minutes', 'done_at'])),
            'today_progress' => $this->progress($plan->tasks()->whereDate('date', $today)->get(['minutes', 'done_at'])),
        ]);
    }

    // ─── Payload ──────────────────────────────────────────────────────────────

    private function payload(Request $request, bool $full): array
    {
        $user = $request->user();
        $today = self::today();
        $plan = StudyPlan::where('user_id', $user->id)->first();

        $base = [
            'today_date'    => $today->toDateString(),
            'defaults'      => StudyPlanGenerator::DEFAULTS,
            'focus_options' => $this->focusOptions($request),
        ];

        if (!$plan) {
            return $base + [
                'plan' => null, 'today' => [], 'week' => [], 'tasks' => [],
                'progress' => $this->progress(collect()), 'today_progress' => $this->progress(collect()),
            ];
        }

        $weekEnd = $today->addDays(6)->toDateString();
        $all = $plan->tasks()->orderBy('date')->orderByRaw("CASE slot WHEN 'office' THEN 0 WHEN 'library' THEN 1 ELSE 2 END")
            ->orderBy('position')->orderBy('id')->get();
        $attempts = $this->attemptsFor($request, $all);

        $todayStr = $today->toDateString();
        $todayTasks = $all->filter(fn ($t) => $t->date->toDateString() === $todayStr);
        $weekTasks = $all->filter(fn ($t) => $t->date->toDateString() >= $todayStr && $t->date->toDateString() <= $weekEnd);

        $examDate = CarbonImmutable::parse($plan->exam_date->toDateString());

        return $base + [
            'plan' => [
                'id'                  => $plan->id,
                'exam_date'           => $examDate->toDateString(),
                'weekday_office_min'  => $plan->weekday_office_min,
                'weekday_library_min' => $plan->weekday_library_min,
                'weekend_min'         => $plan->weekend_min,
                'focus'               => $plan->settings['focus'] ?? [],
                'summary'             => $plan->plan,
                'generated_at'        => $plan->generated_at?->toIso8601String(),
                'days_left'           => $examDate->lt($today) ? 0 : $today->diffInDays($examDate) + 1,
            ],
            'today'          => $todayTasks->map(fn ($t) => $this->present($t, $attempts))->values(),
            'week'           => $weekTasks->map(fn ($t) => $this->present($t, $attempts))->values(),
            'tasks'          => $full ? $all->map(fn ($t) => $this->present($t, $attempts))->values() : [],
            'progress'       => $this->progress($all),
            'today_progress' => $this->progress($todayTasks),
        ];
    }

    /** Latest completed attempt per test referenced by the tasks. */
    private function attemptsFor(Request $request, Collection $tasks): Collection
    {
        $ids = $tasks->where('ref_type', 'test')->pluck('ref_id')->unique()->values();
        if ($ids->isEmpty()) {
            return collect();
        }

        return TestAttempt::where('user_id', $request->user()->id)
            ->whereIn('test_id', $ids)
            ->where('status', 'completed')
            ->orderBy('id')
            ->get(['id', 'test_id'])
            ->keyBy('test_id');
    }

    private function present(StudyPlanTask $t, Collection $attempts): array
    {
        $attempt = $t->ref_type === 'test' ? $attempts->get($t->ref_id) : null;

        return [
            'id'          => $t->id,
            'date'        => $t->date->toDateString(),
            'slot'        => $t->slot,
            'position'    => $t->position,
            'type'        => $t->type,
            'title'       => $t->title,
            'minutes'     => $t->minutes,
            'ref_type'    => $t->ref_type,
            'ref_id'      => $t->ref_id,
            'link'        => $t->link,
            'subject_key' => $t->subject_key,
            'phase'       => $t->phase,
            'done'        => $t->done_at !== null,
            'done_at'     => $t->done_at?->toIso8601String(),
            // Set once the student has finished the test: where to see the result / wrong answers.
            'attempt_id'  => $attempt?->id,
            'review_link' => $attempt ? "/dashboard/tests/solutions/{$attempt->id}" : null,
        ];
    }

    private function progress(Collection $tasks): array
    {
        $total = $tasks->count();
        $done = $tasks->whereNotNull('done_at')->count();
        $minutes = (int) $tasks->sum('minutes');
        $doneMinutes = (int) $tasks->whereNotNull('done_at')->sum('minutes');

        return [
            'total'         => $total,
            'done'          => $done,
            'minutes_total' => $minutes,
            'minutes_done'  => $doneMinutes,
            'percent'       => $minutes > 0 ? (int) round($doneMinutes * 100 / $minutes) : ($total > 0 ? (int) round($done * 100 / $total) : 0),
        ];
    }

    /** Subjects the student can ask the plan to focus on (packs + exam sections). */
    private function focusOptions(Request $request): array
    {
        $catalog = ContentCatalog::build($request->user());
        $out = [];
        foreach ($catalog->packs as $p) {
            $out[] = ['key' => $p['key'], 'label' => $p['label'], 'kind' => 'subject'];
        }
        foreach (ContentCatalog::SECTIONS as $key => [$label]) {
            if ($key === 'cs') {
                continue;
            }
            if (collect($catalog->packs)->contains(fn ($p) => $p['section'] === $key)) {
                continue;
            }
            $out[] = ['key' => $key, 'label' => $label, 'kind' => 'section'];
        }

        return $out;
    }
}
