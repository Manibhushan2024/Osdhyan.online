<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->get('status', 'live');
        $classes = LiveClass::where('status', $status)
            ->with('teacher:id,name,avatar')
            ->orderByDesc('scheduled_at')
            ->get()
            ->map(fn($c) => [
                'id'               => $c->id,
                'title'            => $c->title,
                'description'      => $c->description,
                'subject'          => $c->subject,
                'thumbnail'        => $c->thumbnail,
                'stream_url'       => $c->stream_url,
                'recording_url'    => $c->recording_url,
                'status'           => $c->status,
                'duration_min'     => $c->duration_min,
                'max_participants' => $c->max_participants,
                'scheduled_at'     => $c->scheduled_at,
                'started_at'       => $c->started_at,
                'ended_at'         => $c->ended_at,
                'teacher'          => $c->teacher ? [
                    'id'   => $c->teacher->id,
                    'name' => $c->teacher->name,
                ] : null,
                'participant_count' => 0,
            ]);

        return response()->json($classes);
    }

    public function show(int $id): JsonResponse
    {
        $class = LiveClass::with('teacher:id,name,avatar')->findOrFail($id);
        return response()->json(['class' => $class]);
    }

    public function join(int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        return response()->json(['teacher_id' => $class->teacher_id]);
    }

    public function leave(int $id): JsonResponse
    {
        return response()->json(['message' => 'Left.']);
    }

    public function state(int $id): JsonResponse
    {
        return response()->json([
            'server_time'       => now()->toISOString(),
            'messages'          => [],
            'polls'             => [],
            'participants'      => [],
            'participant_count' => 0,
            'hands_raised'      => [],
            'status'            => LiveClass::find($id)?->status ?? 'ended',
        ]);
    }

    public function signals(int $id): JsonResponse
    {
        return response()->json(['signals' => [], 'last_id' => 0]);
    }

    public function sendSignal(int $id): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    public function sendMessage(int $id): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    public function raiseHand(int $id): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    public function vote(int $id, int $pollId): JsonResponse
    {
        return response()->json(['ok' => true]);
    }
}
