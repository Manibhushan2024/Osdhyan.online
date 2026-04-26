<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminTestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Test::with(['exam:id,name_en,code'])
            ->withCount(['questions', 'attempts'])
            ->latest();

        if ($request->filled('search')) {
            $query->where('name_en', 'ilike', '%' . $request->search . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('exam_id')) {
            $query->where('exam_id', $request->exam_id);
        }

        $perPage = min((int) $request->get('per_page', 15), 50);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data'  => $paginated->items(),
            'total' => $paginated->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id'           => 'nullable|exists:exams,id',
            'name_en'           => 'required|string|max:255',
            'name_hi'           => 'nullable|string|max:255',
            'description_en'    => 'nullable|string',
            'mode'              => 'required|string',
            'category'          => 'required|string',
            'duration_sec'      => 'required|integer|min:60',
            'total_marks'       => 'nullable|numeric',
            'negative_marking'  => 'nullable|numeric|min:0',
            'passing_marks'     => 'nullable|numeric',
            'question_mark'     => 'nullable|numeric',
            'is_free'           => 'nullable|boolean',
            'shuffle_questions' => 'nullable|boolean',
            'max_attempts'      => 'nullable|integer|min:0',
            'year'              => 'nullable|integer',
            'paper_type'        => 'nullable|string|max:50',
            'status'            => 'nullable|string|in:draft,published',
            'sections'          => 'nullable|array',
            'sections.*.question_ids' => 'nullable|array',
            'sections.*.question_ids.*' => 'exists:questions,id',
            'question_ids'      => 'nullable|array',
            'question_ids.*'    => 'exists:questions,id',
        ]);

        $test = DB::transaction(function () use ($data) {
            $t = Test::create([
                'exam_id'           => $data['exam_id'] ?? null,
                'name_en'           => $data['name_en'],
                'name_hi'           => $data['name_hi'] ?? $data['name_en'],
                'description_en'    => $data['description_en'] ?? null,
                'mode'              => $data['mode'],
                'category'          => $data['category'],
                'duration_sec'      => $data['duration_sec'],
                'negative_marking'  => $data['negative_marking'] ?? 0,
                'question_mark'     => $data['question_mark'] ?? 1,
                'total_marks'       => $data['total_marks'] ?? 0,
                'passing_marks'     => $data['passing_marks'] ?? null,
                'is_free'           => $data['is_free'] ?? true,
                'shuffle_questions' => $data['shuffle_questions'] ?? false,
                'max_attempts'      => $data['max_attempts'] ?? 0,
                'year'              => $data['year'] ?? null,
                'paper_type'        => $data['paper_type'] ?? null,
                'status'            => $data['status'] ?? 'published',
            ]);

            // Collect all question IDs (from sections + unassigned)
            $allQIds = [];
            if (!empty($data['sections'])) {
                foreach ($data['sections'] as $sec) {
                    $allQIds = array_merge($allQIds, $sec['question_ids'] ?? []);
                }
            }
            if (!empty($data['question_ids'])) {
                $allQIds = array_merge($allQIds, $data['question_ids']);
            }
            $allQIds = array_unique($allQIds);

            foreach (array_values($allQIds) as $idx => $qid) {
                $t->questions()->attach($qid, ['sort_order' => $idx]);
            }

            // Update total_marks based on question count if not provided
            if (!$data['total_marks'] && count($allQIds)) {
                $t->update(['total_marks' => count($allQIds) * ($data['question_mark'] ?? 1)]);
            }

            return $t->load('exam:id,name_en,code')->loadCount(['questions', 'attempts']);
        });

        return response()->json($test, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $test = Test::findOrFail($id);

        $data = $request->validate([
            'exam_id'           => 'nullable|exists:exams,id',
            'name_en'           => 'sometimes|required|string|max:255',
            'name_hi'           => 'nullable|string|max:255',
            'description_en'    => 'nullable|string',
            'mode'              => 'nullable|string',
            'category'          => 'nullable|string',
            'duration_sec'      => 'nullable|integer|min:60',
            'total_marks'       => 'nullable|numeric',
            'negative_marking'  => 'nullable|numeric|min:0',
            'passing_marks'     => 'nullable|numeric',
            'is_free'           => 'nullable|boolean',
            'shuffle_questions' => 'nullable|boolean',
            'max_attempts'      => 'nullable|integer|min:0',
            'year'              => 'nullable|integer',
            'paper_type'        => 'nullable|string|max:50',
            'status'            => 'nullable|string|in:draft,published',
            'sections'          => 'nullable|array',
            'sections.*.question_ids' => 'nullable|array',
            'question_ids'      => 'nullable|array',
            'question_ids.*'    => 'exists:questions,id',
        ]);

        DB::transaction(function () use ($test, $data) {
            $test->update(array_intersect_key($data, array_flip([
                'exam_id', 'name_en', 'name_hi', 'description_en',
                'mode', 'category', 'duration_sec', 'total_marks', 'negative_marking',
                'passing_marks', 'is_free', 'shuffle_questions', 'max_attempts',
                'year', 'paper_type', 'status',
            ])));

            // Re-sync questions if provided
            $allQIds = [];
            if (isset($data['sections'])) {
                foreach ($data['sections'] as $sec) {
                    $allQIds = array_merge($allQIds, $sec['question_ids'] ?? []);
                }
            }
            if (isset($data['question_ids'])) {
                $allQIds = array_merge($allQIds, $data['question_ids']);
            }
            if ($allQIds) {
                $allQIds = array_unique($allQIds);
                $syncData = [];
                foreach (array_values($allQIds) as $idx => $qid) {
                    $syncData[$qid] = ['sort_order' => $idx];
                }
                $test->questions()->sync($syncData);
            }
        });

        return response()->json(
            $test->fresh()->load('exam:id,name_en,code')->loadCount(['questions', 'attempts'])
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Test::findOrFail($id)->delete();
        return response()->json(['message' => 'Test deleted.']);
    }

    public function publish(int $id): JsonResponse
    {
        $test = Test::findOrFail($id);
        $test->status = $test->status === 'published' ? 'draft' : 'published';
        $test->save();

        return response()->json([
            'message' => $test->status === 'published' ? 'Test published.' : 'Test moved to draft.',
            'status'  => $test->status,
        ]);
    }

    public function duplicate(int $id): JsonResponse
    {
        $original = Test::with('questions')->findOrFail($id);

        $copy = DB::transaction(function () use ($original) {
            $t = $original->replicate();
            $t->name_en = $original->name_en . ' (Copy)';
            $t->status  = 'draft';
            $t->save();

            foreach ($original->questions as $q) {
                $t->questions()->attach($q->id, ['sort_order' => $q->pivot->sort_order ?? 0]);
            }
            return $t;
        });

        return response()->json(['message' => 'Test duplicated.', 'id' => $copy->id]);
    }

    public function autoAssign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id'         => 'required|exists:exams,id',
            'subject_name_en' => 'nullable|string',
            'count'           => 'nullable|integer|min:1|max:200',
        ]);

        $count = $data['count'] ?? 30;

        $query = Question::with(['subject:id,name_en', 'chapter:id,name_en'])
            ->whereHas('subject', function ($q) use ($data) {
                $q->where('exam_id', $data['exam_id']);
                if (!empty($data['subject_name_en'])) {
                    $q->where('name_en', 'ilike', '%' . $data['subject_name_en'] . '%');
                }
            });

        $questions = $query->inRandomOrder()->limit($count)->get(['id', 'question_en', 'difficulty', 'subject_id', 'chapter_id']);

        return response()->json(['questions' => $questions]);
    }
}
