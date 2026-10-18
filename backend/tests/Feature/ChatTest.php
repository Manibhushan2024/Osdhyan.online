<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\TuitionRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    /** A matched tuition relationship between a student and a teacher. */
    private function matched(User $student, User $teacher): TuitionRequest
    {
        return TuitionRequest::create([
            'student_id'          => $student->id,
            'type'                => 'requirement',
            'subject'             => 'Mathematics',
            'mode'                => 'online',
            'status'              => 'matched',
            'selected_teacher_id' => $teacher->id,
        ]);
    }

    public function test_unrelated_users_cannot_open_a_conversation(): void
    {
        $other = $this->student();
        $this->actingAsStudent();

        $this->postJson('/api/conversations', ['user_id' => $other->id])->assertStatus(403);
        $this->postJson('/api/conversations', ['user_id' => 999999])->assertStatus(422);
        $this->assertSame(0, Conversation::count());
    }

    public function test_matched_users_and_admins_can_open_a_conversation(): void
    {
        $student = $this->student();
        $teacher = $this->student(['role' => 'teacher']);
        $this->matched($student, $teacher);

        Sanctum::actingAs($teacher); // either side may start it
        $res = $this->postJson('/api/conversations', ['user_id' => $student->id])->assertStatus(201);
        $id = $res->json('conversation.id');
        $this->assertSame($student->id, $res->json('conversation.other.id'));
        $this->assertArrayNotHasKey('email', $res->json('conversation.other'));

        // Idempotent: same pair → same conversation.
        $this->assertSame($id, $this->postJson('/api/conversations', ['user_id' => $student->id])->json('conversation.id'));

        $admin = $this->admin();
        Sanctum::actingAs($admin);
        $this->postJson('/api/conversations', ['user_id' => $student->id])->assertStatus(201);
    }

    public function test_participants_can_message_and_after_id_returns_ascending_new_messages(): void
    {
        $student = $this->student();
        $teacher = $this->student(['role' => 'teacher']);
        $this->matched($student, $teacher);
        $c = Conversation::openDirect($student->id, $teacher->id);

        $this->actingAsStudent($student);
        $m1 = $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'Hello'])->assertStatus(201)->json('message.id');
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => ''])->assertStatus(422);
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => str_repeat('x', 2001)])->assertStatus(422);

        Sanctum::actingAs($teacher);
        $m2 = $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'Hi there'])->assertStatus(201)->json('message.id');
        $m3 = $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'When do you want to start?'])->json('message.id');

        $all = $this->getJson("/api/conversations/{$c->id}/messages")->assertOk()->json('data');
        $this->assertSame([$m1, $m2, $m3], array_column($all, 'id'));

        $after = $this->getJson("/api/conversations/{$c->id}/messages?after={$m1}")->assertOk()->json('data');
        $this->assertSame([$m2, $m3], array_column($after, 'id'));
        $this->assertSame('Hi there', $after[0]['body']);

        $limited = $this->getJson("/api/conversations/{$c->id}/messages?limit=2")->json('data');
        $this->assertSame([$m2, $m3], array_column($limited, 'id'));
    }

    public function test_unread_counts_and_read_receipts(): void
    {
        $student = $this->student();
        $teacher = $this->student(['role' => 'teacher']);
        $this->matched($student, $teacher);
        $c = Conversation::openDirect($student->id, $teacher->id);

        Sanctum::actingAs($teacher);
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'One']);
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'Two']);
        // Sender's own messages are not unread for the sender.
        $this->assertSame(0, $this->getJson('/api/conversations')->json('data.0.unread_count'));

        $this->actingAsStudent($student);
        $list = $this->getJson('/api/conversations')->assertOk();
        $this->assertSame(2, $list->json('data.0.unread_count'));
        $this->assertSame(2, $list->json('unread_total'));
        $this->assertSame('Two', $list->json('data.0.last_message.body'));
        $this->assertSame($teacher->id, $list->json('data.0.other.id'));

        $this->postJson("/api/conversations/{$c->id}/read")->assertOk();
        $this->assertSame(0, $this->getJson('/api/conversations')->json('data.0.unread_count'));

        Sanctum::actingAs($teacher);
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'Three']);
        $this->actingAsStudent($student);
        $this->assertSame(1, $this->getJson('/api/conversations')->json('data.0.unread_count'));
    }

    public function test_non_participant_gets_403(): void
    {
        $student = $this->student();
        $teacher = $this->student(['role' => 'teacher']);
        $this->matched($student, $teacher);
        $c = Conversation::openDirect($student->id, $teacher->id);

        $this->actingAsStudent(); // stranger
        $this->getJson("/api/conversations/{$c->id}")->assertStatus(403);
        $this->getJson("/api/conversations/{$c->id}/messages")->assertStatus(403);
        $this->postJson("/api/conversations/{$c->id}/messages", ['body' => 'Sneaky'])->assertStatus(403);
        $this->postJson("/api/conversations/{$c->id}/read")->assertStatus(403);
        $this->assertCount(0, $this->getJson('/api/conversations')->json('data'));
    }

    public function test_requires_auth(): void
    {
        $this->getJson('/api/conversations')->assertStatus(401);
    }
}
