<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeacherProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Admin verification queue for teacher profiles. */
class AdminTeacherController extends Controller
{
    private function present(TeacherProfile $profile): array
    {
        $user = $profile->user;

        return $profile->toPublicArray() + [
            // Admins may see contact details for verification calls.
            'email'      => $user?->email,
            'phone'      => $user?->phone,
            'user_city'  => $user?->city,
            'created_at' => $profile->created_at?->toISOString(),
        ];
    }

    /** GET /admin/teachers?status=pending|verified&q= */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'verified', 'all'])],
            'q'      => 'nullable|string|max:100',
            'page'   => 'nullable|integer|min:1',
        ]);

        $query = TeacherProfile::with('user')->latest('id');

        match ($validated['status'] ?? 'pending') {
            'pending'  => $query->whereNull('verified_at'),
            'verified' => $query->whereNotNull('verified_at'),
            default    => null,
        };

        if (!empty($validated['q'])) {
            $q = mb_strtolower($validated['q']);
            $query->where(function ($qq) use ($q) {
                $qq->whereRaw('LOWER(city) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(subjects) LIKE ?', ["%{$q}%"])
                    ->orWhereHas('user', fn ($u) => $u->whereRaw('LOWER(name) LIKE ?', ["%{$q}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$q}%"]));
            });
        }

        $page = $query->paginate(20);

        return response()->json([
            'data'         => collect($page->items())->map(fn (TeacherProfile $p) => $this->present($p))->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'total'        => $page->total(),
            'counts'       => [
                'pending'  => TeacherProfile::whereNull('verified_at')->count(),
                'verified' => TeacherProfile::whereNotNull('verified_at')->count(),
            ],
        ]);
    }

    /** POST /admin/teachers/{id}/verify */
    public function verify(Request $request, int $id)
    {
        $profile = TeacherProfile::with('user')->findOrFail($id);
        $profile->forceFill(['verified_at' => now(), 'verified_by' => $request->user()->id])->save();

        return response()->json(['message' => 'Teacher verified.', 'teacher' => $this->present($profile)]);
    }

    /** POST /admin/teachers/{id}/unverify */
    public function unverify(Request $request, int $id)
    {
        $profile = TeacherProfile::with('user')->findOrFail($id);
        $profile->forceFill(['verified_at' => null, 'verified_by' => null])->save();

        return response()->json(['message' => 'Teacher verification removed.', 'teacher' => $this->present($profile)]);
    }
}
