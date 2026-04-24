<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'min:10',
                'max:15',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
            'address' => 'sometimes|nullable|string|max:1000',
            'avatar' => 'sometimes|file|image|max:5120',
            'avatar_file' => 'sometimes|file|image|max:5120',
        ]);

        foreach (['name', 'email', 'phone', 'address'] as $field) {
            if (array_key_exists($field, $validated)) {
                $user->{$field} = $validated[$field];
            }
        }

        $avatarFile = $request->file('avatar') ?: $request->file('avatar_file');
        if ($avatarFile) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $avatarFile->store('avatars', 'public');
        }

        $user->save();

        $fresh = $user->fresh();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $fresh,
            'data' => $fresh,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
