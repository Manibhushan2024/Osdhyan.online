<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** A teacher's own profile: onboarding, read, update. */
class TeacherProfileController extends Controller
{
    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'nullable';

        return [
            'headline'         => "{$req}|string|max:150",
            'bio'              => "{$req}|string|max:3000",
            'subjects'         => "{$req}|array|max:20",
            'subjects.*'       => 'string|max:60',
            'exams'            => "{$req}|array|max:20",
            'exams.*'          => 'string|max:60',
            'teaching_mode'    => [$req, Rule::in(TeacherProfile::MODES)],
            'city'             => "{$req}|string|max:100",
            'areas'            => "{$req}|array|max:20",
            'areas.*'          => 'string|max:60',
            'fee_per_hour'     => "{$req}|integer|min:0|max:100000",
            'experience_years' => "{$req}|integer|min:0|max:60",
            'qualifications'   => "{$req}|string|max:255",
            'languages'        => "{$req}|array|max:10",
            'languages.*'      => 'string|max:40',
            'availability'     => "{$req}|string|max:500",
            'is_available'     => "{$req}|boolean",
        ];
    }

    private function profileAttributes(array $validated): array
    {
        $attrs = [];
        foreach (['headline', 'bio', 'teaching_mode', 'city', 'fee_per_hour', 'experience_years', 'qualifications', 'availability', 'is_available'] as $key) {
            if (array_key_exists($key, $validated)) {
                $attrs[$key] = $validated[$key];
            }
        }
        foreach (['subjects', 'exams', 'areas', 'languages'] as $key) {
            if (array_key_exists($key, $validated)) {
                $attrs[$key] = TeacherProfile::tags($validated[$key]);
            }
        }
        if (isset($attrs['city'])) {
            $attrs['city'] = trim($attrs['city']);
        }

        return $attrs;
    }

    private function ownArray(TeacherProfile $profile): array
    {
        $profile->setRelation('user', $profile->user()->select(['id', 'name', 'avatar'])->first());

        return $profile->toPublicArray() + [
            'verification_status' => $profile->isVerified() ? 'verified' : 'pending',
        ];
    }

    /**
     * POST /teacher/register — upgrade the current account to a teacher and
     * create the profile. Idempotent for existing teachers (updates profile).
     */
    public function register(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate($this->rules());

        $profile = DB::transaction(function () use ($user, $validated) {
            if (!$user->isTeacher()) {
                $user->forceFill(['role' => User::ROLE_TEACHER])->save();
            }

            $profile = TeacherProfile::firstOrNew(['user_id' => $user->id]);
            $profile->fill($this->profileAttributes($validated));
            if (!$profile->exists) {
                $profile->city = $profile->city ?: $user->city;
                $profile->bio = $profile->bio ?: $user->bio;
            }
            $profile->save();

            return $profile;
        });

        return response()->json([
            'message' => $profile->isVerified()
                ? 'Profile saved.'
                : 'Profile saved. Your account is pending verification by the OSDHYAN team.',
            'profile' => $this->ownArray($profile),
            'user'    => $user->fresh(),
        ], 201);
    }

    /** GET /teacher/profile */
    public function show(Request $request)
    {
        $profile = TeacherProfile::where('user_id', $request->user()->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'No teacher profile yet.', 'profile' => null], 404);
        }

        return response()->json(['profile' => $this->ownArray($profile)]);
    }

    /** PUT /teacher/profile */
    public function update(Request $request)
    {
        $profile = TeacherProfile::where('user_id', $request->user()->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Register as a teacher first.'], 404);
        }

        $validated = $request->validate($this->rules(partial: true));
        $profile->fill($this->profileAttributes($validated))->save();

        return response()->json(['message' => 'Profile updated.', 'profile' => $this->ownArray($profile)]);
    }
}
