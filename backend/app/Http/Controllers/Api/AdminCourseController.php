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
use Illuminate\Support\Str;
use App\Support\CourseContent;

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
            $data['slug'] = \App\Support\Slug::unique('exams', $data['name_en'] . (!empty($data['code']) ? ' ' . $data['code'] : ''), 'exam');
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
            $data['slug'] = \App\Support\Slug::unique('subjects', $data['name_en'] . (!empty($data['code']) ? ' ' . $data['code'] : ''), 'subject');
        }

        return response()->json(Subject::create($data), 201);
    }

    /** Admin editor view of a subject: same shape as the student hierarchy, drafts included. */
    public function subjectHierarchy(int $id): JsonResponse
    {
        return response()->json(CourseController::hierarchy(Subject::findOrFail($id), publishedOnly: false));
    }

    public function updateSubject(Request $request, int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $request->validate(['is_published' => 'sometimes|boolean']);
        $subject->update($request->only([
            'name_en', 'name_hi', 'slug', 'code', 'category', 'class_level', 'sort_order', 'is_published',
        ]));
        return response()->json($subject);
    }

    public function deleteSubject(int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $chapterIds = Chapter::where('subject_id', $id)->pluck('id');
        $this->purgeMaterials(StudyMaterial::where('subject_id', $id)
            ->orWhereIn('chapter_id', $chapterIds)
            ->orWhereIn('topic_id', Topic::whereIn('chapter_id', $chapterIds)->select('id')));
        $subject->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────

    public function storeChapter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name_en' => 'required|string|max:255',
            'name_hi' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:chapters,slug',
        ]);
        if (Chapter::where('subject_id', $data['subject_id'])->whereRaw('LOWER(name_en) = ?', [mb_strtolower(trim($data['name_en']))])->exists()) {
            return response()->json(['message' => 'This subject already has a chapter with that name.', 'errors' => ['name_en' => ['This subject already has a chapter with that name.']]], 422);
        }

        return response()->json(['data' => $this->createWithUniqueSlug(Chapter::class, 'chapters', 'chapter', $data)], 201);
    }

    public function updateChapter(Request $request, int $id): JsonResponse
    {
        $chapter = Chapter::findOrFail($id);
        $request->validate([
            'name_en'      => 'sometimes|required|string|max:255',
            'name_hi'      => 'nullable|string|max:255',
            'is_published' => 'sometimes|boolean',
        ]);
        $chapter->update($request->only(['name_en', 'name_hi', 'slug', 'is_published']));
        return response()->json(['data' => $chapter]);
    }

    public function deleteChapter(int $id): JsonResponse
    {
        $chapter = Chapter::findOrFail($id);
        $this->purgeMaterials(StudyMaterial::where('chapter_id', $id)
            ->orWhereIn('topic_id', Topic::where('chapter_id', $id)->select('id')));
        $chapter->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Topics ───────────────────────────────────────────────────────────────

    public function storeTopic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chapter_id' => 'required|exists:chapters,id',
            'name_en' => 'required|string|max:255',
            'name_hi' => 'nullable|string|max:255',
            'slug' => 'nullable|string|unique:topics,slug',
        ]);
        if (Topic::where('chapter_id', $data['chapter_id'])->whereRaw('LOWER(name_en) = ?', [mb_strtolower(trim($data['name_en']))])->exists()) {
            return response()->json(['message' => 'This chapter already has a topic with that name.', 'errors' => ['name_en' => ['This chapter already has a topic with that name.']]], 422);
        }

        return response()->json(['data' => $this->createWithUniqueSlug(Topic::class, 'topics', 'topic', $data)], 201);
    }

    /**
     * Two quick clicks can send two requests that pick the same slug; the
     * unique index rejects the second. Retry with a fresh slug instead of a 500.
     *
     * @param class-string<\Illuminate\Database\Eloquent\Model> $model
     */
    private function createWithUniqueSlug(string $model, string $table, string $fallback, array $data)
    {
        $given = $data['slug'] ?? null;
        for ($attempt = 0; ; $attempt++) {
            $data['slug'] = $given ?? \App\Support\Slug::unique($table, $data['name_en'] . ($attempt ? ' ' . Str::lower(Str::random(4)) : ''), $fallback);
            try {
                return DB::transaction(fn () => $model::create($data));
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                if ($given !== null || $attempt >= 3) {
                    throw $e;
                }
            }
        }
    }

    public function updateTopic(Request $request, int $id): JsonResponse
    {
        $topic = Topic::findOrFail($id);
        $request->validate([
            'name_en'      => 'sometimes|required|string|max:255',
            'name_hi'      => 'nullable|string|max:255',
            'is_published' => 'sometimes|boolean',
        ]);
        $topic->update($request->only(['name_en', 'name_hi', 'slug', 'is_published']));
        return response()->json(['data' => $topic]);
    }

    public function deleteTopic(int $id): JsonResponse
    {
        $topic = Topic::findOrFail($id);
        $this->purgeMaterials(StudyMaterial::where('topic_id', $id));
        $topic->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ─── Materials ────────────────────────────────────────────────────────────

    /**
     * Add content to a topic (or chapter / subject). Send either
     *   file      — PDF, image, video (mp4/webm), audio (mp3/m4a/...) or Word/PowerPoint, up to 500 MB
     *   video_url — a YouTube link (for long lectures that should not be uploaded)
     * The stored type is worked out from the file; a `type` sent by older
     * clients is ignored. New content is published unless is_published=false.
     */
    public function uploadMaterial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'nullable|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'subject_id'   => 'nullable|exists:subjects,id',
            'chapter_id'   => 'nullable|exists:chapters,id',
            'topic_id'     => 'nullable|exists:topics,id',
            'file'         => 'required_without:video_url|file|max:' . CourseContent::MAX_UPLOAD_KB,
            'video_url'    => 'required_without:file|nullable|string|max:500',
            'is_published' => 'nullable|boolean',
        ], [
            'file.required_without'      => 'Choose a file to upload or paste a YouTube link.',
            'video_url.required_without' => 'Choose a file to upload or paste a YouTube link.',
            'file.max'                   => 'The file is too large. The limit is 500 MB — for longer videos, paste a YouTube link instead.',
            'file.uploaded'              => 'The file could not be uploaded. It may be larger than the server allows (500 MB).',
        ]);

        if (empty($data['topic_id']) && empty($data['chapter_id']) && empty($data['subject_id'])) {
            return $this->invalid('topic_id', 'Pick the topic this content belongs to.');
        }

        // Fill in the parents so subject / chapter filters work everywhere.
        $topicId = $data['topic_id'] ?? null;
        $chapterId = $data['chapter_id'] ?? null;
        $subjectId = $data['subject_id'] ?? null;
        if ($topicId) {
            $chapterId = Topic::whereKey($topicId)->value('chapter_id');
        }
        if ($chapterId) {
            $subjectId = Chapter::whereKey($chapterId)->value('subject_id');
        }

        $attributes = [
            'description'  => $data['description'] ?? null,
            'subject_id'   => $subjectId,
            'chapter_id'   => $chapterId,
            'topic_id'     => $topicId,
            'is_published' => (bool) ($data['is_published'] ?? true),
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $type = CourseContent::typeForFile($file);
            if ($type === null) {
                return $this->invalid('file', 'This kind of file is not supported. Upload a PDF, an image (JPG, PNG, WEBP), a video (MP4, WEBM), audio (MP3, M4A, WAV) or a Word / PowerPoint file.');
            }

            $ext = strtolower($file->getClientOriginalExtension());
            $path = $file->storeAs('study-materials', Str::random(40) . '.' . $ext, 'public');

            $attributes += [
                'title'     => $data['title'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'type'      => $type,
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ];
        } else {
            $url = trim((string) $data['video_url']);
            if (CourseContent::youtubeId($url) === null) {
                return $this->invalid('video_url', 'That does not look like a YouTube video link. Paste a link like https://www.youtube.com/watch?v=... or https://youtu.be/...');
            }

            $attributes += [
                'title'        => $data['title'] ?? 'Video lecture',
                'type'         => 'youtube',
                'external_url' => $url,
            ];
        }

        $material = StudyMaterial::create($attributes);

        return response()->json(['data' => $material->fresh()], 201);
    }

    /** Rename or show / hide a single piece of content. */
    public function updateMaterial(Request $request, int $id): JsonResponse
    {
        $material = StudyMaterial::findOrFail($id);
        $data = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'is_published' => 'sometimes|boolean',
        ]);
        $material->update($data);

        return response()->json(['data' => $material->fresh()]);
    }

    public function deleteMaterial(int $id): JsonResponse
    {
        StudyMaterial::findOrFail($id);
        $this->purgeMaterials(StudyMaterial::whereKey($id));

        return response()->json(['message' => 'Material deleted.']);
    }

    /** Delete materials together with their uploaded files. */
    private function purgeMaterials($query): void
    {
        $query->get()->each(function (StudyMaterial $material) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
            $material->delete();
        });
    }

    private function invalid(string $field, string $message): JsonResponse
    {
        return response()->json(['message' => $message, 'errors' => [$field => [$message]]], 422);
    }

    // ─── Test Series ──────────────────────────────────────────────────────────

    public function getAdminTestSeries(): JsonResponse
    {
        return response()->json(
            TestSeries::with(['exam', 'tests:id,name_en,status,duration_sec,total_marks'])
                ->withCount('tests')->latest()->get()
        );
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
            // Pricing (paid test series)
            'price'          => 'nullable|numeric|min:0|max:9999999',
            'mrp'            => 'nullable|numeric|min:0|max:9999999|gte:price',
            'currency'       => 'nullable|string|size:3',
            'is_paid'        => 'nullable|boolean',
            'validity_days'  => 'nullable|integer|min:1|max:3650',
            // Tests to include, in order
            'test_ids'       => 'nullable|array|max:500',
            'test_ids.*'     => 'integer|exists:tests,id',
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
            'price'          => $data['price'] ?? 0,
            'mrp'            => $data['mrp'] ?? null,
            'currency'       => strtoupper($data['currency'] ?? 'INR'),
            'is_paid'        => (bool) ($data['is_paid'] ?? false),
            'validity_days'  => $data['validity_days'] ?? null,
        ]);

        if (!empty($data['test_ids'])) {
            $series->tests()->sync(array_values(array_unique(array_map('intval', $data['test_ids']))));
        }

        return response()->json($series->load(['exam', 'tests:id,name_en'])->loadCount('tests'), 201);
    }

    public function updateTestSeries(Request $request, int $id): JsonResponse
    {
        $series = TestSeries::findOrFail($id);

        $request->validate([
            'test_ids'      => 'nullable|array|max:500',
            'test_ids.*'    => 'integer|exists:tests,id',
            'price'         => 'nullable|numeric|min:0|max:9999999',
            'mrp'           => 'nullable|numeric|min:0|max:9999999',
            'currency'      => 'nullable|string|size:3',
            'is_paid'       => 'nullable|boolean',
            'validity_days' => 'nullable|integer|min:0|max:3650',
        ]);

        $data = $request->only([
            'name_en', 'name_hi', 'description_en', 'category', 'is_published',
            'price', 'mrp', 'currency', 'is_paid', 'validity_days',
        ]);
        if (array_key_exists('currency', $data) && $data['currency']) {
            $data['currency'] = strtoupper($data['currency']);
        }
        if (array_key_exists('validity_days', $data) && (int) $data['validity_days'] === 0) {
            $data['validity_days'] = null; // 0 / '' means lifetime
        }
        if (array_key_exists('mrp', $data) && $data['mrp'] === '') {
            $data['mrp'] = null;
        }

        $series->update($data);

        if ($request->has('test_ids')) {
            $series->tests()->sync(array_values(array_unique(array_map('intval', (array) $request->input('test_ids', [])))));
        }

        return response()->json($series->load(['exam', 'tests:id,name_en'])->loadCount('tests'));
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
            $labels = ['A', 'B', 'C', 'D', 'E'];
            foreach ($data['options'] as $idx => $opt) {
                $opt['label'] = $opt['label'] ?? ($labels[$idx] ?? chr(65 + $idx));
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

            $t->replaceQuestions(array_values(array_unique($data['question_ids'])));

            return $t->load('questions');
        });

        return response()->json(['data' => $test], 201);
    }
}
