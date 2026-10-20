<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use App\Models\LiveClassMessage;
use App\Models\LiveClassParticipant;
use App\Models\LiveClassPoll;
use App\Models\LiveClassPollVote;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * The "state" document every viewer polls (every 4-10 s, see poll_ms). The
 * shared part is cached for a couple of seconds per class so a thousand
 * students cost a handful of queries per second, not a thousand. Per-user
 * bits (my vote, my hand) and teacher-only bits are layered on top.
 *
 * The same cached snapshot also holds the newest RECENT_WINDOW chat
 * messages, so the chat poll (`messages?after=`) is answered from memory
 * for everyone who is caught up, and latest_message_id is always
 * consistent with what the messages endpoint can return.
 *
 * Invalidation: teacher actions (pin, answer, delete, polls, go-live, end),
 * new chat messages and raised hands call forget() so they show up on the
 * next poll. Burst-y student actions (join, leave, votes) do NOT: at class
 * start hundreds arrive within seconds and rebuilding on each would defeat
 * the cache; they become visible within cacheSeconds().
 */
class LiveClassState
{
    public const RECENT_WINDOW = 100;

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
     * Shared snapshot including the private `_recent` chat window.
     *
     * @return array<string,mixed>
     */
    public function snapshot(LiveClass $class): array
    {
        return Cache::remember($class->stateCacheKey(), $this->cacheSeconds(), function () use ($class) {
            $fresh = LiveClass::query()->find($class->id) ?? $class;
            $teacherId = (int) $fresh->teacher_id;

            $pinned = $fresh->messages()
                ->where('is_pinned', true)
                ->with('user:id,name,avatar')
                ->orderByDesc('id')
                ->limit(5)
                ->get()
                ->map(fn ($m) => $m->toChatArray($teacherId))
                ->values()
                ->all();

            $recent = $fresh->messages()
                ->with('user:id,name,avatar')
                ->orderByDesc('id')
                ->limit(self::RECENT_WINDOW)
                ->get()
                ->reverse()
                ->map(fn ($m) => $m->toChatArray($teacherId))
                ->values()
                ->all();

            // So open chat windows can drop removed messages and tick answered ones.
            $removed = LiveClassMessage::onlyTrashed()
                ->where('live_class_id', $fresh->id)
                ->orderByDesc('id')
                ->limit(200)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
            $answered = $fresh->messages()
                ->where('is_answered', true)
                ->orderByDesc('id')
                ->limit(200)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            /** @var LiveClassPoll|null $poll */
            $poll = $fresh->polls()->orderByDesc('id')->first();
            $count = $fresh->activeParticipantsCount();

            return [
                'id'                   => $fresh->id,
                'status'               => $fresh->status,
                'provider'             => $fresh->provider,
                'started_at'           => $fresh->started_at?->toISOString(),
                'ended_at'             => $fresh->ended_at?->toISOString(),
                'scheduled_at'         => $fresh->scheduled_at?->toISOString(),
                'recording_url'        => $fresh->is_recording_available ? $fresh->recording_url : null,
                'participants_count'   => $count,
                'hands_raised_count'   => $fresh->participants()->active()->whereNotNull('hand_raised_at')->count(),
                'pinned_messages'      => $pinned,
                'removed_message_ids'  => $removed,
                'answered_message_ids' => $answered,
                'poll'                 => $poll?->toStateArray(withResults: false),
                'latest_message_id'    => (int) (end($recent)['id'] ?? 0),
                'poll_ms'              => $this->pollIntervalMs($fresh->status, $count),
                'server_time'          => now()->toISOString(),
                '_recent'              => $recent,
            ];
        });
    }

    /**
     * Public shared part (what every viewer sees).
     *
     * @return array<string,mixed>
     */
    public function shared(LiveClass $class): array
    {
        $state = $this->snapshot($class);
        unset($state['_recent']);

        return $state;
    }

    /**
     * Newest RECENT_WINDOW messages (ascending), from the cached snapshot.
     *
     * @return list<array<string,mixed>>
     */
    public function recentMessages(LiveClass $class): array
    {
        return $this->snapshot($class)['_recent'] ?? [];
    }

    /**
     * How often clients should poll. Bigger rooms poll less often so a
     * single server copes; chat latency stays within a few seconds.
     */
    public function pollIntervalMs(string $status, int $participants): int
    {
        if ($status === LiveClass::STATUS_ENDED) {
            return 60000;
        }
        if ($status === LiveClass::STATUS_SCHEDULED) {
            return 10000;
        }

        // Each viewer costs one request per tick (state carries new chat
        // too), so N viewers at T ms is N*1000/T requests a second.
        $ms = match (true) {
            $participants <= 40  => 4000,
            $participants <= 150 => 6000,
            $participants <= 500 => 10000,
            default              => 15000,
        };
        $scale = (float) config('services.live.poll_scale', 1);

        return (int) min(60000, max(2000, round($ms * ($scale > 0 ? $scale : 1))));
    }

    /**
     * Shared state + what only this user should see. Also the presence
     * heartbeat: a joined participant's last_seen_at is refreshed here at
     * most every HEARTBEAT_SECONDS (one cheap UPDATE per student per ~45 s).
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
            ->first(['id', 'role', 'joined_at', 'left_at', 'last_seen_at', 'hand_raised_at']);

        if ($me && $me->left_at === null && $class->isLive()
            && ($me->last_seen_at === null || $me->last_seen_at->lt(now()->subSeconds(LiveClassParticipant::HEARTBEAT_SECONDS)))) {
            LiveClassParticipant::query()->whereKey($me->id)->update(['last_seen_at' => now()]);
        }

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
            // The teacher's view is never more than a poll behind.
            $state['participants_count'] = $class->activeParticipantsCount();
        }

        return $state;
    }

    /** @return list<array{user_id:int,name:string|null,raised_at:string|null}> */
    public function handsRaised(LiveClass $class): array
    {
        return LiveClassParticipant::query()
            ->where('live_class_id', $class->id)
            ->active()
            ->whereNotNull('hand_raised_at')
            ->with('user:id,name,avatar')
            ->orderBy('hand_raised_at')
            ->limit(200)
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
