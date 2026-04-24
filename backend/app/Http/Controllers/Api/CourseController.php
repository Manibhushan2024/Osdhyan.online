<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CourseController extends Controller
{
    public function getCategories(): JsonResponse
    {
        return response()->json(['data' => ['UPSC', 'BPSC', 'SSC', 'NCERT']]);
    }

    public function getSubjectsByCategory(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $subjects = Cache::remember("subjects_category_{$category}", 1800, fn() =>
            Subject::with('exam')->get()
        );
        return response()->json(['data' => $subjects]);
    }

    public function getNcertClasses(): JsonResponse
    {
        return response()->json(['data' => range(6, 12)]);
    }

    public function getNcertSubjectsByClass(int $class): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function getSubjectChapters(Subject $subject): JsonResponse
    {
        $data = Cache::remember("subject_{$subject->id}_full", 1800, fn() =>
            $subject->load('chapters.topics')
        );
        return response()->json(['data' => $data]);
    }

    public function getTopicMaterials(Topic $topic): JsonResponse
    {
        return response()->json(['data' => []]);
    }
}
