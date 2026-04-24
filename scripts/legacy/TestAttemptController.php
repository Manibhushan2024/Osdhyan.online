<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestResponse;
use App\Models\QuestionOption;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TestAttemptController extends Controller
{
    protected function ensureAttemptOwner(TestAttempt $attempt)
    {
        if ((int) $attempt->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Unauthorized attempt access.'], 403);
        }

        return null;
    }

    public function startAttempt(Test $test)
    {
        \Log::info("Attempting to start test: " . $test->id . " for user: " . Auth::id());
        
        $ongoingAttempt = TestAttempt::where('user_id', Auth::id())
            ->where('test_id', $test->id)
            ->where('status', 'ongoing')
            ->first();

        if ($ongoingAttempt) {
            return response()->json([
                'message' => 'Resuming existing attempt',
                'attempt' => $ongoingAttempt->load('responses'),
                'is_resume' => true
            ]);
        }

        $ongoingCount = TestAttempt::where('user_id', Auth::id())
            ->where('status', 'ongoing')
            ->count();

        if ($ongoingCount >= 50) {
            return response()->json([
                'message' => 'You can only have 50 active tests at a time. Please complete your existing attempts.'
            ], 403);
        }

        $attempt = TestAttempt::create([
            'user_id' => Auth::id(),
            'test_id' => $test->id,
            'started_at' => now(),
            'status' => 'ongoing',
        ]);

        return response()->json([
            'message' => 'Attempt started successfully',
            'attempt' => $attempt,
        ]);
    }

    public function saveResponse(Request $request, $attemptId)
    {
        if (!is_numeric($attemptId)) {
            \Log::error("Invalid attemptId in saveResponse: " . $attemptId);
            return response()->json(['message' => 'Invalid attempt ID'], 400);
        }
        $attempt = TestAttempt::findOrFail($attemptId);
        if ($unauthorized = $this->ensureAttemptOwner($attempt)) {
            return $unauthorized;
        }

        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'selected_option_id' => 'nullable|exists:question_options,id',
            'is_marked_for_review' => 'boolean',
            'time_taken_sec' => 'integer',
        ]);

        $response = TestResponse::updateOrCreate(
            [
                'test_attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'selected_option_id' => $validated['selected_option_id'] ?? null,
                'is_marked_for_review' => $validated['is_marked_for_review'] ?? false,
                'time_taken_sec' => $validated['time_taken_sec'] ?? 0,
            ]
        );

        return response()->json([
            'message' => 'Response saved successfully',
            'response' => $response,
        ]);
    }

    public function syncResponses(Request $request, $attemptId)
    {
        if (!is_numeric($attemptId)) {
            \Log::error("Invalid attemptId in syncResponses: " . $attemptId);
            return response()->json(['message' => 'Invalid attempt ID'], 400);
        }
        $attempt = TestAttempt::findOrFail($attemptId);
        if ($unauthorized = $this->ensureAttemptOwner($attempt)) {
            return $unauthorized;
        }

        $validated = $request->validate([
            'responses' => 'required|array',
            'responses.*.question_id' => 'required|exists:questions,id',
            'responses.*.selected_option_id' => 'nullable|exists:question_options,id',
            'responses.*.is_marked_for_review' => 'boolean',
            'responses.*.time_taken_sec' => 'integer',
        ]);

        foreach ($validated['responses'] as $resp) {
            TestResponse::updateOrCreate(
                [
                    'test_attempt_id' => $attempt->id,
                    'question_id' => $resp['question_id'],
                ],
                [
                    'selected_option_id' => $resp['selected_option_id'] ?? null,
                    'is_marked_for_review' => $resp['is_marked_for_review'] ?? false,
                    'time_taken_sec' => $resp['time_taken_sec'] ?? 0,
                ]
            );
        }

        return response()->json(['message' => 'All responses synced successfully']);
    }

    public function show($attemptId)
    {
        if (!is_numeric($attemptId)) {
            return response()->json(['message' => 'Invalid attempt ID'], 400);
        }
        $attempt = TestAttempt::findOrFail($attemptId);
        if ($unauthorized = $this->ensureAttemptOwner($attempt)) {
            return $unauthorized;
        }

        return response()->json($attempt->load(['responses', 'test.questions.options', 'test.questions.subject']));
    }

    public function completeAttempt($attemptId)
    {
        \Log::info("DEBUG: completeAttempt called with attemptId: " . $attemptId);
        
        if (!is_numeric($attemptId)) {
            \Log::error("Invalid attemptId in completeAttempt: " . $attemptId);
            return response()->json(['message' => 'Invalid attempt ID'], 400);
        }
        $attempt = TestAttempt::findOrFail($attemptId);
        if ($unauthorized = $this->ensureAttemptOwner($attempt)) {
            return $unauthorized;
        }

        \Log::info("Attempting to complete test: " . $attempt->id . " for user: " . Auth::id());
        
        if ($attempt->status !== 'ongoing') {
            return response()->json(['message' => 'Attempt already completed'], 400);
        }

        $test = $attempt->test()->with('questions.subject')->first();
        $totalScore = 0;
        $correctCount = 0;
        $incorrectCount = 0;
        $responses = $attempt->responses()->get();

        $sectionalStats = [];

        foreach ($responses as $response) {
            if (!$response->selected_option_id) continue;

            $isCorrect = QuestionOption::where('id', $response->selected_option_id)
                ->where('question_id', $response->question_id)
                ->where('is_correct', true)
                ->exists();

            // Get marks from pivot or test default
            $question = $test->questions()->where('questions.id', $response->question_id)->first();
            if (!$question) continue;
            
            $pivot = $question->pivot;
            $marks = $pivot->marks ?? 1.0;
            $negativeMarks = $pivot->negative_marks ?? $test->negative_marking ?? 0.0;

            $subjectName = $question->subject->name_en ?? 'General';
            if (!isset($sectionalStats[$subjectName])) {
                $sectionalStats[$subjectName] = ['correct' => 0, 'incorrect' => 0, 'total' => 0, 'marks' => 0];
            }
            $sectionalStats[$subjectName]['total']++;

            if ($isCorrect) {
                $totalScore += $marks;
                $correctCount++;
                $response->update(['marks_obtained' => $marks]);
                $sectionalStats[$subjectName]['correct']++;
                $sectionalStats[$subjectName]['marks'] += $marks;
            } else {
                $totalScore -= $negativeMarks;
                $incorrectCount++;
                $response->update(['marks_obtained' => -$negativeMarks]);
                $sectionalStats[$subjectName]['incorrect']++;
                $sectionalStats[$subjectName]['marks'] -= $negativeMarks;
            }
        }

        // ... existing logic ...
        $attempt->update([
            'completed_at' => now(),
            'total_score' => $totalScore,
            'status' => 'completed',
            'time_taken_sec' => (int) Carbon::parse($attempt->started_at)->diffInSeconds(now()),
            'metadata' => [
                'correct_count' => $correctCount,
                'incorrect_count' => $incorrectCount,
                'sectional_stats' => $sectionalStats,
                'accuracy' => $accuracy = ($correctCount + $incorrectCount) > 0 ? round(($correctCount / ($correctCount + $incorrectCount)) * 100, 2) : 0
            ]
        ]);

        // Update User Stats
        $user = $attempt->user;
        $prevTests = $user->total_tests_attempted;
        $prevAvg = $user->avg_accuracy;
        
        $newTests = $prevTests + 1;
        $newAvg = (($prevTests * $prevAvg) + $accuracy) / $newTests;

        $user->update([
            'total_tests_attempted' => $newTests,
            'avg_accuracy' => round($newAvg, 2),
            'total_study_time_prod_sec' => $user->total_study_time_prod_sec + $attempt->time_taken_sec
        ]);

        return response()->json([
            'message' => 'Test completed successfully',
            'total_score' => $totalScore,
            'attempt' => $attempt->load('responses'),
        ]);
    }

    public function getLatestAttempt($testId)
    {
        $attempt = TestAttempt::where('user_id', Auth::id())
            ->where('test_id', $testId)
            ->latest()
            ->first();

        if (!$attempt) {
            return response()->json(['status' => 'none']);
        }

        return response()->json([
            'status' => $attempt->status, // 'ongoing' or 'completed'
            'attempt_id' => $attempt->id
        ]);
    }
}
