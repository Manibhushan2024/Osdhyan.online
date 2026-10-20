<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveClass;
use App\Models\LiveClassMessage;
use App\Models\LiveClassParticipant;
use App\Models\LiveClassPoll;
use App\Models\User;
use App\Services\Live\LiveClassState;
use App\Services\Live\LiveProviderResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Teacher / admin management of live classes. Routes sit behind the
 * `teacher` middleware; ownership (class.teacher_id == me, or admin) is
 * enforced per request by owned().
 */
class LiveClassTeacherController extends Controller
{
    public function __construct(
        private readonly LiveProviderResolver $providers,
        private readonly LiveClassState $state,
    ) {
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function owned(Request $request, int $id): LiveClass
    {
        $class = LiveClass::findOrFail($id);
        if (!$class->canBeManagedBy($request->user())) {
            abort(403, 'You can only manage your own classes.');
        }

        return $class;
    }

    /** Full representation for the owner: public fields + room credentials. */
    private function ownerArray(LiveClass $class): array
    {
        $class->loadMissing('teacher:id,name,avatar');
        $class->loadCount(LiveClass::activeParticipantsCountConstraint());

        return array_merge($class->toPublicArray(), [
            'room_name'        => $class->room_name,
            'join_password'    => $class->join_password,
            'recording_url'    => $class->recording_url,
            'youtube_video_id' => $class->youtube_video_id,
            'can_manage'       => true,
        ]);
    }

    private function scheduleRules(bool $partial): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'title'            => [$req, 'string', 'max:160'],
            'description'      => ['nullable', 'string', 'max:5000'],
            'subject'          => ['nullable', 'string', 'max:80'],
            'exam'             => ['nullable', 'string', 'max:50'],
            'tags'             => ['nullable', 'array', 'max:10'],
            'tags.*'           => ['string', 'max:30'],
            'thumbnail'        => ['nullable', 'string', 'max:500'],
            'provider'         => [$req, Rule::in(LiveClass::PROVIDERS)],
            'scheduled_at'     => [$req, 'date'],
            'duration_min'     => ['nullable', 'integer', 'min:5', 'max:600'],
            'max_participants' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'youtube_url'      => ['nullable', 'string', 'max:300'],
        ];
    }

    // ── Listing ───────────────────────────────────────────────────────────────

    /** GET /live-classes/my/classes */
    public function myClasses(Request $request): JsonResponse
    {
        $classes = LiveClass::query()
            ->where('teacher_id', $request->user()->id)
            ->with('teacher:id,name,avatar')
            ->withCount(LiveClass::activeParticipantsCountConstraint())
            ->orderByRaw("case status when 'live' then 0 when 'scheduled' then 1 else 2 end")
            ->orderByDesc('scheduled_at')
            ->limit(200)
            ->get()
            ->map(fn (LiveClass $c) => $this->ownerArray($c))
            ->values();

        return response()->json([
            'classes'   => $classes,
            'providers' => $this->providers->describe(),
        ]);
    }

    /** GET /admin/live-classes — every class, admin only. */
    public function adminIndex(Request $request): JsonResponse
    {
        if (!$request->user()->isAdminUser()) {
            abort(403, 'Admin access required.');
        }
        $q = LiveClass::query()
            ->with('teacher:id,name,avatar')
            ->withCount(LiveClass::activeParticipantsCountConstraint())
            ->orderByDesc('scheduled_at');
        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }
        $page = $q->paginate(min(100, max(1, (int) $request->query('per_page', 25))));
        $page->getCollection()->transform(fn (LiveClass $c) => $this->ownerArray($c));

        return response()->json($page->toArray() + ['providers' => $this->providers->describe()]);
    }

    /** GET /admin/live-classes/hosts — admins and approved teachers an admin can schedule for. */
    public function adminHosts(Request $request): JsonResponse
    {
        if (!$request->user()->isAdminUser()) {
            abort(403, 'Admin access required.');
        }
        $teachers = User::query()
            ->where('role', User::ROLE_TEACHER)
            ->whereHas('teacherProfile', fn ($q) => $q->whereNotNull('verified_at'))
            ->orderBy('name')->limit(500)->get(['id', 'name', 'email'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]);

        return response()->json(['data' => $teachers]);
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /** POST /live-classes */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->scheduleRules(partial: false) + [
            'teacher_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);
        $teacherId = $request->user()->id;
        if (!empty($data['teacher_id']) && (int) $data['teacher_id'] !== $teacherId) {
            // Only admins may schedule on behalf of someone else, and only for a host.
            $host = User::find($data['teacher_id']);
            if (!$request->user()->isAdminUser() || !$host?->canHostLiveClasses()) {
                return response()->json(['message' => 'Choose an approved teacher.', 'errors' => ['teacher_id' => ['Choose an approved teacher.']]], 422);
            }
            $teacherId = $host->id;
        }
        unset($data['teacher_id']);
        $provider = $this->providers->for($data['provider']);
        $providerAttrs = $provider->prepareForSchedule($data);

        $class = LiveClass::create(array_merge(
            collect($data)->except('youtube_url')->all(),
            $providerAttrs,
            [
                'teacher_id'       => $teacherId,
                'status'           => LiveClass::STATUS_SCHEDULED,
                'max_participants' => $data['max_participants'] ?? 0,
            ]
        ));

        return response()->json(['class' => $this->ownerArray($class)], 201);
    }

    /** PATCH /live-classes/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        if ($class->isEnded()) {
            return response()->json(['message' => 'Ended classes cannot be edited. Add a recording instead.'], 422);
        }
        $data = $request->validate($this->scheduleRules(partial: true));

        $providerKey = $data['provider'] ?? $class->provider;
        if ($class->isLive() && $providerKey !== $class->provider) {
            return response()->json(['message' => 'Provider cannot change while the class is live.'], 422);
        }
        $providerAttrs = [];
        if (array_key_exists('provider', $data) || array_key_exists('youtube_url', $data)) {
            $providerAttrs = $this->providers->for($providerKey)->prepareForSchedule(
                $data + ['provider' => $providerKey],
                $class
            );
        }

        $class->fill(collect($data)->except('youtube_url')->all() + $providerAttrs)->save();
        $this->state->forget($class);

        return response()->json(['class' => $this->ownerArray($class->fresh())]);
    }

    /** DELETE /live-classes/{id} — not while live. */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        if ($class->isLive()) {
            return response()->json(['message' => 'End the class before deleting it.'], 422);
        }
        $class->delete();
        $this->state->forget($id);

        return response()->json(['ok' => true]);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    /** POST /live-classes/{id}/go-live */
    public function goLive(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        if ($class->isEnded()) {
            return response()->json(['message' => 'This class has already ended.'], 422);
        }
        if (!$class->isLive()) {
            $attrs = $this->providers->for($class)->prepareForGoLive($class);
            $class->fill($attrs + [
                'status'     => LiveClass::STATUS_LIVE,
                'started_at' => now(),
                'ended_at'   => null,
            ])->save();
            $this->state->forget($class);
        }

        return response()->json(['class' => $this->ownerArray($class->fresh())]);
    }

    /** POST /live-classes/{id}/end  {recording_url?} */
    public function end(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        $data = $request->validate(['recording_url' => ['nullable', 'url', 'max:500']]);

        if (!$class->isEnded()) {
            $recording = $data['recording_url'] ?? $class->recording_url
                ?? $this->providers->for($class)->defaultRecordingUrl($class);

            $class->fill([
                'status'                 => LiveClass::STATUS_ENDED,
                'ended_at'               => now(),
                'recording_url'          => $recording,
                'is_recording_available' => (bool) $recording,
            ])->save();

            // Everyone still in the room is out of it now.
            $class->participants()->whereNull('left_at')
                ->update(['left_at' => now(), 'hand_raised_at' => null]);
            $class->polls()->where('is_open', true)->update(['is_open' => false]);
            $this->state->forget($class);
        }

        return response()->json(['class' => $this->ownerArray($class->fresh())]);
    }

    /** POST /live-classes/{id}/recording  {recording_url} */
    public function recording(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        $data = $request->validate(['recording_url' => ['required', 'url', 'max:500']]);
        $class->update([
            'recording_url'          => $data['recording_url'],
            'is_recording_available' => true,
        ]);
        $this->state->forget($class);

        return response()->json(['class' => $this->ownerArray($class->fresh())]);
    }

    // ── Participants ──────────────────────────────────────────────────────────

    /** GET /live-classes/{id}/participants */
    public function participants(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        $rows = LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->active()
            ->with('user:id,name,avatar')
            ->orderByDesc('joined_at')
            ->limit(500)
            ->get()
            ->map(fn ($p) => [
                'user_id'     => $p->user_id,
                'name'        => $p->user?->name,
                'avatar'      => $p->user?->avatar,
                'role'        => $p->role,
                'joined_at'   => $p->joined_at?->toISOString(),
                'hand_raised' => $p->hand_raised_at !== null,
                'raised_at'   => $p->hand_raised_at?->toISOString(),
            ])
            ->values();

        return response()->json([
            'participants' => $rows,
            'count'        => $class->activeParticipantsCount(),
            'hands_raised' => $this->state->handsRaised($class),
        ]);
    }

    /** POST /live-classes/{id}/participants/{user}/lower-hand */
    public function lowerParticipantHand(Request $request, int $id, int $userId): JsonResponse
    {
        $class = $this->owned($request, $id);
        LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->where('user_id', $userId)
            ->update(['hand_raised_at' => null]);
        $this->state->forget($class);

        return response()->json(['ok' => true]);
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    private function ownedMessage(Request $request, int $id, int $messageId): array
    {
        $class = $this->owned($request, $id);
        /** @var LiveClassMessage $message */
        $message = $class->messages()->findOrFail($messageId);

        return [$class, $message];
    }

    /** PATCH /live-classes/{id}/messages/{m}/pin  {pinned?: bool} (toggles when omitted) */
    public function pinMessage(Request $request, int $id, int $messageId): JsonResponse
    {
        [$class, $message] = $this->ownedMessage($request, $id, $messageId);
        $pinned = $request->has('pinned') ? $request->boolean('pinned') : !$message->is_pinned;
        $message->update(['is_pinned' => $pinned]);
        $this->state->forget($class);

        return response()->json(['message' => $message->load('user:id,name,avatar')->toChatArray((int) $class->teacher_id)]);
    }

    /** PATCH /live-classes/{id}/messages/{m}/answered  {answered?: bool} */
    public function answerMessage(Request $request, int $id, int $messageId): JsonResponse
    {
        [$class, $message] = $this->ownedMessage($request, $id, $messageId);
        $answered = $request->has('answered') ? $request->boolean('answered') : !$message->is_answered;
        $message->update(['is_answered' => $answered]);
        $this->state->forget($class);

        return response()->json(['message' => $message->load('user:id,name,avatar')->toChatArray((int) $class->teacher_id)]);
    }

    /** DELETE /live-classes/{id}/messages/{m} */
    public function deleteMessage(Request $request, int $id, int $messageId): JsonResponse
    {
        [$class, $message] = $this->ownedMessage($request, $id, $messageId);
        $message->delete();
        $this->state->forget($class);

        return response()->json(['ok' => true]);
    }

    // ── Polls ─────────────────────────────────────────────────────────────────

    /** POST /live-classes/{id}/polls  {question, options: string[2..6]} */
    public function createPoll(Request $request, int $id): JsonResponse
    {
        $class = $this->owned($request, $id);
        if (!$class->isLive()) {
            return response()->json(['message' => 'Polls can only be created while the class is live.'], 422);
        }
        $data = $request->validate([
            'question'  => ['required', 'string', 'max:500'],
            'options'   => ['required', 'array', 'min:2', 'max:6'],
            'options.*' => ['required', 'string', 'max:120'],
        ]);

        // One open poll at a time keeps the student UI unambiguous.
        $class->polls()->where('is_open', true)->update(['is_open' => false]);

        $options = [];
        foreach (array_values($data['options']) as $i => $text) {
            $options[] = ['id' => chr(ord('a') + $i), 'text' => trim($text)];
        }
        $poll = $class->polls()->create([
            'question' => trim($data['question']),
            'options'  => $options,
            'is_open'  => true,
        ]);
        $this->state->forget($class);

        return response()->json(['poll' => $poll->toStateArray(withResults: true)], 201);
    }

    /** POST /live-classes/{id}/polls/{p}/close */
    public function closePoll(Request $request, int $id, int $pollId): JsonResponse
    {
        $class = $this->owned($request, $id);
        /** @var LiveClassPoll $poll */
        $poll = $class->polls()->findOrFail($pollId);
        $poll->update(['is_open' => false]);
        $this->state->forget($class);

        return response()->json(['poll' => $poll->fresh()->toStateArray(withResults: true)]);
    }

    /** POST /live-classes/{id}/polls/{p}/reveal — closes and shows results to students. */
    public function revealPoll(Request $request, int $id, int $pollId): JsonResponse
    {
        $class = $this->owned($request, $id);
        /** @var LiveClassPoll $poll */
        $poll = $class->polls()->findOrFail($pollId);
        $poll->update(['is_open' => false, 'revealed_at' => $poll->revealed_at ?? now()]);
        $this->state->forget($class);

        return response()->json(['poll' => $poll->fresh()->toStateArray(withResults: true)]);
    }
}
