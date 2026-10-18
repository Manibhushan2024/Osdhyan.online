<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use App\Models\LiveClassParticipant;
use App\Models\LiveClassPoll;
use App\Models\LiveClassPollVote;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * The "state" document every viewer polls (every ~5 s). The shared part is
 * cached for a couple of seconds per class so a thousand students cost a
 * handful of queries per second, not a thousand. Per-user bits (my vote,
 * my hand) and teacher-only bits are layered on top, uncached.
 */
class LiveClassState
{
    public function cacheSeconds(): int
    {
        return max(1, (int) config('services.live.state_cache_seconds', 2));
    }

    public function forget(LiveClass|int $class): void
    {
        $id = $class instanceof LiveClass ? $class->id : $class;
        Cache::forget("live:{$id}:state");
    }

    /**
     * @return array<string,mixed>
     */
    public function shared(LiveClass $class): array
    {
        return Cache::remember($class->stateCacheKey(), $this->cacheSeconds(), function () use ($class) {
            $fresh = LiveClass::query()->find($class->id) ?? $class;

            $pinned = $fresh->messages()
                ->where('is_pinned', true)
                ->with('user:id,name,avatar')
                ->orderByDesc('id')
                ->limit(5)
                ->get()
                ->map(fn ($m) => $m->toChatArray((int) $fresh->teacher_id))
                ->values()
                ->all();

            /** @var LiveClassPoll|null $poll */
            $poll = $fresh->polls()->orderByDesc('id')->first();

            return [
                'id'                 => $fresh->id,
                'status'             => $fresh->status,
                'provider'           => $fresh->provider,
                'started_at'         => $fresh->started_at?->toISOString(),
                'ended_at'           => $fresh->ended_at?->toISOString(),
                'scheduled_at'       => $fresh->scheduled_at?->toISOString(),
                'recording_url'      => $fresh->is_recording_available ? $fresh->recording_url : null,
                'participants_count' => $fresh->activeParticipantsCount(),
                'hands_raised_count' => $fresh->participants()
                    ->whereNull('left_at')->whereNotNull('hand_raised_at')->count(),
                'pinned_messages'    => $pinned,
                'poll'               => $poll?->toStateArray(withResults: false),
                'latest_message_id'  => (int) ($fresh->messages()->max('id') ?? 0),
                'server_time'        => now()->toISOString(),
            ];
        });
    }

    /**
     * Shared state + what only this user should see.
     *
     * @return array<string,mixed>
     */
    public function forUser(LiveClass $class, User $user): array
    {
        $state = $this->shared($class);
        $isTeacher = $class->canBeManagedBy($user);

        $me = LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->where('user_id', $user->id)
            ->first(['id', 'role', 'joined_at', 'left_at', 'hand_raised_at']);

        $state['me'] = [
            'joined'      => $me !== null && $me->left_at === null,
            'hand_raised' => $me !== null && $me->hand_raised_at !== null && $me->left_at === null,
            'is_teacher'  => $isTeacher,
        ];

        $state['my_vote'] = null;
        if (!empty($state['poll']['id'])) {
            $state['my_vote'] = LiveClassPollVote::query()
                ->where('poll_id', $state['poll']['id'])
                ->where('user_id', $user->id)
                ->value('option_id');
        }

        if ($isTeacher) {
            // Teachers always see live poll results and who has a hand up.
            if (!empty($state['poll']['id'])) {
                $poll = LiveClassPoll::find($state['poll']['id']);
                $state['poll'] = $poll?->toStateArray(withResults: true);
            }
            $state['hands_raised'] = $this->handsRaised($class);
        }

        return $state;
    }

    /** @return list<array{user_id:int,name:string|null,raised_at:string|null}> */
    public function handsRaised(LiveClass $class): array
    {
        return LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->whereNull('left_at')
            ->whereNotNull('hand_raised_at')
            ->with('user:id,name,avatar')
            ->orderBy('hand_raised_at')
            ->get()
            ->map(fn ($p) => [
                'user_id'   => $p->user_id,
                'name'      => $p->user?->name,
                'avatar'    => $p->user?->avatar,
                'raised_at' => $p->hand_raised_at?->toISOString(),
            ])
            ->values()
            ->all();
    }
}
