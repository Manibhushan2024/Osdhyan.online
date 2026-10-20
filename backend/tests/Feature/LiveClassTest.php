<?php

namespace Tests\Feature;

use App\Models\LiveClass;
use App\Models\LiveClassMessage;
use App\Models\LiveClassParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

/**
 * Live classes: scheduling, go-live, joining, chat, hands, polls.
 *
 * Decision documented here: joining a class that has not gone live yet is
 * a 403 with code=not_started (the portal shows the countdown and polls
 * `state` until status flips to live, then calls join).
 */
class LiveClassTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private const TEST_PRIVATE_KEY = <<<'PEM'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwv+DopLEAk4J+
sYl0176JxOqt9TjvjbFX0G/7kl9Y+IjtRzZdM5O+dxzNORB7L4dkXCxJtNcgjPmy
foAbGHVM9D+XG+ttX/bszRza1P9RoFSDo3RuX/rfc1jNVgO+q5h7eZqKiZVcMWVJ
IF0xBzx3LA4hE/DI7PGFxVTavaPs7jfUt6s06UOOeFN2whxGutbi1yTYdpLgIoHf
ex5Fvtb6+v2xB0QYTuRLsMHsy60OrA/zRdRCL6B11uUVpXDo9Z1wDb16aYCnAZOm
GMUf1ydrbKqZgCBSzX4yGo50PSoFnL+I44hn/SoMlAeT4EJNBe6DfJin3Uyyb5Tu
1SY/nzzXAgMBAAECggEAOx6jOw3DSr8MWhZGNPfo+qoMGU250p7hX88PdeVa0Sao
nj1AmOIknAO5dYeN1LZsIgyWn7zGbFPbPXIEpYuDyM616nRjRf1gWYquCSBPmlz3
h+SHkFe4UT+Cx4Pq0r8QzNQ69fXZKLI4/8G8iiayeeYZf8TsuDhQ/P6pSFVAXIIu
TDpwVJJAyUtWXcs0Fk47F8JHpzlU2jwOZpZWoTsMT6NZPHOqYNiZRSU4TlL9PICP
TwFCUvbmauEaL17MhqGkL/A8wUSTldBDGRuA16bzU35VX7OPvUiHmlkimKePBbr6
Izf8r8iMEx0BldpDUkBodcYieJmnL8D8aTzUk8ak0QKBgQDyzB4F7PYzBOA8sr/I
yKtfXsu4jRsnpg3NLqx7/roi491MMR88v61Wn2Hzp6iK+kvpjhPMX8zUThGEZJpy
fyIqDYzh1KgIWUGfRTrIj8WzITHW4aSZ2UQFYU97PA5rclsmywB8NkeWSfdOHjyj
aI1ynplxBSmGUejeDpHY06Ee2QKBgQC6XFYvbGz4XmIItxMV/RHkK7qdtgbg9fxc
XzDJl3NZWoPzND5qQWQ6s6XTwKS7euDe0vb+P0LFaGp/FazPPV1foUfrDpOHex8u
NHuKAi3kI7f/IEMkRhRLD7sNl819x9f3zQJDzBf67iXgvznTLo+ZQ0ynWj+l/QZt
IvprmmlLLwKBgQClYSOSJbYNSmTy805vFUCl1YwuSO8WMqVz/Ta/vuJKoas7GrqM
RoNrXWT68lh7UcIjdANIUnjSo9qKs3wAQVikDFbJ/G/4P9PTCPThaAzh1tp743aa
1MLgZ0gcSOwJg/tSkTPjZ5WbaQZqz22+YJj4Wc9qjHmcZG6Z0pLFfmFhAQKBgGpX
iGKVV3U+vmhEt6Jjf5MZFOsr1K8IDxJSy08tmgfR69ua40bUu7H3k1fK5PWKf8kG
zyRzytFE7QhJwQuc86w/Jv/NmIfFzRwbnKc66R729uahbU7Eoo3WkyGFjyAIKoff
tzwiuUhaHskptYB5YD3Ptm0Exa8dPE6ImCdQvGbHAoGAdrpMkOYptd+FWYQJsQtI
x2ikfajrnx6bl3gv+OL5DCmdpf3UIsAIVlUDMA1+ahdntFHFCZhBtiM7Qxc+UwxD
1NtPKNomA/CMLbs2luB+0FMRWLUd0+LwczMQXCLrbQSJaUZ0pxY8cRz0s0/GIG5r
q6WLEHrBWtZVmjd63fljPk8=
-----END PRIVATE KEY-----
PEM;

    /** An approved teacher (verified profile) — the only kind that may host. */
    protected function teacher(array $attributes = [], bool $approved = true): User
    {
        $user = $this->student(array_merge(['role' => 'teacher'], $attributes));
        \App\Models\TeacherProfile::create([
            'user_id'     => $user->id,
            'subjects'    => ['Computer Science'],
            'verified_at' => $approved ? now() : null,
        ]);

        return $user;
    }

    protected function as(User $user): static
    {
        Sanctum::actingAs($user);

        return $this;
    }

    protected function schedulePayload(array $overrides = []): array
    {
        return array_merge([
            'title'            => 'Polity crash course',
            'description'      => 'Fundamental rights in 60 minutes',
            'subject'          => 'Polity',
            'provider'         => 'jitsi',
            'scheduled_at'     => now()->addHour()->toISOString(),
            'duration_min'     => 60,
            'max_participants' => 0,
        ], $overrides);
    }

    /** Create a class directly in the DB owned by $teacher. */
    protected function makeClass(User $teacher, array $attributes = []): LiveClass
    {
        return LiveClass::create(array_merge([
            'teacher_id'   => $teacher->id,
            'title'        => 'History revision',
            'subject'      => 'History',
            'provider'     => 'jitsi',
            'status'       => 'scheduled',
            'scheduled_at' => now()->addMinutes(30),
        ], $attributes));
    }

    protected function liveClass(User $teacher, array $attributes = []): LiveClass
    {
        return $this->makeClass($teacher, array_merge([
            'status'        => 'live',
            'started_at'    => now(),
            'room_name'     => 'osdhyan-1-abcdefgh',
            'join_password' => 'secretpass',
        ], $attributes));
    }

    // ── Scheduling ────────────────────────────────────────────────────────────

    public function test_students_cannot_schedule_a_class(): void
    {
        $this->as($this->student())
            ->postJson('/api/live-classes', $this->schedulePayload())
            ->assertStatus(403);

        $this->assertDatabaseCount('live_classes', 0);
    }

    public function test_teacher_can_schedule_a_jitsi_class(): void
    {
        $teacher = $this->teacher();

        $res = $this->as($teacher)
            ->postJson('/api/live-classes', $this->schedulePayload())
            ->assertCreated()
            ->assertJsonPath('class.status', 'scheduled')
            ->assertJsonPath('class.provider', 'jitsi')
            ->assertJsonPath('class.teacher.id', $teacher->id);

        $this->assertDatabaseHas('live_classes', [
            'id'         => $res->json('class.id'),
            'teacher_id' => $teacher->id,
        ]);
    }

    public function test_youtube_class_requires_a_valid_url_and_stores_the_video_id(): void
    {
        $teacher = $this->teacher();

        $this->as($teacher)
            ->postJson('/api/live-classes', $this->schedulePayload(['provider' => 'youtube']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['youtube_url']);

        $this->as($teacher)
            ->postJson('/api/live-classes', $this->schedulePayload([
                'provider'    => 'youtube',
                'youtube_url' => 'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
            ]))
            ->assertCreated()
            ->assertJsonPath('class.youtube_video_id', 'dQw4w9WgXcQ');
    }

    public function test_my_classes_lists_only_the_teachers_own_classes(): void
    {
        $me = $this->teacher();
        $other = $this->teacher();
        $this->makeClass($me);
        $this->makeClass($me);
        $this->makeClass($other);

        $this->as($me)->getJson('/api/live-classes/my/classes')
            ->assertOk()
            ->assertJsonCount(2, 'classes')
            ->assertJsonStructure(['providers' => ['jitsi', 'youtube']]);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    public function test_student_cannot_go_live(): void
    {
        $class = $this->makeClass($this->teacher());

        $this->as($this->student())
            ->postJson("/api/live-classes/{$class->id}/go-live")
            ->assertStatus(403);

        $this->assertSame('scheduled', $class->fresh()->status);
    }

    public function test_go_live_generates_a_room_and_password_for_jitsi(): void
    {
        $teacher = $this->teacher();
        $class = $this->makeClass($teacher);

        $res = $this->as($teacher)
            ->postJson("/api/live-classes/{$class->id}/go-live")
            ->assertOk()
            ->assertJsonPath('class.status', 'live');

        $class->refresh();
        $this->assertSame('live', $class->status);
        $this->assertNotNull($class->started_at);
        $this->assertMatchesRegularExpression('/^osdhyan-' . $class->id . '-[a-z0-9]{8}$/', $class->room_name);
        $this->assertNotEmpty($class->join_password);
        // Owner response carries the credentials for the "join from another device" panel.
        $this->assertSame($class->room_name, $res->json('class.room_name'));
        $this->assertSame($class->join_password, $res->json('class.join_password'));
    }

    public function test_non_owner_teacher_cannot_end_or_edit_anothers_class(): void
    {
        $owner = $this->teacher();
        $intruder = $this->teacher();
        $class = $this->liveClass($owner);

        $this->as($intruder)->postJson("/api/live-classes/{$class->id}/end")->assertStatus(403);
        $this->as($intruder)->patchJson("/api/live-classes/{$class->id}", ['title' => 'Hijack'])->assertStatus(403);
        $this->as($intruder)->deleteJson("/api/live-classes/{$class->id}")->assertStatus(403);

        $this->assertSame('live', $class->fresh()->status);
    }

    public function test_admin_can_end_any_class_and_cannot_delete_a_live_one(): void
    {
        $class = $this->liveClass($this->teacher());
        $admin = $this->admin();

        $this->as($admin)->deleteJson("/api/live-classes/{$class->id}")->assertStatus(422);

        $this->as($admin)->postJson("/api/live-classes/{$class->id}/end")
            ->assertOk()
            ->assertJsonPath('class.status', 'ended');

        $this->as($admin)->deleteJson("/api/live-classes/{$class->id}")->assertOk();
        $this->assertDatabaseMissing('live_classes', ['id' => $class->id]);
    }

    public function test_ending_a_youtube_class_defaults_the_recording_to_the_video(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher, [
            'provider'         => 'youtube',
            'youtube_video_id' => 'dQw4w9WgXcQ',
            'room_name'        => null,
            'join_password'    => null,
        ]);

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/end")
            ->assertOk()
            ->assertJsonPath('class.is_recording_available', true)
            ->assertJsonPath('class.recording_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }

    // ── Joining ───────────────────────────────────────────────────────────────

    public function test_join_before_go_live_is_refused_with_not_started(): void
    {
        $class = $this->makeClass($this->teacher());

        $this->as($this->student())
            ->postJson("/api/live-classes/{$class->id}/join")
            ->assertStatus(403)
            ->assertJsonPath('code', 'not_started');

        $this->assertDatabaseCount('live_class_participants', 0);
    }

    public function test_join_after_go_live_records_participant_and_returns_provider_payload(): void
    {
        $class = $this->liveClass($this->teacher());
        $student = $this->student();

        $res = $this->as($student)
            ->postJson("/api/live-classes/{$class->id}/join")
            ->assertOk()
            ->assertJsonPath('provider.kind', 'jitsi')
            ->assertJsonPath('provider.mode', 'plain')
            ->assertJsonPath('provider.domain', 'meet.jit.si')
            ->assertJsonPath('provider.room', 'osdhyan-1-abcdefgh')
            ->assertJsonPath('provider.password', 'secretpass')
            ->assertJsonPath('provider.jwt', null)
            ->assertJsonPath('provider.is_moderator', false)
            ->assertJsonPath('state.me.joined', true);

        // No server secrets leak into the payload.
        $raw = json_encode($res->json());
        $this->assertStringNotContainsString('PRIVATE KEY', $raw);
        $this->assertStringNotContainsString('api_key', $raw);

        $this->assertDatabaseHas('live_class_participants', [
            'live_class_id' => $class->id,
            'user_id'       => $student->id,
            'role'          => 'student',
            'left_at'       => null,
        ]);

        // Re-joining is idempotent (unique(live_class_id,user_id)).
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $this->assertDatabaseCount('live_class_participants', 1);
    }

    public function test_class_teacher_joins_as_moderator(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/join")
            ->assertOk()
            ->assertJsonPath('provider.is_moderator', true)
            ->assertJsonPath('state.me.is_teacher', true);

        $this->assertDatabaseHas('live_class_participants', [
            'user_id' => $teacher->id, 'role' => 'teacher',
        ]);
    }

    public function test_jaas_join_returns_a_signed_rs256_jwt_without_the_private_key(): void
    {
        // Throwaway 2048-bit key generated for this test only (openssl_pkey_new
        // needs an openssl.cnf that Windows PHP builds often lack).
        $pem = self::TEST_PRIVATE_KEY;
        $pub = openssl_pkey_get_details(openssl_pkey_get_private($pem))['key'];

        config()->set('services.live.jaas', [
            'app_id'      => 'vpaas-magic-cookie-test',
            'api_key_id'  => 'vpaas-magic-cookie-test/abc123',
            'private_key' => $pem,
            'token_ttl'   => 3600,
        ]);

        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);

        $res = $this->as($teacher)->postJson("/api/live-classes/{$class->id}/join")
            ->assertOk()
            ->assertJsonPath('provider.mode', 'jaas')
            ->assertJsonPath('provider.domain', '8x8.vc')
            ->assertJsonPath('provider.room', 'vpaas-magic-cookie-test/osdhyan-1-abcdefgh')
            ->assertJsonPath('provider.password', null);

        $jwt = $res->json('provider.jwt');
        [$h, $p, $s] = explode('.', $jwt);
        $b64 = fn (string $x) => base64_decode(strtr($x, '-_', '+/') . str_repeat('=', (4 - strlen($x) % 4) % 4));
        $header = json_decode($b64($h), true);
        $payload = json_decode($b64($p), true);

        $this->assertSame('RS256', $header['alg']);
        $this->assertSame('vpaas-magic-cookie-test/abc123', $header['kid']);
        $this->assertSame('jitsi', $payload['aud']);
        $this->assertSame('osdhyan-1-abcdefgh', $payload['room']);
        $this->assertSame('true', $payload['context']['user']['moderator']);
        $this->assertSame($teacher->name, $payload['context']['user']['name']);
        $this->assertGreaterThan(time(), $payload['exp']);
        $this->assertSame(1, openssl_verify("{$h}.{$p}", $b64($s), $pub, OPENSSL_ALGO_SHA256));
        $this->assertStringNotContainsString('PRIVATE', json_encode($res->json()));

        // A student gets a non-moderator token.
        $sRes = $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $sPayload = json_decode($b64(explode('.', $sRes->json('provider.jwt'))[1]), true);
        $this->assertSame('false', $sPayload['context']['user']['moderator']);
    }

    public function test_join_is_refused_once_the_class_is_ended(): void
    {
        $class = $this->liveClass($this->teacher(), ['status' => 'ended', 'ended_at' => now()]);

        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")
            ->assertStatus(403)
            ->assertJsonPath('code', 'ended');
    }

    public function test_max_participants_is_enforced_for_students_but_not_the_teacher(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher, ['max_participants' => 2]);

        $a = $this->student();
        $b = $this->student();
        $this->as($a)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $this->as($b)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")
            ->assertStatus(403)
            ->assertJsonPath('code', 'full');

        // Already-joined students and the teacher are never blocked.
        $this->as($a)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        // A seat frees up when someone leaves.
        $this->as($b)->postJson("/api/live-classes/{$class->id}/leave")->assertOk();
        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")->assertOk();
    }

    // ── Listing ───────────────────────────────────────────────────────────────

    public function test_index_filters_by_status_and_is_paginated_with_teacher_and_count(): void
    {
        $teacher = $this->teacher(['name' => 'Dr. Sharma']);
        $live = $this->liveClass($teacher);
        $this->makeClass($teacher, ['status' => 'scheduled']);
        $this->makeClass($teacher, ['status' => 'ended', 'ended_at' => now(), 'recording_url' => 'https://x.test/r', 'is_recording_available' => true]);

        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$live->id}/join")->assertOk();

        $this->as($student)->getJson('/api/live-classes?status=live')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.teacher.name', 'Dr. Sharma')
            ->assertJsonPath('data.0.participants_count', 1)
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);

        $this->as($student)->getJson('/api/live-classes?status=upcoming')->assertOk()->assertJsonCount(1, 'data');
        $this->as($student)->getJson('/api/live-classes?status=ended')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recording_url', 'https://x.test/r');

        // Room credentials never appear in the public listing.
        $raw = json_encode($this->as($student)->getJson('/api/live-classes?status=live')->json());
        $this->assertStringNotContainsString('secretpass', $raw);
        $this->assertStringNotContainsString('join_password', $raw);
    }

    // ── Chat ──────────────────────────────────────────────────────────────────

    public function test_messages_are_returned_ascending_and_only_after_the_given_id(): void
    {
        $class = $this->liveClass($this->teacher());
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $ids = [];
        foreach (['one', 'two', 'three', 'four'] as $body) {
            $ids[] = $this->as($student)
                ->postJson("/api/live-classes/{$class->id}/messages", ['body' => $body])
                ->assertCreated()
                ->assertJsonPath('message.body', $body)
                ->assertJsonPath('message.user.is_teacher', false)
                ->json('message.id');
        }

        $res = $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after={$ids[1]}&limit=50")
            ->assertOk()
            ->assertJsonCount(2, 'messages')
            ->assertJsonPath('messages.0.body', 'three')
            ->assertJsonPath('messages.1.body', 'four')
            ->assertJsonPath('last_id', $ids[3]);

        $this->assertSame([$ids[2], $ids[3]], array_column($res->json('messages'), 'id'));

        // Nothing newer → empty, last_id echoes the cursor.
        $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after={$ids[3]}")
            ->assertOk()
            ->assertJsonCount(0, 'messages')
            ->assertJsonPath('last_id', $ids[3]);

        // Body limit.
        $this->as($student)
            ->postJson("/api/live-classes/{$class->id}/messages", ['body' => str_repeat('x', 1001)])
            ->assertStatus(422);
    }

    public function test_teacher_can_pin_answer_and_delete_messages_and_students_cannot(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $id = $this->as($student)->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'Doubt?'])->json('message.id');

        $this->as($student)->patchJson("/api/live-classes/{$class->id}/messages/{$id}/pin")->assertStatus(403);

        $this->as($teacher)->patchJson("/api/live-classes/{$class->id}/messages/{$id}/pin")
            ->assertOk()->assertJsonPath('message.is_pinned', true);
        $this->as($teacher)->patchJson("/api/live-classes/{$class->id}/messages/{$id}/answered")
            ->assertOk()->assertJsonPath('message.is_answered', true);

        $this->as($student)->getJson("/api/live-classes/{$class->id}/state")
            ->assertOk()
            ->assertJsonPath('pinned_messages.0.id', $id);

        $this->as($teacher)->deleteJson("/api/live-classes/{$class->id}/messages/{$id}")->assertOk();
        // Soft-deleted: hidden from chat, and listed so open chat windows drop it.
        $this->assertSoftDeleted('live_class_messages', ['id' => $id]);
        $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after=0")->assertOk()->assertJsonCount(0, 'messages');
        $this->assertContains($id, $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->json('removed_message_ids'));
    }

    // ── Hands ─────────────────────────────────────────────────────────────────

    public function test_raise_hand_shows_in_count_for_students_and_in_list_for_teacher(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $student = $this->student(['name' => 'Asha']);
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $this->as($student)->postJson("/api/live-classes/{$class->id}/raise-hand")->assertOk();

        $studentState = $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame(1, $studentState->json('hands_raised_count'));
        $this->assertTrue($studentState->json('me.hand_raised'));
        $this->assertArrayNotHasKey('hands_raised', $studentState->json());

        $this->as($teacher)->getJson("/api/live-classes/{$class->id}/state")
            ->assertOk()
            ->assertJsonPath('hands_raised.0.user_id', $student->id)
            ->assertJsonPath('hands_raised.0.name', 'Asha');

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/participants/{$student->id}/lower-hand")->assertOk();
        $this->assertSame(0, $this->as($teacher)->getJson("/api/live-classes/{$class->id}/state")->json('hands_raised_count'));
    }

    // ── Polls ─────────────────────────────────────────────────────────────────

    public function test_poll_vote_is_counted_once_and_results_appear_after_reveal(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $this->as($student)->postJson("/api/live-classes/{$class->id}/polls", ['question' => 'x', 'options' => ['a', 'b']])
            ->assertStatus(403);

        $poll = $this->as($teacher)->postJson("/api/live-classes/{$class->id}/polls", [
            'question' => 'Who wrote the Preamble?',
            'options'  => ['Nehru', 'Ambedkar', 'Patel'],
        ])->assertCreated()->json('poll');
        $this->assertSame(['a', 'b', 'c'], array_column($poll['options'], 'id'));

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/polls", ['question' => 'x', 'options' => ['a']])->assertStatus(422);

        $this->as($student)->postJson("/api/live-classes/{$class->id}/polls/{$poll['id']}/vote", ['option_id' => 'b'])->assertCreated();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/polls/{$poll['id']}/vote", ['option_id' => 'a'])->assertStatus(409);
        $this->as($student)->postJson("/api/live-classes/{$class->id}/polls/{$poll['id']}/vote", ['option_id' => 'zz'])->assertStatus(422);
        $this->assertDatabaseCount('live_class_poll_votes', 1);

        // Student: sees the open poll and their own vote, no results yet.
        $state = $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame($poll['id'], $state->json('poll.id'));
        $this->assertSame('b', $state->json('my_vote'));
        $this->assertNull($state->json('poll.results'));
        $this->assertTrue($state->json('poll.is_open'));

        // Teacher sees live results.
        $this->assertSame(1, $this->as($teacher)->getJson("/api/live-classes/{$class->id}/state")->json('poll.results.b'));

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/polls/{$poll['id']}/reveal")
            ->assertOk()->assertJsonPath('poll.is_open', false);

        $state = $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame(['a' => 0, 'b' => 1, 'c' => 0], $state->json('poll.results'));
        $this->assertNotNull($state->json('poll.revealed_at'));

        // Voting on a closed poll is refused.
        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/polls/{$poll['id']}/vote", ['option_id' => 'a'])->assertStatus(403);
    }

    // ── State ─────────────────────────────────────────────────────────────────

    public function test_state_has_the_documented_shape_and_shared_part_is_cached(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $this->as($student)->getJson("/api/live-classes/{$class->id}/state")
            ->assertOk()
            ->assertJsonStructure([
                'id', 'status', 'provider', 'started_at', 'ended_at', 'scheduled_at',
                'recording_url', 'participants_count', 'hands_raised_count',
                'pinned_messages', 'poll', 'latest_message_id', 'server_time',
                'me' => ['joined', 'hand_raised', 'is_teacher'], 'my_vote',
            ])
            ->assertJsonPath('status', 'live')
            ->assertJsonPath('participants_count', 1);

        $this->assertTrue(Cache::has("live:{$class->id}:state"));

        // A write that bypasses the controllers is invisible until the cache expires…
        LiveClassMessage::create(['live_class_id' => $class->id, 'user_id' => $student->id, 'body' => 'hi', 'is_pinned' => true]);
        $this->assertCount(0, $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->json('pinned_messages'));

        // …and visible as soon as it is cleared (which every controller mutation does).
        Cache::forget("live:{$class->id}:state");
        $this->assertCount(1, $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->json('pinned_messages'));
    }

    public function test_ending_the_class_kicks_everyone_out_and_closes_polls(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/raise-hand")->assertOk();
        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/polls", ['question' => 'q', 'options' => ['a', 'b']])->assertCreated();

        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/end", ['recording_url' => 'https://cdn.test/rec.mp4'])
            ->assertOk()
            ->assertJsonPath('class.status', 'ended')
            ->assertJsonPath('class.recording_url', 'https://cdn.test/rec.mp4');

        $state = $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame('ended', $state->json('status'));
        $this->assertSame(0, $state->json('participants_count'));
        $this->assertSame(0, $state->json('hands_raised_count'));
        $this->assertFalse($state->json('poll.is_open'));
        $this->assertSame('https://cdn.test/rec.mp4', $state->json('recording_url'));

        // Chat closes with the class; recording can still be updated later.
        $this->as($student)->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'late'])->assertStatus(403);
        $this->as($teacher)->postJson("/api/live-classes/{$class->id}/recording", ['recording_url' => 'https://cdn.test/v2.mp4'])
            ->assertOk()->assertJsonPath('class.recording_url', 'https://cdn.test/v2.mp4');
    }

    // ── Robustness (large classes) ───────────────────────────────────────────

    public function test_first_chat_load_returns_the_newest_messages_and_paging_catches_up(): void
    {
        $class = $this->liveClass($this->teacher());
        $student = $this->student();
        $now = now();
        $rows = [];
        for ($i = 1; $i <= 130; $i++) {
            $rows[] = ['live_class_id' => $class->id, 'user_id' => $student->id, 'body' => "m{$i}",
                'is_pinned' => false, 'is_answered' => false, 'created_at' => $now, 'updated_at' => $now];
        }
        LiveClassMessage::insert($rows);
        $ids = LiveClassMessage::where('live_class_id', $class->id)->orderBy('id')->pluck('id')->all();

        // A late joiner sees the current conversation, not the first lines of the class.
        $first = $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after=0&limit=50")->assertOk();
        $this->assertSame('m81', $first->json('messages.0.body'));
        $this->assertSame('m130', $first->json('messages.49.body'));
        $this->assertSame($ids[129], $first->json('last_id'));
        $this->assertSame($ids[129], $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->json('latest_message_id'));

        // Inside the cached window: served from the snapshot, has_more pages forward.
        $page = $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after={$ids[49]}&limit=50")->assertOk();
        $this->assertSame('m51', $page->json('messages.0.body'));
        $this->assertTrue($page->json('has_more'));

        // Older than the window: read from the table, still ordered and paged.
        $old = $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after={$ids[4]}&limit=10")->assertOk();
        $this->assertSame(['m6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'], array_column($old->json('messages'), 'body'));
        $this->assertTrue($old->json('has_more'));

        $done = $this->as($student)->getJson("/api/live-classes/{$class->id}/messages?after={$ids[120]}&limit=50")->assertOk();
        $this->assertCount(9, $done->json('messages'));
        $this->assertFalse($done->json('has_more'));
    }

    public function test_new_messages_and_answered_flags_reach_other_viewers_on_their_next_poll(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher);
        $a = $this->student();
        $b = $this->student();
        $this->as($b)->getJson("/api/live-classes/{$class->id}/state")->assertOk(); // warms the cache

        $id = $this->as($a)->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'Doubt in Q5'])->assertCreated()->json('message.id');

        $state = $this->as($b)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame($id, $state->json('latest_message_id'));
        $this->as($b)->getJson("/api/live-classes/{$class->id}/messages?after=0")->assertJsonPath('messages.0.id', $id);

        $this->as($teacher)->patchJson("/api/live-classes/{$class->id}/messages/{$id}/answered")->assertOk();
        $this->assertSame([$id], $this->as($b)->getJson("/api/live-classes/{$class->id}/state")->json('answered_message_ids'));

        // An open chat passes its cursor to state and gets new messages in the same response.
        $next = $this->as($a)->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'And Q6?'])->json('message.id');
        $withChat = $this->as($b)->getJson("/api/live-classes/{$class->id}/state?after={$id}")->assertOk();
        $this->assertSame([$next], array_column($withChat->json('messages'), 'id'));
        $this->assertFalse($withChat->json('messages_has_more'));
        $this->assertArrayNotHasKey('messages', $this->as($b)->getJson("/api/live-classes/{$class->id}/state")->json());
    }

    public function test_chat_is_rate_limited_per_user_with_a_friendly_message(): void
    {
        $class = $this->liveClass($this->teacher());
        $spammer = $this->student();
        for ($i = 0; $i < 20; $i++) {
            $this->as($spammer)->postJson("/api/live-classes/{$class->id}/messages", ['body' => "hi {$i}"])->assertCreated();
        }
        $this->as($spammer)->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'one more'])
            ->assertStatus(429)
            ->assertJsonPath('message', 'You are sending messages too fast. Please wait a few seconds.');

        // Other students are not affected.
        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/messages", ['body' => 'hello'])->assertCreated();
    }

    public function test_a_student_who_vanished_stops_counting_and_frees_the_seat(): void
    {
        $teacher = $this->teacher();
        $class = $this->liveClass($teacher, ['max_participants' => 1]);
        $ghost = $this->student();
        $this->as($ghost)->postJson("/api/live-classes/{$class->id}/join")->assertOk();

        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")
            ->assertStatus(403)->assertJsonPath('code', 'full');

        // Tab closed without "leave": no heartbeat for longer than the stale window.
        LiveClassParticipant::where('user_id', $ghost->id)->update([
            'last_seen_at' => now()->subSeconds(LiveClassParticipant::STALE_AFTER_SECONDS + 5),
        ]);

        $this->assertSame(0, $this->as($teacher)->getJson("/api/live-classes/{$class->id}/state")->json('participants_count'));
        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")->assertOk();
    }

    public function test_state_poll_is_the_heartbeat_and_hints_a_poll_interval(): void
    {
        $class = $this->liveClass($this->teacher());
        $student = $this->student();
        $this->as($student)->postJson("/api/live-classes/{$class->id}/join")->assertOk();
        LiveClassParticipant::where('user_id', $student->id)->update(['last_seen_at' => now()->subMinutes(2)]);

        $state = $this->as($student)->getJson("/api/live-classes/{$class->id}/state")->assertOk();
        $this->assertSame(4000, $state->json('poll_ms'));
        $this->assertTrue($state->json('me.joined'));
        $this->assertTrue(LiveClassParticipant::where('user_id', $student->id)->first()->last_seen_at->gt(now()->subSeconds(10)));
    }

    public function test_public_jitsi_is_flagged_and_youtube_is_the_default_until_jaas_is_configured(): void
    {
        $teacher = $this->teacher();
        config()->set('services.live.jitsi.domain', 'meet.jit.si');
        config()->set('services.live.jaas', []);

        $providers = $this->as($teacher)->getJson('/api/live-classes/my/classes')->assertOk()->json('providers');
        $this->assertSame('youtube', $providers['default']);
        $this->assertSame('public', $providers['jitsi']['mode']);
        $this->assertNotNull($providers['jitsi']['warning']);

        $class = $this->liveClass($teacher);
        $this->as($this->student())->postJson("/api/live-classes/{$class->id}/join")
            ->assertOk()
            ->assertJsonPath('provider.needs_host_login', true)
            ->assertJsonPath('provider.web_url', 'https://meet.jit.si/osdhyan-1-abcdefgh');
    }

    public function test_jitsi_is_the_default_once_jaas_keys_are_configured(): void
    {
        $teacher = $this->teacher();
        config()->set('services.live.jaas', [
            'app_id' => 'vpaas-magic-cookie-test', 'api_key_id' => 'vpaas-magic-cookie-test/abc', 'private_key' => self::TEST_PRIVATE_KEY,
        ]);
        $providers = $this->as($teacher)->getJson('/api/live-classes/my/classes')->assertOk()->json('providers');
        $this->assertSame('jitsi', $providers['default']);
        $this->assertSame('jaas', $providers['jitsi']['mode']);
        $this->assertNull($providers['jitsi']['warning']);
    }

    public function test_teacher_waiting_for_approval_cannot_host_and_is_told_why(): void
    {
        $pending = $this->teacher(approved: false);

        $this->as($pending)->getJson('/api/live-classes/my/classes')
            ->assertForbidden()->assertJsonPath('code', 'teacher_pending');
        $this->as($pending)->postJson('/api/live-classes', $this->schedulePayload())->assertForbidden();
    }

    public function test_approving_the_teacher_in_admin_unlocks_hosting(): void
    {
        $pending = $this->teacher(approved: false);
        $profile = \App\Models\TeacherProfile::where('user_id', $pending->id)->first();

        $this->as($this->admin())->postJson("/api/admin/teachers/{$profile->id}/verify")->assertOk();

        $this->as($pending)->postJson('/api/live-classes', $this->schedulePayload())->assertCreated();
    }

    public function test_admin_schedules_a_class_for_an_approved_teacher_and_controls_it(): void
    {
        $admin = $this->admin();
        $teacher = $this->teacher();
        $pending = $this->teacher(approved: false);

        $this->as($admin)->getJson('/api/admin/live-classes/hosts')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $teacher->id);

        $this->as($admin)->postJson('/api/live-classes', $this->schedulePayload() + ['teacher_id' => $pending->id])
            ->assertUnprocessable();

        $id = $this->as($admin)->postJson('/api/live-classes', $this->schedulePayload() + ['teacher_id' => $teacher->id])
            ->assertCreated()->json('class.id') ?? \App\Models\LiveClass::latest('id')->value('id');
        $this->assertSame($teacher->id, \App\Models\LiveClass::find($id)->teacher_id);

        // The teacher sees it in their panel; the admin can start and end it.
        $this->as($teacher)->getJson('/api/live-classes/my/classes')->assertOk()->assertJsonCount(1, 'classes');
        $this->as($admin)->postJson("/api/live-classes/{$id}/go-live")->assertOk();
        $this->as($admin)->getJson('/api/admin/live-classes')->assertOk()->assertJsonPath('data.0.status', 'live')
            ->assertJsonStructure(['data', 'providers', 'current_page', 'last_page']);
        $this->as($admin)->postJson("/api/live-classes/{$id}/end")->assertOk();
    }

    public function test_a_teacher_cannot_schedule_for_someone_else(): void
    {
        $teacher = $this->teacher();
        $other = $this->teacher();

        $this->as($teacher)->postJson('/api/live-classes', $this->schedulePayload() + ['teacher_id' => $other->id])
            ->assertUnprocessable();
    }
}
