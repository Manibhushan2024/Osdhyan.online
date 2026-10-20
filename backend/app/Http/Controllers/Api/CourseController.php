<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Topic;
use App\Support\CourseContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Student-facing course browsing. Every list endpoint returns {data: [...]}.
 * Students only ever see published subjects, chapters, topics and materials.
 *
 * Hierarchy contract (shared with the admin editor, which uses
 * GET /admin/subjects/{id}/hierarchy and also sees drafts):
 *   { subject: {...}, data: [ chapter { ..., topics: [ topic { ..., materials: [ material ] } ] } ] }
 */
class CourseController extends Controller
{
    private const TTL = 1800;

    /** Columns sent for each material in course payloads. */
    public const MATERIAL_COLUMNS = [
        'id', 'subject_id', 'chapter_id', 'topic_id', 'title', 'description', 'type',
        'file_path', 'external_url', 'mime_type', 'file_size', 'is_published', 'created_at',
    ];

    public function getCategories(): JsonResponse
    {
        return response()->json(['data' => ['UPSC', 'BPSC', 'SSC', 'NCERT']]);
    }

    public function getSubjectsByCategory(Request $request): JsonResponse
    {
        $category = $this->normaliseCategory((string) $request->query('category', ''));

        $subjects = Cache::remember(CourseContent::cacheKey('category:' . ($category ?: 'all')), self::TTL, function () use ($category) {
            return $this->publishedSubjects()
                ->when($category !== '', fn ($q) => $q->whereRaw('UPPER(category) = ?', [$category]))
                ->get();
        });

        return response()->json(['data' => $subjects]);
    }

    public function getNcertClasses(): JsonResponse
    {
        return response()->json(['data' => range(6, 12)]);
    }

    /** {class} may be "10" or "10th"; subjects store class_level loosely ("10", "10th", "Class 10"). */
    public function getNcertSubjectsByClass(string $class): JsonResponse
    {
        $number = (int) preg_replace('/\D+/', '', $class);

        $subjects = Cache::remember(CourseContent::cacheKey("ncert:{$number}"), self::TTL, function () use ($number) {
            return $this->publishedSubjects()
                ->whereRaw('UPPER(category) = ?', ['NCERT'])
                ->get()
                ->filter(fn (Subject $s) => (int) preg_replace('/\D+/', '', (string) $s->class_level) === $number)
                ->values();
        });

        return response()->json(['data' => $subjects]);
    }

    public function getSubjectChapters(Subject $subject): JsonResponse
    {
        abort_unless($subject->is_published, 404, 'This subject is not available yet.');

        $payload = Cache::remember(CourseContent::cacheKey("hierarchy:{$subject->id}"), self::TTL,
            fn () => self::hierarchy($subject, publishedOnly: true));

        return response()->json($payload);
    }

    public function getTopicMaterials(Topic $topic): JsonResponse
    {
        $topic->loadMissing('chapter.subject');
        $visible = $topic->is_published
            && $topic->chapter?->is_published
            && $topic->chapter?->subject?->is_published;
        abort_unless($visible, 404, 'This topic is not available.');

        $materials = StudyMaterial::where('topic_id', $topic->id)
            ->visibleToStudents()
            ->orderBy('id')
            ->get(self::MATERIAL_COLUMNS);

        return response()->json(['data' => $materials]);
    }

    /**
     * The subject's chapters → topics → materials. Drafts are left out
     * unless $publishedOnly is false (admin editor).
     */
    public static function hierarchy(Subject $subject, bool $publishedOnly): array
    {
        $onlyPublished = fn ($q) => $publishedOnly ? $q->where('is_published', true) : $q;

        $chapters = Chapter::where('subject_id', $subject->id)
            ->when($publishedOnly, fn ($q) => $q->where('is_published', true))
            ->orderBy('id')
            ->with([
                'topics' => fn ($q) => $onlyPublished($q)->orderBy('id'),
                'topics.materials' => fn ($q) => $onlyPublished($q)->orderBy('id')->select(self::MATERIAL_COLUMNS),
            ])
            ->get();

        return [
            'subject' => $subject->only(['id', 'exam_id', 'name_en', 'name_hi', 'code', 'category', 'class_level', 'is_published']),
            'data'    => $chapters->toArray(),
        ];
    }

    private function publishedSubjects(): Builder
    {
        return Subject::with('exam:id,name_en,code')
            ->where('is_published', true)
            ->withCount('chapters')
            ->orderBy('sort_order')
            ->orderBy('name_en');
    }

    /** "current-affairs" → "CURRENT AFFAIRS", "gs" → "GS". */
    private function normaliseCategory(string $category): string
    {
        return strtoupper(trim(str_replace(['-', '_'], ' ', $category)));
    }
}
