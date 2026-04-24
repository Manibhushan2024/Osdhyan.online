<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudySessionController extends Controller
{
    public function getActive(Request $request): JsonResponse
    {
        $session = StudySession::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        return response()->json(['data' => $session]);
    }

    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'subject_id'  => 'nullable|exists:subjects,id',
            'topic_id'    => 'nullable|exists:topics,id',
            'material_id' => 'nullable|exists:study_materials,id',
        ]);

        StudySession::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->update(['status' => 'abandoned', 'ended_at' => now()]);

        $session = StudySession::create([
            'user_id'    => $request->user()->id,
            'subject_id' => $request->subject_id,
            'topic_id'   => $request->topic_id,
            'started_at' => now(),
            'status'     => 'active',
        ]);

        return response()->json(['data' => $session], 201);
    }

    public function pause(Request $request, int $id): JsonResponse
    {
        $session = StudySession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $elapsed = now()->diffInSeconds($session->started_at);
        $session->update([
            'duration_sec' => $session->duration_sec + $elapsed,
            'status' => 'paused',
        ]);

        return response()->json(['data' => $session]);
    }

    public function resume(Request $request, int $id): JsonResponse
    {
        $session = StudySession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $session->update(['status' => 'active', 'started_at' => now()]);

        return response()->json(['data' => $session]);
    }

    public function stop(Request $request, int $id): JsonResponse
    {
        $session = StudySession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $elapsed = $session->status === 'active'
            ? now()->diffInSeconds($session->started_at)
            : 0;

        $total = $session->duration_sec + $elapsed;

        $session->update([
            'duration_sec' => $total,
            'ended_at' => now(),
            'status' => 'completed',
        ]);

        $request->user()->increment('total_study_time_prod_sec', $total);

        return response()->json(['data' => $session]);
    }

    public function sync(Request $request, int $id): JsonResponse
    {
        $session = StudySession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $data = $request->validate([
            'duration_sec'    => 'nullable|integer|min:0',
            'focus_duration'  => 'nullable|integer|min:0', // alias used by MaterialViewer
            'break_duration'  => 'nullable|integer|min:0',
            'status'          => 'nullable|string|in:active,paused,completed',
        ]);

        $delta = $data['focus_duration'] ?? $data['duration_sec'] ?? 0;
        $newDuration = $session->duration_sec + $delta;

        $updates = ['duration_sec' => $newDuration];
        if (!empty($data['status']) && in_array($data['status'], ['paused', 'completed'])) {
            $updates['status']   = $data['status'];
            $updates['ended_at'] = now();
        }

        $session->update($updates);

        if ($delta > 0) {
            $request->user()->increment('total_study_time_prod_sec', $delta);
        }

        return response()->json(['data' => $session->fresh()]);
    }
}
