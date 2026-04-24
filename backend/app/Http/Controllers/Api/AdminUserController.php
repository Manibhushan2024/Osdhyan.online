<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::where('is_admin', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'admin_role', 'created_at']);

        return response()->json(['data' => $users]);
    }

    public function storeEditor(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_admin' => true,
            'admin_role' => 'editor',
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function updateEditor(Request $request, User $user): JsonResponse
    {
        if ($user->isRootAdmin()) {
            return response()->json(['message' => 'Cannot modify root admin.'], 403);
        }

        $user->update($request->only(['name', 'email']));
        return response()->json(['data' => $user]);
    }

    public function destroyEditor(User $user): JsonResponse
    {
        if ($user->isRootAdmin()) {
            return response()->json(['message' => 'Cannot delete root admin.'], 403);
        }

        $user->update(['is_admin' => false, 'admin_role' => null]);
        return response()->json(['message' => 'Admin privileges revoked.']);
    }
}
