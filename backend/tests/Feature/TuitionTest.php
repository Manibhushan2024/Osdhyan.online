<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\TeacherProfile;
use App\Models\TuitionProposal;
use App\Models\TuitionRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class TuitionTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    /** A teacher account with a profile; verified unless told otherwise. */
    private function teacher(array $profile = [], bool $verified = true): User
    {
        $user = $this->student(['role' => 'teacher', 'name' => 'Teacher ' . uniqid()]);
        TeacherProfile::create(array_merge([
            'user_id'       => $user->id,
            'headline'      => 'Maths tutor',
            'subjects'      => ['Mathematics'],
            'exams'         => ['Class 10'],
            'teaching_mode' => 'both',
            'city'          => 'Patna',
            'fee_per_hour'  => 400,
            'verified_at'   => $verified ? now() : null,
        ], $profile));

        return $user;
    }

    private function requirement(User $student, array $attrs = []): TuitionRequest
    {
        return TuitionRequest::create(array_merge([
            'student_id' => $student->id,
            'type'       => 'requirement',
            'subject'    => 'Mathematics',
            'exam'       => 'Class 10',
            'mode'       => 'home',
            'city'       => 'Patna',
            'status'     => 'open',
        ], $attrs));
    }

    // ─── Registration ────────────────────────────────────────────────────────

    public function test_register_with_role_teacher_sets_role(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'name'                  => 'New Teacher',
            'email'                 => 'teach@example.test',
            'phone'                 => '9876543210',
            'password'              => 'Secret@123',
            'password_confirmation' => 'Secret@123',
            'role'                  => 'teacher',
        ])->assertOk();

        $this->assertSame('teacher', $res->json('user.role'));
        $this->assertSame('teacher', User::where('email', 'teach@example.test')->value('role'));
    }

    public function test_register_rejects_unknown_role(): void
    {
        $this->postJson('/api/auth/register', [
            'name'                  => 'X',
            'email'                 => 'x@example.test',
            'phone'                 => '9876543211',
            'password'              => 'Secret@123',
            'password_confirmation' => 'Secret@123',
            'role'                  => 'admin',
        ])->assertStatus(422);
    }

    public function test_student_can_upgrade_to_teacher_via_teacher_register(): void
    {
        $student = $this->actingAsStudent();

        $res = $this->postJson('/api/teacher/register', [
            'headline'      => 'Physics for JEE',
            'subjects'      => ['Physics', ' physics ', 'Chemistry'],
            'exams'         => ['JEE'],
            'teaching_mode' => 'online',
            'fee_per_hour'  => 500,
        ])->assertStatus(201);

        $this->assertSame('teacher', $student->fresh()->role);
        $this->assertSame('pending', $res->json('profile.verification_status'));
        $this->assertSame(['Physics', 'Chemistry'], $res->json('profile.subjects'));
        $this->assertArrayNotHasKey('email', $res->json('profile'));
    }

    // ─── Directory ───────────────────────────────────────────────────────────

    public function test_unverified_teacher_is_not_listed_and_cannot_propose(): void
    {
        $verified = $this->teacher();
        $pending = $this->teacher([], verified: false);
        $student = $this->student();
        $req = $this->requirement($student);

        $this->actingAsStudent($student);
        $ids = collect($this->getJson('/api/tuition/teachers')->assertOk()->json('data'))->pluck('user_id');
        $this->assertTrue($ids->contains($verified->id));
        $this->assertFalse($ids->contains($pending->id));

        $this->getJson('/api/tuition/teachers/' . TeacherProfile::where('user_id', $pending->id)->value('id'))
            ->assertStatus(404);

        Sanctum::actingAs($pending);
        $this->getJson('/api/tuition/leads')->assertStatus(403);
        $this->postJson("/api/tuition/requests/{$req->id}/proposals", ['message' => 'Hi', 'fee_per_hour' => 300])
            ->assertStatus(403);
    }

    public function test_teacher_search_never_exposes_contact_info_and_filters(): void
    {
        $this->teacher(['subjects' => ['Mathematics'], 'city' => 'Patna', 'teaching_mode' => 'home']);
        $this->teacher(['subjects' => ['History'], 'city' => 'Delhi', 'teaching_mode' => 'online']);
        $this->actingAsStudent();

        $res = $this->getJson('/api/tuition/teachers')->assertOk();
        $this->assertCount(2, $res->json('data'));
        $json = json_encode($res->json());
        $this->assertStringNotContainsString('@example.test', $json);
        $this->assertStringNotContainsString('"phone"', $json);
        $this->assertStringNotContainsString('"email"', $json);

        $this->assertCount(1, $this->getJson('/api/tuition/teachers?subject=mathematics')->json('data'));
        $this->assertCount(1, $this->getJson('/api/tuition/teachers?city=delhi')->json('data'));
        $this->assertCount(1, $this->getJson('/api/tuition/teachers?mode=online')->json('data'));
        $this->assertCount(0, $this->getJson('/api/tuition/teachers?subject=Biology')->json('data'));
    }

    public function test_student_can_contact_teacher_and_gets_conversation(): void
    {
        $teacher = $this->teacher();
        $profileId = TeacherProfile::where('user_id', $teacher->id)->value('id');
        $student = $this->actingAsStudent();

        $res = $this->postJson("/api/tuition/teachers/{$profileId}/contact", ['message' => 'Hello, are you free on weekends?'])
            ->assertStatus(201);

        $conversationId = $res->json('conversation_id');
        $this->assertNotNull($conversationId);
        $this->assertDatabaseHas('tuition_requests', [
            'student_id'          => $student->id,
            'selected_teacher_id' => $teacher->id,
            'type'                => 'direct',
            'status'              => 'matched',
        ]);
        $this->assertTrue(Conversation::find($conversationId)->hasParticipant($teacher->id));

        // Second contact reuses the same conversation.
        $again = $this->postJson("/api/tuition/teachers/{$profileId}/contact")->assertStatus(201);
        $this->assertSame($conversationId, $again->json('conversation_id'));
        $this->assertSame(1, TuitionRequest::where('student_id', $student->id)->count());
    }

    // ─── Requirements + leads ────────────────────────────────────────────────

    public function test_student_posts_requirement_and_validation(): void
    {
        $this->actingAsStudent();

        $this->postJson('/api/tuition/requests', ['subject' => 'Maths', 'mode' => 'home'])
            ->assertStatus(422); // city required unless online

        $res = $this->postJson('/api/tuition/requests', [
            'subject'         => 'Mathematics',
            'exam'            => 'Class 10',
            'mode'            => 'home',
            'city'            => 'Patna',
            'budget_per_hour' => 300,
        ])->assertStatus(201);

        $this->assertSame('open', $res->json('request.status'));
        $this->assertCount(1, $this->getJson('/api/tuition/requests/mine')->assertOk()->json('data'));
    }

    public function test_leads_only_match_same_city_or_online_and_overlapping_subject(): void
    {
        $student = $this->student();
        $patnaMaths = $this->requirement($student, ['subject' => 'Mathematics', 'city' => 'Patna', 'mode' => 'home']);
        $delhiMaths = $this->requirement($student, ['subject' => 'Mathematics', 'city' => 'Delhi', 'mode' => 'home']);
        $onlineMaths = $this->requirement($student, ['subject' => 'Mathematics', 'city' => null, 'mode' => 'online']);
        $patnaHistory = $this->requirement($student, ['subject' => 'History', 'exam' => 'BPSC', 'city' => 'Patna', 'mode' => 'home']);

        // Home-only maths teacher in Patna.
        $teacher = $this->teacher(['subjects' => ['mathematics'], 'exams' => [], 'city' => 'patna', 'teaching_mode' => 'home']);
        Sanctum::actingAs($teacher);
        $ids = collect($this->getJson('/api/tuition/leads')->assertOk()->json('data'))->pluck('id');
        $this->assertEqualsCanonicalizing([$patnaMaths->id], $ids->all());

        // Online-only maths teacher sees the online lead only.
        $online = $this->teacher(['subjects' => ['Mathematics'], 'exams' => [], 'city' => 'Mumbai', 'teaching_mode' => 'online']);
        Sanctum::actingAs($online);
        $ids = collect($this->getJson('/api/tuition/leads')->json('data'))->pluck('id');
        $this->assertEqualsCanonicalizing([$onlineMaths->id], $ids->all());

        // Exam overlap (BPSC) counts as a match too.
        $bpsc = $this->teacher(['subjects' => ['Polity'], 'exams' => ['BPSC'], 'city' => 'Patna', 'teaching_mode' => 'both']);
        Sanctum::actingAs($bpsc);
        $ids = collect($this->getJson('/api/tuition/leads')->json('data'))->pluck('id');
        $this->assertEqualsCanonicalizing([$patnaHistory->id], $ids->all());
        $this->assertFalse($ids->contains($delhiMaths->id));

        // Leads never carry the student's email/phone.
        $json = json_encode($this->getJson('/api/tuition/leads')->json());
        $this->assertStringNotContainsString('@example.test', $json);
    }

    public function test_teacher_does_not_see_own_requirement_as_lead(): void
    {
        $teacher = $this->teacher();
        $this->requirement($teacher);
        Sanctum::actingAs($teacher);
        $this->assertCount(0, $this->getJson('/api/tuition/leads')->json('data'));
    }

    public function test_student_cannot_access_teacher_endpoints(): void
    {
        $this->actingAsStudent();
        $this->getJson('/api/tuition/leads')->assertStatus(403);
        $this->getJson('/api/tuition/proposals/mine')->assertStatus(403);
    }

    // ─── Proposals ───────────────────────────────────────────────────────────

    public function test_one_proposal_per_request_and_non_matching_rejected(): void
    {
        $student = $this->student();
        $req = $this->requirement($student);
        $teacher = $this->teacher();
        Sanctum::actingAs($teacher);

        $this->postJson("/api/tuition/requests/{$req->id}/proposals", ['message' => 'I can help', 'fee_per_hour' => 350])
            ->assertStatus(201);
        $this->postJson("/api/tuition/requests/{$req->id}/proposals", ['message' => 'Again', 'fee_per_hour' => 300])
            ->assertStatus(422);
        $this->postJson("/api/tuition/requests/{$req->id}/proposals", ['message' => '', 'fee_per_hour' => -1])
            ->assertStatus(422);

        $other = $this->requirement($student, ['subject' => 'Biology', 'exam' => 'NEET']);
        $this->postJson("/api/tuition/requests/{$other->id}/proposals", ['message' => 'Hi', 'fee_per_hour' => 300])
            ->assertStatus(403);

        $mine = $this->getJson('/api/tuition/proposals/mine')->assertOk()->json('data');
        $this->assertCount(1, $mine);
        $this->assertSame('pending', $mine[0]['status']);
    }

    public function test_accept_matches_request_rejects_others_and_opens_conversation(): void
    {
        $student = $this->student();
        $req = $this->requirement($student);
        $t1 = $this->teacher();
        $t2 = $this->teacher();
        $p1 = TuitionProposal::create(['tuition_request_id' => $req->id, 'teacher_id' => $t1->id, 'message' => 'A', 'fee_per_hour' => 300]);
        $p2 = TuitionProposal::create(['tuition_request_id' => $req->id, 'teacher_id' => $t2->id, 'message' => 'B', 'fee_per_hour' => 320]);

        // Student sees proposals with teacher names but no contact info.
        $this->actingAsStudent($student);
        $shown = $this->getJson("/api/tuition/requests/{$req->id}")->assertOk();
        $this->assertCount(2, $shown->json('request.proposals'));
        $this->assertStringNotContainsString('@example.test', json_encode($shown->json()));

        $res = $this->postJson("/api/tuition/requests/{$req->id}/proposals/{$p1->id}/accept")->assertOk();
        $conversationId = $res->json('conversation_id');

        $req->refresh();
        $this->assertSame('matched', $req->status);
        $this->assertSame($t1->id, $req->selected_teacher_id);
        $this->assertSame($conversationId, $req->conversation_id);
        $this->assertSame('accepted', $p1->fresh()->status);
        $this->assertSame('rejected', $p2->fresh()->status);

        $conversation = Conversation::findOrFail($conversationId);
        $this->assertTrue($conversation->hasParticipant($student->id));
        $this->assertTrue($conversation->hasParticipant($t1->id));
        $this->assertFalse($conversation->hasParticipant($t2->id));
        $this->assertSame(TuitionRequest::class, $conversation->subject_type);

        // Can't accept twice / accept a rejected one.
        $this->postJson("/api/tuition/requests/{$req->id}/proposals/{$p2->id}/accept")->assertStatus(422);

        // Selected teacher can view the request and gets the conversation id.
        Sanctum::actingAs($t1);
        $view = $this->getJson("/api/tuition/requests/{$req->id}")->assertOk();
        $this->assertSame($conversationId, $view->json('request.conversation_id'));
        $this->assertTrue($view->json('request.is_selected'));
    }

    public function test_non_owner_cannot_accept_or_close(): void
    {
        $student = $this->student();
        $req = $this->requirement($student);
        $teacher = $this->teacher();
        $p = TuitionProposal::create(['tuition_request_id' => $req->id, 'teacher_id' => $teacher->id, 'message' => 'A', 'fee_per_hour' => 300]);

        $this->actingAsStudent(); // a different student
        $this->postJson("/api/tuition/requests/{$req->id}/proposals/{$p->id}/accept")->assertStatus(403);
        $this->getJson("/api/tuition/requests/{$req->id}")->assertStatus(403);
        $this->postJson("/api/tuition/requests/{$req->id}/close")->assertStatus(404);

        Sanctum::actingAs($teacher);
        $this->postJson("/api/tuition/requests/{$req->id}/proposals/{$p->id}/accept")->assertStatus(403);

        $this->assertSame('open', $req->fresh()->status);
        $this->assertSame('pending', $p->fresh()->status);
    }

    public function test_close_rejects_pending_proposals(): void
    {
        $student = $this->student();
        $req = $this->requirement($student);
        $teacher = $this->teacher();
        $p = TuitionProposal::create(['tuition_request_id' => $req->id, 'teacher_id' => $teacher->id, 'message' => 'A', 'fee_per_hour' => 300]);

        $this->actingAsStudent($student);
        $this->postJson("/api/tuition/requests/{$req->id}/close")->assertOk();
        $this->assertSame('closed', $req->fresh()->status);
        $this->assertSame('rejected', $p->fresh()->status);

        Sanctum::actingAs($teacher);
        $this->assertCount(0, $this->getJson('/api/tuition/leads')->json('data'));
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    public function test_admin_verifies_and_unverifies_teachers(): void
    {
        $pending = $this->teacher([], verified: false);
        $profileId = TeacherProfile::where('user_id', $pending->id)->value('id');

        $this->actingAsStudent();
        $this->getJson('/api/admin/teachers')->assertStatus(403);

        Sanctum::actingAs($this->admin('editor'));
        $list = $this->getJson('/api/admin/teachers?status=pending')->assertOk();
        $this->assertSame([$profileId], collect($list->json('data'))->pluck('id')->all());

        $this->postJson("/api/admin/teachers/{$profileId}/verify")->assertOk();
        $this->assertNotNull(TeacherProfile::find($profileId)->verified_at);
        $this->assertCount(0, $this->getJson('/api/admin/teachers?status=pending')->json('data'));
        $this->assertCount(1, $this->getJson('/api/admin/teachers?status=verified')->json('data'));

        $this->postJson("/api/admin/teachers/{$profileId}/unverify")->assertOk();
        $this->assertNull(TeacherProfile::find($profileId)->verified_at);
    }
}
