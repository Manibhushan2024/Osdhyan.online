<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\StudyGoal;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\Request;

class StudyGoalController extends Controller
{
    protected function resolveGoalable(string $type)
    {
        return match ($type) {
            'Subject' => Subject::class,
            'Chapter' => Chapter::class,
            'Topic' => Topic::class,
            default => null,
        };
    }

    protected function attachGoalable(StudyGoal $goal): StudyGoal
    {
        $class = $this->resolveGoalable($goal->goalable_type);

        if ($class) {
            $goal->setAttribute('goalable', $class::find($goal->goalable_id));
        }

        return $goal;
    }

    public function index(Request $request)
    {
        $goals = $request->user()
            ->studyGoals()
            ->latest('id')
            ->get()
            ->map(fn (StudyGoal $goal) => $this->attachGoalable($goal));

        return response()->json($goals->values());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'goalable_type' => 'required|string|in:Subject,Chapter,Topic',
            'goalable_id' => 'required|integer',
            'target_hours' => 'required|numeric|min:1|max:500',
        ]);

        $class = $this->resolveGoalable($validated['goalable_type']);
        abort_unless($class, 422, 'Invalid goal type.');

        abort_if(!$class::whereKey($validated['goalable_id'])->exists(), 422, 'Selected goal item was not found.');

        $goal = StudyGoal::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'goalable_type' => $validated['goalable_type'],
                'goalable_id' => $validated['goalable_id'],
            ],
            [
                'target_hours' => $validated['target_hours'],
            ]
        );

        return response()->json($this->attachGoalable($goal->fresh()));
    }

    public function destroy(Request $request, $id)
    {
        $goal = $request->user()->studyGoals()->findOrFail($id);
        $goal->delete();

        return response()->json([
            'message' => 'Study goal deleted successfully.',
        ]);
    }
}
