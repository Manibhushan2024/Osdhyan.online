<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpEmail;
use App\Mail\WelcomeEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Throttle key tied to IP + action so different actions don't share limits.
     */
    private function throttleKey(string $action, Request $request): string
    {
        return $action . '|' . $request->ip();
    }

    /**
     * Return a 429 response with Retry-After header when a limiter is exhausted.
     */
    private function tooManyAttempts(string $key, int $maxAttempts)
    {
        $seconds = RateLimiter::availableIn($key);

        return response()->json([
            'message'     => 'Too many attempts. Please try again later.',
            'retry_after' => $seconds,
        ], 429)->withHeaders([
            'Retry-After'           => $seconds,
            'X-RateLimit-Limit'     => $maxAttempts,
            'X-RateLimit-Remaining' => 0,
        ]);
    }

    // ─── Admin Login ─────────────────────────────────────────────────────────

    public function adminLogin(Request $request)
    {
        $key = $this->throttleKey('admin-login', $request);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        $validated = $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($validated['login']);

        $user = filter_var($login, FILTER_VALIDATE_EMAIL)
            ? User::whereRaw('LOWER(email) = ?', [strtolower($login)])->first()
            : User::where('username', $login)
                  ->orWhereRaw('LOWER(email) = ?', [strtolower($login)])
                  ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        if (!$user->isAdminUser()) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Unauthorized admin access.'], 403);
        }

        RateLimiter::clear($key);

        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Admin login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // ─── OTP ─────────────────────────────────────────────────────────────────

    public function sendOtp(Request $request)
    {
        $key = $this->throttleKey('otp-send', $request);

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->tooManyAttempts($key, 5);
        }

        RateLimiter::hit($key, 60);

        $validated = $request->validate([
            'phone' => 'required|string|min:10|max:15',
        ]);

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            return response()->json(['message' => 'User not found. Please sign up first.'], 404);
        }

        $otp = (string) rand(1000, 9999);
        Cache::put('otp_' . $validated['phone'], $otp, now()->addMinutes(5));

        $smsSent = false;
        try {
            $smsService = new \App\Services\SmsService();
            $smsService->sendOtp($validated['phone'], $otp);
            $smsSent = true;
        } catch (\Throwable $e) {
            \Log::warning('SMS OTP failed, falling back to email', ['error' => $e->getMessage()]);
        }

        if (!$smsSent && $user->email) {
            try {
                Mail::to($user->email)->queue(new OtpEmail($user->name, $otp, 'login'));
            } catch (\Throwable $e) {
                \Log::error('OTP email fallback also failed', ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => 'OTP sent successfully',
            'dev_otp' => config('app.env') === 'local' ? $otp : null,
        ]);
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    public function register(Request $request)
    {
        $key = $this->throttleKey('register', $request);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        RateLimiter::hit($key, 3600);

        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users',
            'phone'                 => 'required|string|min:10|max:15|unique:users',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
            'state'                 => 'nullable|string',
            'exam_preference'       => 'nullable|string',
            'target_year'           => 'nullable|integer',
        ]);

        $user = User::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'phone'            => $validated['phone'],
            'state'            => $validated['state'] ?? null,
            'exam_preference'  => $validated['exam_preference'] ?? null,
            'target_year'      => $validated['target_year'] ?? null,
            'password'         => Hash::make($validated['password']),
        ]);

        // Fire-and-forget welcome email
        try {
            Mail::to($user->email)->queue(new WelcomeEmail($user));
        } catch (\Throwable $e) {
            \Log::warning('Welcome email queue failed', ['error' => $e->getMessage()]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Registration successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    public function login(Request $request)
    {
        $key = $this->throttleKey('login', $request);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        $validated = $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($validated['login']);
        $user  = null;

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

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        RateLimiter::clear($key);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // ─── Forgot Password ─────────────────────────────────────────────────────

    public function forgotPassword(Request $request)
    {
        $key = $this->throttleKey('forgot-password', $request);

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->tooManyAttempts($key, 5);
        }

        RateLimiter::hit($key, 300);

        $validated = $request->validate([
            'email' => 'nullable|string|email',
            'phone' => 'nullable|string',
        ]);

        if (empty($validated['email']) && empty($validated['phone'])) {
            return response()->json(['message' => 'Email or phone is required.'], 422);
        }

        if (!empty($validated['email'])) {
            $user = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->first();
            if (!$user) {
                return response()->json(['message' => 'User not found with this email address.'], 404);
            }

            $otp = (string) rand(1000, 9999);
            Cache::put('reset_otp_' . $user->phone, $otp, now()->addMinutes(10));

            try {
                Mail::to($user->email)->queue(new OtpEmail($user->name, $otp, 'reset'));
            } catch (\Throwable $e) {
                \Log::error('Forgot password email failed', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'message' => 'Reset OTP sent to your registered email address.',
            ]);
        }

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            return response()->json(['message' => 'User not found with this mobile number.'], 404);
        }

        $otp = (string) rand(1000, 9999);
        Cache::put('reset_otp_' . $validated['phone'], $otp, now()->addMinutes(10));

        $smsSent = false;
        try {
            $smsService = new \App\Services\SmsService();
            $smsService->sendOtp($validated['phone'], $otp);
            $smsSent = true;
        } catch (\Throwable $e) {
            \Log::warning('Reset SMS failed, falling back to email', ['error' => $e->getMessage()]);
        }

        if (!$smsSent && $user->email) {
            try {
                Mail::to($user->email)->queue(new OtpEmail($user->name, $otp, 'reset'));
            } catch (\Throwable $e) {
                \Log::error('Reset email fallback failed', ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => 'Reset OTP sent successfully',
            'dev_otp' => config('app.env') === 'local' ? $otp : null,
        ]);
    }

    // ─── Reset Password ───────────────────────────────────────────────────────

    public function resetPassword(Request $request)
    {
        $key = $this->throttleKey('reset-password', $request);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        $validated = $request->validate([
            'phone'    => 'required|string',
            'otp'      => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $cachedOtp = Cache::get('reset_otp_' . $validated['phone']);

        if (!$cachedOtp || $cachedOtp !== $validated['otp']) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid or expired OTP.'], 401);
        }

        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($validated['password'])]);
        Cache::forget('reset_otp_' . $validated['phone']);
        RateLimiter::clear($key);

        return response()->json(['message' => 'Password reset successful.']);
    }

    // ─── Verify OTP ───────────────────────────────────────────────────────────

    public function verifyOtp(Request $request)
    {
        $key = $this->throttleKey('verify-otp', $request);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        $validated = $request->validate([
            'phone' => 'required|string',
            'otp'   => 'required|string',
        ]);

        $cachedOtp = Cache::get('otp_' . $validated['phone']);

        if (!$cachedOtp || $cachedOtp !== $validated['otp']) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid or expired OTP'], 401);
        }

        Cache::forget('otp_' . $validated['phone']);
        RateLimiter::clear($key);

        $regData = Cache::get('reg_data_' . $validated['phone']);
        $isNewUser = false;

        if ($regData) {
            $user = User::create([
                'name'            => $regData['name'],
                'email'           => $regData['email'],
                'phone'           => $regData['phone'],
                'state'           => $regData['state'] ?? null,
                'exam_preference' => $regData['exam_preference'] ?? null,
                'target_year'     => $regData['target_year'] ?? null,
                'password'        => Hash::make(Str::random(16)),
            ]);
            Cache::forget('reg_data_' . $validated['phone']);
            $isNewUser = true;
        } else {
            $user = User::where('phone', $validated['phone'])->first();
            if (!$user) {
                return response()->json(['message' => 'User not found. Please sign up first.'], 404);
            }
        }

        if ($isNewUser && $user->email) {
            try {
                Mail::to($user->email)->queue(new WelcomeEmail($user));
            } catch (\Throwable $e) {
                \Log::warning('Welcome email (OTP reg) failed', ['error' => $e->getMessage()]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'OTP verified successfully',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // ─── Google OAuth ─────────────────────────────────────────────────────────

    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->getEmail())->first();
            $isNewUser = false;

            if (!$user) {
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar(),
                    'password'  => Hash::make(Str::random(16)),
                    'phone'     => null,
                ]);
                $isNewUser = true;
            } else {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar(),
                ]);
            }

            if ($isNewUser) {
                try {
                    Mail::to($user->email)->queue(new WelcomeEmail($user));
                } catch (\Throwable $e) {
                    \Log::warning('Welcome email (Google) failed', ['error' => $e->getMessage()]);
                }
            }

            $needsPhone   = empty($user->phone) ? '1' : '0';
            $token        = $user->createToken('auth_token')->plainTextToken;
            $frontendUrl  = rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/');

            return redirect("{$frontendUrl}/auth/callback?token={$token}&needs_phone={$needsPhone}");
        } catch (\Exception $e) {
            $frontendUrl = rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/');
            return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
