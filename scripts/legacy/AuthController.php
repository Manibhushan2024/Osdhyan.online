<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function adminLogin(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($validated['login']);

        $userQuery = User::query();

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $userQuery->whereRaw('LOWER(email) = ?', [strtolower($login)]);
        } else {
            $userQuery->where('username', $login)
                ->orWhereRaw('LOWER(email) = ?', [strtolower($login)]);
        }

        $user = $userQuery->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        if (!$user->isAdminUser()) {
            return response()->json(['message' => 'Unauthorized admin access.'], 403);
        }

        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|min:10|max:15',
        ]);

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            return response()->json(['message' => 'User not found. Please sign up first.'], 404);
        }

        $otp = rand(1000, 9999);
        Cache::put('otp_' . $validated['phone'], $otp, now()->addMinutes(5));

        // Use production-ready SmsService
        $smsService = new \App\Services\SmsService();
        $smsService->sendOtp($validated['phone'], $otp);

        return response()->json([
            'message' => 'OTP sent successfully',
            'dev_otp' => config('app.env') === 'local' ? $otp : null,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|min:10|max:15|unique:users',
            'password' => 'required|string|min:8',
            'state' => 'required|string',
            'exam_preference' => 'required|string',
            'target_year' => 'required|integer',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'state' => $validated['state'],
            'exam_preference' => $validated['exam_preference'],
            'target_year' => $validated['target_year'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string', // phone or email
            'password' => 'required|string',
        ]);

        $login = trim($validated['login']);
        $password = $validated['password'];

        $user = null;

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::whereRaw('LOWER(email) = ?', [strtolower($login)])->first();
        }

        if (!$user) {
            $digits = preg_replace('/\D+/', '', $login);
            $phoneCandidates = array_values(array_unique(array_filter([
                $login,
                $digits,
                ltrim($digits, '0'),
                strlen($digits) >= 10 ? substr($digits, -10) : null,
                strlen($digits) >= 10 ? '91' . substr($digits, -10) : null,
                strlen($digits) >= 10 ? '+91' . substr($digits, -10) : null,
            ])));

            if (!empty($phoneCandidates)) {
                $user = User::whereIn('phone', $phoneCandidates)->first();
            }
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
        ]);

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            return response()->json(['message' => 'User not found with this mobile number.'], 404);
        }

        $otp = rand(1000, 9999);
        Cache::put('reset_otp_' . $validated['phone'], $otp, now()->addMinutes(10));

        // Send OTP
        $smsService = new \App\Services\SmsService();
        $smsService->sendOtp($validated['phone'], $otp);

        return response()->json([
            'message' => 'Reset OTP sent successfully',
            'dev_otp' => config('app.env') === 'local' ? $otp : null,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $cachedOtp = Cache::get('reset_otp_' . $validated['phone']);

        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 401);
        }

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) return response()->json(['message' => 'User not found.'], 404);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        Cache::forget('reset_otp_' . $validated['phone']);

        return response()->json(['message' => 'Password reset successful.']);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
        ]);

        $cachedOtp = Cache::get('otp_' . $validated['phone']);

        if ($cachedOtp && $cachedOtp == $validated['otp']) {
            Cache::forget('otp_' . $validated['phone']);

            $regData = Cache::get('reg_data_' . $validated['phone']);
            
            if ($regData) {
                // Completing Signup
                $user = User::create([
                    'name' => $regData['name'],
                    'email' => $regData['email'],
                    'phone' => $regData['phone'],
                    'state' => $regData['state'],
                    'exam_preference' => $regData['exam_preference'],
                    'target_year' => $regData['target_year'],
                    'password' => Hash::make(Str::random(16)),
                ]);
                Cache::forget('reg_data_' . $validated['phone']);
            } else {
                // Simple Login
                $user = User::where('phone', $validated['phone'])->first();
                if (!$user) {
                    return response()->json(['message' => 'User not found. Please sign up first.'], 404);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'OTP verified successfully',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Invalid or expired OTP'], 401);
    }

    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(16)),
                    'phone' => null, // Will need to collect this
                ]);
            } else {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }

            $needsPhone = empty($user->phone) ? '1' : '0';

            $token = $user->createToken('auth_token')->plainTextToken;

            $frontendUrl = config('app.frontend_url', 'http://34.131.187.176');
            return redirect($frontendUrl . "/auth/callback?token={$token}&needs_phone={$needsPhone}");
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://34.131.187.176');
            return redirect($frontendUrl . "/auth/login?error=" . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}