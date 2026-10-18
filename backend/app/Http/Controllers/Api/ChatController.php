<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TuitionRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Generic 1:1 chat. Polling-based: the portal polls the open thread every 4s
 * (GET messages?after=<last id>) and the list every 15s. Upgrade path:
 * broadcast new messages over Laravel Reverb and keep these endpoints as the
 * catch-up/history API.
 */
class ChatController extends Controller
{
    /** Qualified: the participants relation joins conversation_participants. */
    private const USER_PUBLIC = ['users.id', 'users.name', 'users.avatar', 'users.role'];

    /** Whether $a may start a conversation with $b. */
    private function canOpen(User $a, int $b): bool
    {
        if ($a->isAdminUser()) {
            return true;
        }
        if ($a->id === $b) {
            return false;
        }

        // An accepted (matched) requirement or a direct contact in either direction.
        return TuitionRequest::whereNotNull('selected_teacher_id')
            ->where(function ($q) use ($a, $b) {
                $q->where(fn ($qq) => $qq->where('student_id', $a->id)->where('selected_teacher_id', $b))
                    ->orWhere(fn ($qq) => $qq->where('student_id', $b)->where('selected_teacher_id', $a->id));
            })
            ->exists();
    }

    private function presentForUser(Conversation $c, int $meId): array
    {
        $other = $c->participants->first(fn (User $u) => $u->id !== $meId);
        $me = $c->participants->first(fn (User $u) => $u->id === $meId);
        $last = $c->messages()->latest('id')->first();

        return [
            'id'              => $c->id,
            'type'            => $c->type,
            'subject_type'    => $c->subject_type ? class_basename($c->subject_type) : null,
            'subject_id'      => $c->subject_id,
            'other'           => $other ? [
                'id'     => $other->id,
                'name'   => $other->name,
                'avatar' => $other->avatar,
                'role'   => $other->role,
            ] : null,
            'last_message'    => $last?->toApiArray(),
            'last_message_at' => $c->last_message_at?->toISOString(),
            'unread_count'    => $c->unreadCountFor($meId, (int) ($me?->pivot?->last_read_message_id ?? 0)),
        ];
    }

    private function participantOrFail(Request $request, int $id): Conversation|null
    {
        $c = Conversation::with(['participants' => fn ($q) => $q->select(self::USER_PUBLIC)])->find($id);
        if (!$c || !$c->participants->contains('id', $request->user()->id)) {
            return null;
        }

        return $c;
    }

    /** GET /conversations */
    public function index(Request $request)
    {
        $me = $request->user();

        $conversations = Conversation::forUser($me->id)
            ->with(['participants' => fn ($q) => $q->select(self::USER_PUBLIC)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(100)
            ->get();

        $data = $conversations->map(fn (Conversation $c) => $this->presentForUser($c, $me->id))->values();

        return response()->json([
            'data'         => $data,
            'unread_total' => $data->sum('unread_count'),
        ]);
    }

    /** POST /conversations {user_id} */
    public function store(Request $request)
    {
        $me = $request->user();
        $validated = $request->validate(['user_id' => 'required|integer|exists:users,id']);
        $other = (int) $validated['user_id'];

        if (!$this->canOpen($me, $other)) {
            return response()->json(['message' => 'You can only message teachers or students you are matched with.'], 403);
        }

        $conversation = Conversation::openDirect($me->id, $other);
        $conversation->load(['participants' => fn ($q) => $q->select(self::USER_PUBLIC)]);

        return response()->json(['conversation' => $this->presentForUser($conversation, $me->id)], 201);
    }

    /** GET /conversations/{id} */
    public function show(Request $request, int $id)
    {
        $c = $this->participantOrFail($request, $id);
        if (!$c) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['conversation' => $this->presentForUser($c, $request->user()->id)]);
    }

    /** GET /conversations/{id}/messages?after={id}&limit=50 — ascending by id. */
    public function messages(Request $request, int $id)
    {
        $c = $this->participantOrFail($request, $id);
        if (!$c) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'after'  => 'nullable|integer|min:0',
            'before' => 'nullable|integer|min:1',
            'limit'  => 'nullable|integer|min:1|max:100',
        ]);
        $limit = (int) ($validated['limit'] ?? 50);

        $query = $c->messages();
        if (!empty($validated['after'])) {
            $query->where('id', '>', (int) $validated['after'])->orderBy('id')->limit($limit);
            $rows = $query->get();
        } elseif (!empty($validated['before'])) {
            // Older history page, still returned ascending.
            $rows = $query->where('id', '<', (int) $validated['before'])->orderByDesc('id')->limit($limit)->get()->reverse()->values();
        } else {
            // Latest page, ascending.
            $rows = $query->orderByDesc('id')->limit($limit)->get()->reverse()->values();
        }

        return response()->json([
            'data'     => $rows->map(fn (Message $m) => $m->toApiArray())->values(),
            'has_more' => $rows->count() === $limit,
        ]);
    }

    /** POST /conversations/{id}/messages {body} */
    public function send(Request $request, int $id)
    {
        $c = $this->participantOrFail($request, $id);
        if (!$c) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate(['body' => 'required|string|max:' . Message::MAX_LENGTH]);
        $body = trim($validated['body']);
        if ($body === '') {
            return response()->json(['message' => 'Message cannot be empty.'], 422);
        }

        $me = $request->user();
        $message = DB::transaction(function () use ($c, $me, $body) {
            $message = $c->messages()->create(['sender_id' => $me->id, 'body' => $body]);
            $c->forceFill(['last_message_at' => now()])->save();
            $c->participants()->updateExistingPivot($me->id, [
                'last_read_at'         => now(),
                'last_read_message_id' => $message->id,
            ]);

            return $message;
        });

        return response()->json(['message' => $message->toApiArray()], 201);
    }

    /** POST /conversations/{id}/read */
    public function read(Request $request, int $id)
    {
        $c = $this->participantOrFail($request, $id);
        if (!$c) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $c->markReadBy($request->user()->id);

        return response()->json(['ok' => true]);
    }
}
