<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Test;
use App\Models\TestSeries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminAutomationController extends Controller
{
    public function createAutomationToken(Request $request): JsonResponse
    {
        $token = $request->user()->createToken('automation-token', ['automation'])->plainTextToken;
        return response()->json(['token' => $token]);
    }

    public function importMockTest(Request $request): JsonResponse
    {
        $request->validate([
            'exam_slug' => 'required|string',
            'series_name' => 'required|string',
            'test_name' => 'required|string',
            'duration_sec' => 'required|integer|min:60',
            'negative_marking' => 'nullable|numeric|min:0',
            'question_mark' => 'nullable|numeric|min:0.5',
            'questions' => 'required|array|min:1',
            'questions.*.question_en' => 'required|string',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.options.*.label' => 'required|string|max:1',
            'questions.*.options.*.option_en' => 'required|string',
            'questions.*.options.*.is_correct' => 'required|boolean',
        ]);

        $exam = Exam::where('slug', $request->exam_slug)->first();
        if (!$exam) {
            return response()->json(['message' => "Exam '{$request->exam_slug}' not found."], 404);
        }

        $result = DB::transaction(function () use ($request, $exam) {
            $series = TestSeries::firstOrCreate(
                ['name_en' => $request->series_name, 'exam_id' => $exam->id],
                ['is_published' => true]
            );

            $questionIds = [];
            foreach ($request->questions as $qData) {
                $q = Question::create([
                    'question_en' => $qData['question_en'],
                    'question_hi' => $qData['question_hi'] ?? null,
                    'explanation_en' => $qData['explanation_en'] ?? null,
                    'difficulty' => $qData['difficulty'] ?? 'medium',
                ]);
                foreach ($qData['options'] as $opt) {
                    $q->options()->create($opt);
                }
                $questionIds[] = $q->id;
            }

            $questionMark = $request->question_mark ?? 1;
            $test = Test::create([
                'exam_id' => $exam->id,
                'name_en' => $request->test_name,
                'mode' => 'mock',
                'status' => 'published',
                'duration_sec' => $request->duration_sec,
                'negative_marking' => $request->negative_marking ?? 0.25,
                'question_mark' => $questionMark,
                'total_marks' => count($questionIds) * $questionMark,
            ]);

            foreach (array_values($questionIds) as $idx => $qid) {
                $test->questions()->attach($qid, ['sort_order' => $idx]);
            }

            $series->tests()->syncWithoutDetaching([$test->id]);

            return ['test_id' => $test->id, 'series_id' => $series->id, 'questions_created' => count($questionIds)];
        });

        Cache::forget("exam_{$exam->id}_full");

        return response()->json(['message' => 'Import successful.', 'data' => $result], 201);
    }
}
