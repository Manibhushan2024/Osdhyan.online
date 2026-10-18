<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveClass;
use App\Models\LiveClassMessage;
use App\Models\LiveClassParticipant;
use App\Models\LiveClassPoll;
use App\Models\LiveClassPollVote;
use App\Services\Live\LiveClassState;
use App\Services\Live\LiveProviderResolver;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Student-facing live class endpoints (any authenticated user). Teachers
 * and admins use these too when they are *inside* a room; management
 * lives in LiveClassTeacherController.
 */
class LiveClassController extends Controller
{
    public function __construct(
        private readonly LiveProviderResolver $providers,
        private readonly LiveClassState $state,
    ) {
    }

    /** GET /live-classes?status=live|upcoming|ended&subject=&exam= */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'live');
        $q = LiveClass::query()
            ->with('teacher:id,name,avatar')
            ->withCount(['participants as participants_count' => fn ($p) => $p->whereNull('left_at')]);

        switch ($status) {
            case 'upcoming':
            case 'scheduled':
                $q->where('status', LiveClass::STATUS_SCHEDULED)->orderBy('scheduled_at');
                break;
            case 'ended':
            case 'recordings':
                $q->where('status', LiveClass::STATUS_ENDED)->orderByDesc('ended_at');
                if ($status === 'recordings') {
                    $q->where('is_recording_available', true);
                }
                break;
            default:
                $q->where('status', LiveClass::STATUS_LIVE)->orderByDesc('started_at');
        }

        if ($subject = $request->query('subject')) {
            $q->where('subject', $subject);
        }
        if ($exam = $request->query('exam')) {
            $q->where('exam', $exam);
        }

        $perPage = min(50, max(1, (int) $request->query('per_page', 12)));
        $page = $q->paginate($perPage);
        $page->getCollection()->transform(fn (LiveClass $c) => $c->toPublicArray());

        return response()->json($page);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::with('teacher:id,name,avatar')
            ->withCount(['participants as participants_count' => fn ($p) => $p->whereNull('left_at')])
            ->findOrFail($id);

        $data = $class->toPublicArray();
        $data['can_manage'] = $class->canBeManagedBy($request->user());

        return response()->json(['class' => $data]);
    }

    /**
     * POST /live-classes/{id}/join
     *
     * Only a live class can be joined: before go-live the client shows the
     * countdown and polls `state` instead (403 + code=not_started here).
     */
    public function join(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $class = LiveClass::findOrFail($id);
        $isModerator = $class->canBeManagedBy($user);

        if ($class->isEnded()) {
            return response()->json(['message' => 'This class has ended.', 'code' => 'ended'], 403);
        }
        if (!$class->isLive()) {
            return response()->json([
                'message'      => 'The teacher has not started this class yet.',
                'code'         => 'not_started',
                'scheduled_at' => $class->scheduled_at?->toISOString(),
            ], 403);
        }

        $existing = LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$isModerator && $class->max_participants > 0 && !($existing && $existing->left_at === null)) {
            $active = $class->participants()
                ->whereNull('left_at')
                ->where('role', LiveClassParticipant::ROLE_STUDENT)
                ->count();
            if ($active >= $class->max_participants) {
                return response()->json(['message' => 'This class is full.', 'code' => 'full'], 403);
            }
        }

        LiveClassParticipant::updateOrCreate(
            ['live_class_id' => $class->id, 'user_id' => $user->id],
            [
                'role'      => $isModerator ? LiveClassParticipant::ROLE_TEACHER : LiveClassParticipant::ROLE_STUDENT,
                'joined_at' => now(),
                'left_at'   => null,
            ]
        );
        $this->state->forget($class);

        return response()->json([
            'class'    => $class->load('teacher:id,name,avatar')->toPublicArray(),
            'provider' => $this->providers->for($class)->joinPayload($class, $user, $isModerator),
            'state'    => $this->state->forUser($class, $user),
        ]);
    }

    public function leave(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->where('user_id', $request->user()->id)
            ->update(['left_at' => now(), 'hand_raised_at' => null]);
        $this->state->forget($class);

        return response()->json(['ok' => true]);
    }

    /** GET /live-classes/{id}/state — cached per class, see LiveClassState. */
    public function state(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);

        return response()->json($this->state->forUser($class, $request->user()));
    }

    /** GET /live-classes/{id}/messages?after={id}&limit=50 — ascending, only newer. */
    public function messages(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        $after = max(0, (int) $request->query('after', 0));
        $limit = min(100, max(1, (int) $request->query('limit', 50)));

        $rows = $class->messages()
            ->where('id', '>', $after)
            ->with('user:id,name,avatar')
            ->orderBy('id')
            ->limit($limit)
            ->get();

        return response()->json([
            'messages' => $rows->map(fn ($m) => $m->toChatArray((int) $class->teacher_id))->values(),
            'last_id'  => (int) ($rows->last()?->id ?? $after),
        ]);
    }

    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        if (!$class->isLive()) {
            return response()->json(['message' => 'Chat is only open while the class is live.'], 403);
        }
        $data = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:' . LiveClassMessage::MAX_LENGTH],
        ]);

        $message = $class->messages()->create([
            'user_id' => $request->user()->id,
            'body'    => trim($data['body']),
        ]);
        $message->setRelation('user', $request->user());

        return response()->json(['message' => $message->toChatArray((int) $class->teacher_id)], 201);
    }

    public function raiseHand(Request $request, int $id): JsonResponse
    {
        return $this->setHand($request, $id, true);
    }

    public function lowerHand(Request $request, int $id): JsonResponse
    {
        return $this->setHand($request, $id, false);
    }

    private function setHand(Request $request, int $id, bool $raised): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        $participant = LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->where('user_id', $request->user()->id)
            ->whereNull('left_at')
            ->first();
        if (!$participant) {
            return response()->json(['message' => 'Join the class first.'], 403);
        }
        $participant->update(['hand_raised_at' => $raised ? now() : null]);
        $this->state->forget($class);

        return response()->json(['ok' => true, 'hand_raised' => $raised]);
    }

    /** POST /live-classes/{id}/polls/{poll}/vote — one vote per user, immutable. */
    public function vote(Request $request, int $id, int $pollId): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        /** @var LiveClassPoll $poll */
        $poll = $class->polls()->findOrFail($pollId);
        if (!$poll->is_open) {
            return response()->json(['message' => 'This poll is closed.'], 403);
        }
        $data = $request->validate(['option_id' => ['required', 'string', 'max:16']]);
        if (!$poll->hasOption($data['option_id'])) {
            return response()->json(['message' => 'Unknown option.'], 422);
        }

        $existing = LiveClassPollVote::query()
            ->where('poll_id', $poll->id)
            ->where('user_id', $request->user()->id)
            ->first();
        if ($existing) {
            return response()->json([
                'message'   => 'You have already voted.',
                'option_id' => $existing->option_id,
            ], 409);
        }

        try {
            LiveClassPollVote::create([
                'poll_id'   => $poll->id,
                'user_id'   => $request->user()->id,
                'option_id' => $data['option_id'],
            ]);
        } catch (QueryException $e) {
            // unique(poll_id,user_id) raced with a concurrent request
            return response()->json(['message' => 'You have already voted.'], 409);
        }
        $this->state->forget($class);

        return response()->json(['ok' => true, 'option_id' => $data['option_id']], 201);
    }
}
