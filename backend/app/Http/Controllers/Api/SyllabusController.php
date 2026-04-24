<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SyllabusController extends Controller
{
    public function getExams(): JsonResponse
    {
        $exams = Cache::remember('exams_list', 3600, fn() => Exam::orderBy('name_en')->get());
        return response()->json(['data' => $exams]);
    }

    public function getSubjects(Exam $exam): JsonResponse
    {
        $subjects = Cache::remember("exam_{$exam->id}_subjects", 3600, fn() =>
            Subject::where('exam_id', $exam->id)->orderBy('name_en')->get()
        );
        return response()->json(['data' => $subjects]);
    }

    public function getChapters(Subject $subject): JsonResponse
    {
        $chapters = Cache::remember("subject_{$subject->id}_chapters", 3600, fn() =>
            Chapter::where('subject_id', $subject->id)->orderBy('name_en')->get()
        );
        return response()->json(['data' => $chapters]);
    }

    public function getTopics(Chapter $chapter): JsonResponse
    {
        $topics = Cache::remember("chapter_{$chapter->id}_topics", 3600, fn() =>
            Topic::where('chapter_id', $chapter->id)->orderBy('name_en')->get()
        );
        return response()->json(['data' => $topics]);
    }

    public function getFullHierarchy(Exam $exam): JsonResponse
    {
        $hierarchy = Cache::remember("exam_{$exam->id}_full", 3600, function () use ($exam) {
            return Subject::where('exam_id', $exam->id)
                ->with(['chapters.topics'])
                ->orderBy('name_en')
                ->get();
        });
        return response()->json(['data' => $hierarchy]);
    }
}
