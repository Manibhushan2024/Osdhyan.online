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
            ->withCount(LiveClass::activeParticipantsCountConstraint());

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
            ->withCount(LiveClass::activeParticipantsCountConstraint())
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

        // Someone already holding a seat (rejoin, second tab) is never refused.
        $holdsSeat = $existing && $existing->left_at === null
            && $existing->last_seen_at?->gte(now()->subSeconds(LiveClassParticipant::STALE_AFTER_SECONDS));
        if (!$isModerator && $class->max_participants > 0 && !$holdsSeat) {
            $active = $class->participants()
                ->active()
                ->where('role', LiveClassParticipant::ROLE_STUDENT)
                ->count();
            if ($active >= $class->max_participants) {
                return response()->json(['message' => 'This class is full.', 'code' => 'full'], 403);
            }
        }

        LiveClassParticipant::updateOrCreate(
            ['live_class_id' => $class->id, 'user_id' => $user->id],
            [
                'role'         => $isModerator ? LiveClassParticipant::ROLE_TEACHER : LiveClassParticipant::ROLE_STUDENT,
                'joined_at'    => now(),
                'left_at'      => null,
                'last_seen_at' => now(),
            ]
        );
        // No cache forget here: at class start hundreds join within seconds
        // and the count catching up within the cache TTL is fine.

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

        return response()->json(['ok' => true]);
    }

    /**
     * GET /live-classes/{id}/state[?after={id}] — cached per class, see LiveClassState.
     *
     * With `after` (the chat's cursor) the response also carries the chat
     * messages newer than it (`messages`, `messages_has_more`), so an open
     * chat needs no second request per tick. Without it, nothing changes.
     */
    public function state(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        $state = $this->state->forUser($class, $request->user());

        if ($request->has('after')) {
            [$rows, $hasMore] = $this->chatPage($class, max(0, (int) $request->query('after')), 50);
            $state['messages'] = $rows;
            $state['messages_has_more'] = $hasMore;
        }

        return response()->json($state);
    }

    /**
     * GET /live-classes/{id}/messages?after={id}&limit=50 — ascending.
     *
     *  - after=0 (first load): the newest `limit` messages, so someone who
     *    joins late sees the current conversation, not the first 50 lines.
     *  - after=N: messages newer than N; has_more=true means call again.
     *
     * Anyone caught up is served from the cached snapshot (no query).
     */
    public function messages(Request $request, int $id): JsonResponse
    {
        $class = LiveClass::findOrFail($id);
        $after = max(0, (int) $request->query('after', 0));
        $limit = min(100, max(1, (int) $request->query('limit', 50)));

        [$rows, $hasMore] = $this->chatPage($class, $after, $limit);

        return response()->json([
            'messages' => $rows,
            'last_id'  => (int) (end($rows)['id'] ?? $after),
            'has_more' => $hasMore,
        ]);
    }

    /**
     * @return array{0: list<array<string,mixed>>, 1: bool} [messages ascending, has_more]
     */
    private function chatPage(LiveClass $class, int $after, int $limit): array
    {
        $window = $this->state->recentMessages($class);
        $windowIsWholeHistory = count($window) < LiveClassState::RECENT_WINDOW;
        $windowMin = $window[0]['id'] ?? PHP_INT_MAX;

        if ($after === 0) {
            return [array_values(array_slice($window, -$limit)), false];
        }
        if ($windowIsWholeHistory || $after >= $windowMin) {
            $newer = array_values(array_filter($window, fn ($m) => $m['id'] > $after));

            return [array_slice($newer, 0, $limit), count($newer) > $limit];
        }

        // Far behind (rare): read from the table.
        $found = $class->messages()
            ->where('id', '>', $after)
            ->with('user:id,name,avatar')
            ->orderBy('id')
            ->limit($limit + 1)
            ->get();

        return [
            $found->take($limit)->map(fn ($m) => $m->toChatArray((int) $class->teacher_id))->values()->all(),
            $found->count() > $limit,
        ];
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
        // New chat should reach everyone on their next poll. Even a busy
        // class (a few messages a second) means only a few snapshot rebuilds
        // a second, while hundreds of polls in between hit the cache.
        $this->state->forget($class);

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
        $participant->update(['hand_raised_at' => $raised ? now() : null, 'last_seen_at' => now()]);
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
        // No cache forget: everyone votes within seconds; the vote total in
        // the shared state catches up within the cache TTL, the teacher's
        // results and the voter's own my_vote are read uncached.

        return response()->json(['ok' => true, 'option_id' => $data['option_id']], 201);
    }
}
