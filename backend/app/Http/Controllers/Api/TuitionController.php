<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TeacherProfile;
use App\Models\TuitionProposal;
use App\Models\TuitionRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Home / online tuition marketplace.
 *
 * Revenue hooks (not billed yet — see TODOs): the platform keeps every
 * student–teacher contact inside chat, so a lead fee can be charged when a
 * teacher sends a proposal or a student contacts a teacher directly, and a
 * commission can be taken on acceptance. Contact details are never exposed.
 */
class TuitionController extends Controller
{
    /** Public user columns only — email/phone must never leave the API here. */
    private const USER_PUBLIC = ['id', 'name', 'avatar'];

    private function teacherProfileFor(User $user): ?TeacherProfile
    {
        return TeacherProfile::where('user_id', $user->id)->first();
    }

    // ─── Teacher directory ───────────────────────────────────────────────────

    /** GET /tuition/teachers?subject=&city=&mode=&exam=&page= */
    public function teachers(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:60',
            'exam'    => 'nullable|string|max:60',
            'city'    => 'nullable|string|max:100',
            'mode'    => ['nullable', Rule::in(TeacherProfile::MODES)],
            'page'    => 'nullable|integer|min:1',
        ]);

        $query = TeacherProfile::listed()
            ->with(['user' => fn ($q) => $q->select(self::USER_PUBLIC)])
            ->orderByDesc('verified_at');

        if (!empty($validated['subject'])) {
            $query->whereTag('subjects', $validated['subject']);
        }
        if (!empty($validated['exam'])) {
            $query->whereTag('exams', $validated['exam']);
        }
        if (!empty($validated['city'])) {
            $query->whereRaw('LOWER(city) = ?', [mb_strtolower(trim($validated['city']))]);
        }
        if (!empty($validated['mode']) && $validated['mode'] !== TeacherProfile::MODE_BOTH) {
            $query->whereIn('teaching_mode', [$validated['mode'], TeacherProfile::MODE_BOTH]);
        }

        $page = $query->paginate(12);

        return response()->json([
            'data'         => collect($page->items())->map(fn (TeacherProfile $p) => $p->toPublicArray())->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'total'        => $page->total(),
        ]);
    }

    /** GET /tuition/teachers/{id} — public profile (verified only). */
    public function teacher(Request $request, int $id)
    {
        $profile = TeacherProfile::listed()
            ->with(['user' => fn ($q) => $q->select(self::USER_PUBLIC)])
            ->findOrFail($id);

        $me = $request->user();
        $existing = Conversation::directBetween($me->id, $profile->user_id);

        return response()->json([
            'teacher'         => $profile->toPublicArray(),
            'conversation_id' => $existing?->id,
        ]);
    }

    /**
     * POST /tuition/teachers/{id}/contact — student contacts a verified
     * teacher from the directory: creates a `direct` request (already
     * matched) and opens the conversation.
     */
    public function contact(Request $request, int $id)
    {
        $me = $request->user();
        $profile = TeacherProfile::listed()->findOrFail($id);

        if ($profile->user_id === $me->id) {
            return response()->json(['message' => 'You cannot contact yourself.'], 422);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:' . Message::MAX_LENGTH,
            'subject' => 'nullable|string|max:100',
        ]);

        $result = DB::transaction(function () use ($me, $profile, $validated) {
            $tuitionRequest = TuitionRequest::where('student_id', $me->id)
                ->where('selected_teacher_id', $profile->user_id)
                ->where('type', TuitionRequest::TYPE_DIRECT)
                ->first();

            if (!$tuitionRequest) {
                $tuitionRequest = TuitionRequest::create([
                    'student_id'          => $me->id,
                    'type'                => TuitionRequest::TYPE_DIRECT,
                    'subject'             => $validated['subject'] ?? ($profile->subjects[0] ?? 'General'),
                    'mode'                => $profile->teaching_mode,
                    'city'                => $profile->city,
                    'status'              => TuitionRequest::STATUS_MATCHED,
                    'selected_teacher_id' => $profile->user_id,
                ]);
                // TODO(revenue): config('tuition.lead_fee') — charge/record a lead
                // against the teacher here when direct contact billing goes live.
            }

            $conversation = Conversation::openDirect($me->id, $profile->user_id, $tuitionRequest);
            if (!$tuitionRequest->conversation_id) {
                $tuitionRequest->forceFill(['conversation_id' => $conversation->id])->save();
            }

            if (!empty($validated['message'])) {
                $conversation->messages()->create(['sender_id' => $me->id, 'body' => $validated['message']]);
                $conversation->forceFill(['last_message_at' => now()])->save();
                $conversation->markReadBy($me->id);
            }

            return [$tuitionRequest, $conversation];
        });

        [$tuitionRequest, $conversation] = $result;

        return response()->json([
            'message'         => 'Conversation opened.',
            'request_id'      => $tuitionRequest->id,
            'conversation_id' => $conversation->id,
        ], 201);
    }

    // ─── Student requirements ────────────────────────────────────────────────

    private function requestRules(): array
    {
        return [
            'subject'          => 'required|string|max:100',
            'exam'             => 'nullable|string|max:100',
            'mode'             => ['required', Rule::in(TeacherProfile::MODES)],
            'city'             => 'nullable|string|max:100|required_unless:mode,online',
            'area'             => 'nullable|string|max:100',
            'budget_per_hour'  => 'nullable|integer|min:0|max:100000',
            'preferred_timing' => 'nullable|string|max:150',
            'description'      => 'nullable|string|max:2000',
        ];
    }

    private function presentRequestForOwner(TuitionRequest $r): array
    {
        $proposals = $r->proposals()->with(['teacher' => fn ($q) => $q->select(self::USER_PUBLIC)])->orderBy('id')->get();
        $profiles = TeacherProfile::whereIn('user_id', $proposals->pluck('teacher_id'))->get()->keyBy('user_id');

        return [
            'id'                  => $r->id,
            'type'                => $r->type,
            'subject'             => $r->subject,
            'exam'                => $r->exam,
            'mode'                => $r->mode,
            'city'                => $r->city,
            'area'                => $r->area,
            'budget_per_hour'     => $r->budget_per_hour,
            'preferred_timing'    => $r->preferred_timing,
            'description'         => $r->description,
            'status'              => $r->status,
            'selected_teacher_id' => $r->selected_teacher_id,
            'selected_teacher'    => $r->selected_teacher_id
                ? User::select(self::USER_PUBLIC)->find($r->selected_teacher_id)
                : null,
            'conversation_id'     => $r->conversation_id,
            'proposals_count'     => $proposals->count(),
            'proposals'           => $proposals->map(fn (TuitionProposal $p) => $p->toStudentArray($profiles->get($p->teacher_id)))->values(),
            'created_at'          => $r->created_at?->toISOString(),
        ];
    }

    /** POST /tuition/requests */
    public function storeRequest(Request $request)
    {
        $me = $request->user();
        $validated = $request->validate($this->requestRules());

        $openCount = TuitionRequest::where('student_id', $me->id)->openRequirements()->count();
        if ($openCount >= 5) {
            return response()->json(['message' => 'You already have 5 open requirements. Close one before posting another.'], 422);
        }

        $tuitionRequest = TuitionRequest::create(array_merge($validated, [
            'student_id' => $me->id,
            'type'       => TuitionRequest::TYPE_REQUIREMENT,
            'status'     => TuitionRequest::STATUS_OPEN,
            'subject'    => trim($validated['subject']),
            'exam'       => isset($validated['exam']) ? trim($validated['exam']) : null,
            'city'       => isset($validated['city']) ? trim($validated['city']) : null,
        ]));

        return response()->json([
            'message' => 'Requirement posted. Matching teachers will send you proposals.',
            'request' => $this->presentRequestForOwner($tuitionRequest),
        ], 201);
    }

    /** GET /tuition/requests/mine */
    public function myRequests(Request $request)
    {
        $page = TuitionRequest::where('student_id', $request->user()->id)
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'data'         => collect($page->items())->map(fn (TuitionRequest $r) => $this->presentRequestForOwner($r))->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'total'        => $page->total(),
        ]);
    }

    /** GET /tuition/requests/{id} — owner, or a teacher who proposed / was selected. */
    public function showRequest(Request $request, int $id)
    {
        $me = $request->user();
        $r = TuitionRequest::findOrFail($id);

        if ($r->student_id === $me->id || $me->isAdminUser()) {
            return response()->json(['request' => $this->presentRequestForOwner($r)]);
        }

        $proposal = TuitionProposal::where('tuition_request_id', $r->id)->where('teacher_id', $me->id)->first();
        if (!$proposal && $r->selected_teacher_id !== $me->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $r->load(['student' => fn ($q) => $q->select(self::USER_PUBLIC)]);

        return response()->json([
            'request'         => $r->toLeadArray() + [
                'is_selected'     => $r->selected_teacher_id === $me->id,
                'conversation_id' => $r->selected_teacher_id === $me->id ? $r->conversation_id : null,
            ],
            'my_proposal'     => $proposal?->only(['id', 'message', 'fee_per_hour', 'status', 'created_at']),
        ]);
    }

    /** POST /tuition/requests/{id}/close */
    public function closeRequest(Request $request, int $id)
    {
        $r = TuitionRequest::where('student_id', $request->user()->id)->findOrFail($id);
        if ($r->status === TuitionRequest::STATUS_CLOSED) {
            return response()->json(['message' => 'Already closed.', 'request' => $this->presentRequestForOwner($r)]);
        }

        DB::transaction(function () use ($r) {
            $r->forceFill(['status' => TuitionRequest::STATUS_CLOSED])->save();
            $r->proposals()->where('status', TuitionProposal::STATUS_PENDING)
                ->update(['status' => TuitionProposal::STATUS_REJECTED]);
        });

        return response()->json(['message' => 'Requirement closed.', 'request' => $this->presentRequestForOwner($r)]);
    }

    /** POST /tuition/requests/{id}/proposals/{p}/accept — student owner. */
    public function acceptProposal(Request $request, int $id, int $proposalId)
    {
        $me = $request->user();
        $r = TuitionRequest::findOrFail($id);
        if ($r->student_id !== $me->id) {
            return response()->json(['message' => 'Only the student who posted this requirement can accept a proposal.'], 403);
        }
        if (!$r->isOpen()) {
            return response()->json(['message' => 'This requirement is no longer open.'], 422);
        }

        $proposal = TuitionProposal::where('tuition_request_id', $r->id)->findOrFail($proposalId);
        if ($proposal->status !== TuitionProposal::STATUS_PENDING) {
            return response()->json(['message' => 'This proposal is no longer pending.'], 422);
        }

        $conversation = DB::transaction(function () use ($r, $proposal, $me) {
            $proposal->forceFill(['status' => TuitionProposal::STATUS_ACCEPTED])->save();
            TuitionProposal::where('tuition_request_id', $r->id)
                ->where('id', '!=', $proposal->id)
                ->update(['status' => TuitionProposal::STATUS_REJECTED]);

            $conversation = Conversation::openDirect($me->id, $proposal->teacher_id, $r);

            $r->forceFill([
                'status'              => TuitionRequest::STATUS_MATCHED,
                'selected_teacher_id' => $proposal->teacher_id,
                'conversation_id'     => $conversation->id,
            ])->save();

            // TODO(revenue): config('tuition.commission_pct') — record the
            // agreed fee_per_hour and a commission ledger entry here once
            // payments are wired in. No billing today.

            return $conversation;
        });

        return response()->json([
            'message'         => 'Proposal accepted. You can now chat with the teacher.',
            'conversation_id' => $conversation->id,
            'request'         => $this->presentRequestForOwner($r->fresh()),
        ]);
    }

    // ─── Teacher side ────────────────────────────────────────────────────────

    /** The verified profile of the acting teacher, or a 403 response. */
    private function verifiedProfileOrFail(User $me): TeacherProfile|array
    {
        $profile = $this->teacherProfileFor($me);
        if (!$profile) {
            return ['message' => 'Create your teacher profile first.', 'status' => 403];
        }
        if (!$profile->isVerified()) {
            return ['message' => 'Your teacher profile is pending verification. Leads and proposals unlock once verified.', 'status' => 403];
        }

        return $profile;
    }

    /** GET /tuition/leads — open requirements matching the teacher's profile. */
    public function leads(Request $request)
    {
        $profile = $this->verifiedProfileOrFail($request->user());
        if (is_array($profile)) {
            return response()->json(['message' => $profile['message'], 'data' => []], $profile['status']);
        }

        $proposedIds = TuitionProposal::where('teacher_id', $profile->user_id)->pluck('tuition_request_id');

        $page = TuitionRequest::matchingTeacher($profile)
            ->with(['student' => fn ($q) => $q->select(self::USER_PUBLIC)])
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'data' => collect($page->items())->map(fn (TuitionRequest $r) => $r->toLeadArray() + [
                'already_proposed' => $proposedIds->contains($r->id),
            ])->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'total'        => $page->total(),
        ]);
    }

    /** POST /tuition/requests/{id}/proposals — teacher, one per request. */
    public function storeProposal(Request $request, int $id)
    {
        $me = $request->user();
        $profile = $this->verifiedProfileOrFail($me);
        if (is_array($profile)) {
            return response()->json(['message' => $profile['message']], $profile['status']);
        }

        $validated = $request->validate([
            'message'      => 'required|string|max:2000',
            'fee_per_hour' => 'required|integer|min:0|max:100000',
        ]);

        $r = TuitionRequest::findOrFail($id);
        if (!$r->isOpen() || $r->type !== TuitionRequest::TYPE_REQUIREMENT) {
            return response()->json(['message' => 'This requirement is not open for proposals.'], 422);
        }
        if (!$r->matchesTeacher($profile)) {
            return response()->json(['message' => 'This requirement does not match your profile (city, mode, subjects or exams).'], 403);
        }
        if (TuitionProposal::where('tuition_request_id', $r->id)->where('teacher_id', $me->id)->exists()) {
            return response()->json(['message' => 'You have already sent a proposal for this requirement.'], 422);
        }

        $proposal = TuitionProposal::create([
            'tuition_request_id' => $r->id,
            'teacher_id'         => $me->id,
            'message'            => $validated['message'],
            'fee_per_hour'       => $validated['fee_per_hour'],
            'status'             => TuitionProposal::STATUS_PENDING,
        ]);
        // TODO(revenue): config('tuition.lead_fee') — debit a lead credit from the
        // teacher's wallet here when proposal billing goes live.

        return response()->json([
            'message'  => 'Proposal sent. The student will see it in their requirements.',
            'proposal' => $proposal->only(['id', 'tuition_request_id', 'message', 'fee_per_hour', 'status', 'created_at']),
        ], 201);
    }

    /** GET /tuition/proposals/mine — teacher. */
    public function myProposals(Request $request)
    {
        $me = $request->user();

        $page = TuitionProposal::where('teacher_id', $me->id)
            ->with(['request' => fn ($q) => $q->with(['student' => fn ($s) => $s->select(self::USER_PUBLIC)])])
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'data' => collect($page->items())->map(function (TuitionProposal $p) use ($me) {
                $r = $p->request;

                return [
                    'id'              => $p->id,
                    'message'         => $p->message,
                    'fee_per_hour'    => $p->fee_per_hour,
                    'status'          => $p->status,
                    'created_at'      => $p->created_at?->toISOString(),
                    'request'         => $r?->toLeadArray(),
                    'conversation_id' => ($r && $r->selected_teacher_id === $me->id) ? $r->conversation_id : null,
                ];
            })->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'total'        => $page->total(),
        ]);
    }
}
