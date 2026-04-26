<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestSeries;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminCourseController extends Controller
{
    // ─── Exams ────────────────────────────────────────────────────────────────

    public function getExams(): JsonResponse
    {
        return response()->json(Exam::orderBy('name_en')->get());
    }

    public function storeExam(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name_en'        => 'required|string|max:255',
            'name_hi'        => 'nullable|string|max:255',
            'slug'           => 'nullable|string|max:255|unique:exams,slug',
            'code'           => 'nullable|string|max:20',
            'description_en' => 'nullable|string',
            'description_hi' => 'nullable|string',
        ]);

        if (empty($data['slug'])) {
            $base = \Illuminate\Support\Str::slug($data['name_en']);
            $suffix = $data['code'] ? '-' . strtolower($data['code']) : '';
            $data['slug'] = $base . $suffix ?: $base . '-' . uniqid();
        }

        return response()->json(Exam::create($data), 201);
    }

    public function updateExam(Request $request, int $id): JsonResponse
    {
        $exam = Exam::findOrFail($id);
        $exam->update($request->only(['name_en', 'name_hi', 'slug', 'code', 'description_en', 'description_hi']));
        return response()->json($exam);
    }

    public function deleteExam(int $id): JsonResponse
    {
        Exam::findOrFail($id)->delete();
        return response()->json(['message' => 'Exam deleted.']);
    }

    // ─── Subjects ─────────────────────────────────────────────────────────────

    public function getSubjects(): JsonResponse
    {
        return response()->json(Subject::with('exam')->orderBy('name_en')->get());
    }

    public function storeSubject(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id'     => 'required|exists:exams,id',
            'name_en'     => 'required|string|max:255',
            'name_hi'     => 'nullable|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:subjects,slug',
            'code'        => 'nullable|string|max:30',
            'category'    => 'nullable|string|max:50',
            'class_level' => 'nullable|string|max:10',
            'sort_order'  => 'nullable|integer',
            'is_published'=> 'nullable|boolean',
        ]);

        if (empty($data['slug'])) {
            $base = \Illuminate\Support\Str::slug($data['name_en']);
            $suffix = $data['code'] ? '-' . strtolower($data['code']) : '-' . uniqid();
            $data['slug'] = $base . $suffix;
        }

        return response()->json(Subject::create($data), 201);
    }

    public function updateSubject(Request $request, int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $subject->update($request->only([
            'name_en', 'name_hi', 'slug', 'code', 'category', 'class_level', 'sort_order', 'is_published',
        ]));
        return response()->json($subject);
    }

    public function deleteSubject(int $id): JsonResponse
    {
        Subject::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────

    public function storeChapter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name_en' => 'required|string|max:255',
            'name_hi' => 'nullable|string|max:255',
            'slug' => 'required|string|unique:chapters,slug',
        ]);
        return response()->json(['data' => Chapter::create($data)], 201);
    }

    public function updateChapter(Request $request, int $id): JsonResponse
    {
        $chapter = Chapter::findOrFail($id);
        $chapter->update($request->only(['name_en', 'name_hi', 'slug']));
        return response()->json(['data' => $chapter]);
    }

    public function deleteChapter(int $id): JsonResponse
    {
        Chapter::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Topics ───────────────────────────────────────────────────────────────

    public function storeTopic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chapter_id' => 'required|exists:chapters,id',
            'name_en' => 'required|string|max:255',
            'name_hi' => 'nullable|string|max:255',
            'slug' => 'required|string|unique:topics,slug',
        ]);
        return response()->json(['data' => Topic::create($data)], 201);
    }

    public function updateTopic(Request $request, int $id): JsonResponse
    {
        $topic = Topic::findOrFail($id);
        $topic->update($request->only(['name_en', 'name_hi', 'slug']));
        return response()->json(['data' => $topic]);
    }

    public function deleteTopic(int $id): JsonResponse
    {
        Topic::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Materials ────────────────────────────────────────────────────────────

    public function uploadMaterial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'subject_id'  => 'nullable|exists:subjects,id',
            'chapter_id'  => 'nullable|exists:chapters,id',
            'topic_id'    => 'nullable|exists:topics,id',
            'type'        => 'required|string|in:pdf,image,video,doc',
            'file'        => 'required|file|max:51200', // 50 MB max
            'is_published'=> 'nullable|boolean',
        ]);

        $path = $request->file('file')->store("study-materials", 'public');

        $material = StudyMaterial::create([
            'title'        => $data['title'],
            'description'  => $data['description'] ?? null,
            'subject_id'   => $data['subject_id'] ?? null,
            'chapter_id'   => $data['chapter_id'] ?? null,
            'topic_id'     => $data['topic_id'] ?? null,
            'type'         => $data['type'],
            'file_path'    => $path,
            'is_published' => (bool) ($data['is_published'] ?? false),
        ]);

        return response()->json(['data' => $material], 201);
    }

    public function deleteMaterial(int $id): JsonResponse
    {
        $material = StudyMaterial::findOrFail($id);
        Storage::disk('public')->delete($material->file_path);
        $material->delete();

        return response()->json(['message' => 'Material deleted.']);
    }

    // ─── Test Series ──────────────────────────────────────────────────────────

    public function getAdminTestSeries(): JsonResponse
    {
        return response()->json(TestSeries::with('exam')->latest()->get());
    }

    public function storeTestSeries(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id'        => 'nullable|exists:exams,id',
            'name_en'        => 'required|string|max:255',
            'name_hi'        => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'category'       => 'nullable|string',
            'is_published'   => 'nullable|boolean',
            'image_file'     => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image_file')) {
            $imagePath = $request->file('image_file')->store('test-series', 'public');
        }

        $series = TestSeries::create([
            'exam_id'        => $data['exam_id'] ?? null,
            'name_en'        => $data['name_en'],
            'name_hi'        => $data['name_hi'] ?? null,
            'description_en' => $data['description_en'] ?? null,
            'category'       => $data['category'] ?? null,
            'is_published'   => (bool) ($data['is_published'] ?? false),
            'image'          => $imagePath,
        ]);

        return response()->json($series->load('exam'), 201);
    }

    public function updateTestSeries(Request $request, int $id): JsonResponse
    {
        $series = TestSeries::findOrFail($id);
        $series->update($request->only(['name_en', 'name_hi', 'description_en', 'category', 'is_published']));
        return response()->json($series->load('exam'));
    }

    public function deleteTestSeries(int $id): JsonResponse
    {
        TestSeries::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Questions ────────────────────────────────────────────────────────────

    public function searchQuestions(Request $request): JsonResponse
    {
        $query = Question::with(['subject:id,name_en', 'chapter:id,name_en']);

        if ($request->filled('search') || $request->filled('q')) {
            $term = $request->filled('search') ? $request->search : $request->q;
            $query->where('question_en', 'ilike', '%' . $term . '%');
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }
        if ($request->filled('exam_id')) {
            $query->whereHas('subject', fn($q) => $q->where('exam_id', $request->exam_id));
        }

        return response()->json($query->limit(100)->get(['id', 'question_en', 'difficulty', 'subject_id', 'chapter_id']));
    }

    public function createQuestion(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject_id'      => 'nullable|exists:subjects,id',
            'chapter_id'      => 'nullable|exists:chapters,id',
            'topic_id'        => 'nullable|exists:topics,id',
            'question_en'     => 'required|string',
            'question_hi'     => 'nullable|string',
            'explanation_en'  => 'nullable|string',
            'explanation_hi'  => 'nullable|string',
            'difficulty'      => 'nullable|in:easy,medium,hard',
            'options'         => 'required|array|min:2',
            'options.*.label'     => 'nullable|string|max:1',
            'options.*.option_en' => 'required|string',
            'options.*.option_hi' => 'nullable|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $question = DB::transaction(function () use ($data) {
            $q = Question::create($data);
            foreach ($data['options'] as $opt) {
                $q->options()->create($opt);
            }
            return $q->load('options');
        });

        return response()->json($question, 201);
    }

    public function createTestWithQuestions(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id' => 'nullable|exists:exams,id',
            'name_en' => 'required|string|max:255',
            'mode' => 'required|in:practice,mock,pyq',
            'duration_sec' => 'required|integer|min:60',
            'negative_marking' => 'nullable|numeric|min:0',
            'question_mark' => 'nullable|numeric|min:0.5',
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'exists:questions,id',
        ]);

        $test = DB::transaction(function () use ($data) {
            $t = Test::create([
                'exam_id' => $data['exam_id'] ?? null,
                'name_en' => $data['name_en'],
                'mode' => $data['mode'],
                'duration_sec' => $data['duration_sec'],
                'negative_marking' => $data['negative_marking'] ?? 0,
                'question_mark' => $data['question_mark'] ?? 1,
                'total_marks' => count($data['question_ids']) * ($data['question_mark'] ?? 1),
                'status' => 'published',
            ]);

            foreach (array_values($data['question_ids']) as $idx => $qid) {
                $t->questions()->attach($qid, ['sort_order' => $idx]);
            }

            return $t->load('questions');
        });

        return response()->json(['data' => $test], 201);
    }
}
