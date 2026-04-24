<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestController extends Controller
{
    public function index(Request $request)
    {
        $query = Test::query()
            ->with(['subject', 'chapter', 'topic'])
            ->withCount('questions');

        if ($request->filled('mode')) {
            $mode = $request->string('mode')->toString();
            $query->where(function ($builder) use ($mode) {
                $builder->where('mode', $mode)
                    ->orWhere('category', $mode);
            });
        }

        foreach (['exam_id', 'subject_id', 'chapter_id', 'topic_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $query->where(function ($builder) {
            $builder->whereNull('status')
                ->orWhereIn('status', ['published', 'active']);
        });

        $tests = $query->latest('id')->get();

        $latestAttempts = collect();
        if (Auth::check()) {
            $latestAttempts = TestAttempt::where('user_id', Auth::id())
                ->whereIn('test_id', $tests->pluck('id'))
                ->latest('id')
                ->get()
                ->groupBy('test_id')
                ->map(fn ($items) => $items->first());
        }

        $tests->each(function (Test $test) use ($latestAttempts) {
            $questionsCount = (int) ($test->questions_count ?? 0);

            $test->questions_count = $questionsCount;
            $test->mode = $test->mode ?: ($test->category ?: 'full_mock');
            $test->total_marks = $test->total_marks ?: (($test->question_mark ?? 1) * $questionsCount);

            if ($latestAttempts->has($test->id)) {
                $latest = $latestAttempts->get($test->id);
                $test->attempt_id = $latest->id;
                $test->attempt_status = $latest->status === 'ongoing' ? 'in_progress' : $latest->status;
            }
        });

        return response()->json($tests);
    }

    public function show(Test $test)
    {
        $test->load([
            'subject',
            'chapter',
            'topic',
            'questions.options',
            'questions.subject',
        ]);

        $questionsCount = $test->questions->count();
        $test->questions_count = $questionsCount;
        $test->mode = $test->mode ?: ($test->category ?: 'full_mock');
        $test->total_marks = $test->total_marks ?: $test->questions->sum(function ($question) use ($test) {
            return $question->pivot?->marks ?? ($test->question_mark ?? 1);
        });

        return response()->json($test);
    }
}
