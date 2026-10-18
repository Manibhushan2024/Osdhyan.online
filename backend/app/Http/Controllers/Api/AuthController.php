<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpEmail;
use App\Mail\WelcomeEmail;
use App\Models\User;
use App\Services\SmsService;
use App\Support\PhoneNumber;
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
        // IP + identifier: students behind one shared IP (coaching centre,
        // carrier NAT) must not lock each other out.
        $identity = strtolower(trim((string) ($request->input('login') ?? $request->input('email') ?? $request->input('phone') ?? '')));

        return $action . '|' . $request->ip() . '|' . sha1($identity);
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

    /**
     * Send a 6-digit OTP. purpose=login needs an existing account; purpose=signup
     * needs a NEW number. Delivery: SMS gateway → e-mail fallback → test-mode
     * (OTP returned in the response when no gateway is configured and the app
     * is not in production).
     */
    public function sendOtp(Request $request)
    {
        $key = $this->throttleKey('otp-send', $request);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->tooManyAttempts($key, 5);
        }
        RateLimiter::hit($key, 60);

        $validated = $request->validate([
            'phone'   => 'required|string|min:10|max:16',
            'purpose' => 'nullable|in:login,signup',
            'email'   => 'nullable|email|max:255',
        ]);

        $phone = PhoneNumber::normalize($validated['phone']);
        if (!$phone) {
            return response()->json(['message' => 'Enter a valid 10-digit Indian mobile number.'], 422);
        }

        $purpose = $validated['purpose'] ?? 'login';
        $user = User::whereIn('phone', PhoneNumber::candidates($phone))->first();

        if ($purpose === 'login' && !$user) {
            return response()->json([
                'message'    => 'No account found with this number. Create one in a minute.',
                'can_signup' => true,
            ], 404);
        }
        if ($purpose === 'signup' && $user) {
            return response()->json([
                'message'   => 'This number is already registered. Please sign in.',
                'can_login' => true,
            ], 409);
        }

        $otp = (string) random_int(100000, 999999);
        Cache::put('otp_' . $phone, ['otp' => $otp, 'purpose' => $purpose, 'tries' => 0], now()->addMinutes(10));

        $delivery = 'none';
        $sms = app(SmsService::class);
        try {
            if ($sms->sendOtp($phone, $otp)) {
                $delivery = 'sms';
            }
        } catch (\Throwable $e) {
            \Log::warning('SMS OTP failed', ['error' => $e->getMessage()]);
        }

        $email = $user?->email ?: ($validated['email'] ?? null);
        if ($delivery === 'none' && $email && !in_array(config('mail.default'), ['log', 'array'], true)) {
            try {
                Mail::to($email)->queue(new OtpEmail($user?->name ?? 'there', $otp, 'login'));
                $delivery = 'email';
            } catch (\Throwable $e) {
                \Log::error('OTP email fallback failed', ['error' => $e->getMessage()]);
            }
        }

        // Test mode: no gateway yet → show the OTP so the flow can be used end to end.
        $testMode = !$sms->isConfigured() && !app()->environment('production');

        return response()->json([
            'message'    => match ($delivery) {
                'sms'   => 'OTP sent by SMS to ' . PhoneNumber::mask($phone) . '.',
                'email' => 'OTP sent to your e-mail address.',
                default => $testMode ? 'Test mode: use the OTP shown below.' : 'OTP could not be delivered. Please try again later.',
            },
            'delivery'   => $delivery,
            'phone'      => $phone,
            'expires_in' => 600,
            'test_mode'  => $testMode,
            'dev_otp'    => $testMode ? $otp : null,
        ], $delivery === 'none' && !$testMode ? 503 : 200);
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
            'role'                  => 'nullable|in:student,teacher',
        ]);

        $user = User::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'phone'            => $validated['phone'],
            'state'            => $validated['state'] ?? null,
            'exam_preference'  => $validated['exam_preference'] ?? null,
            'target_year'      => $validated['target_year'] ?? null,
            'role'             => $validated['role'] ?? User::ROLE_STUDENT,
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
            $phoneCandidates = PhoneNumber::candidates($login);
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

    /**
     * Verify the OTP. Signs in an existing account, or creates one when the
     * number is new and a name was supplied (OTP sign-up, no password).
     */
    public function verifyOtp(Request $request)
    {
        $key = $this->throttleKey('verify-otp', $request);
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return $this->tooManyAttempts($key, 10);
        }

        $validated = $request->validate([
            'phone'           => 'required|string|min:10|max:16',
            'otp'             => 'required|string|min:4|max:6',
            'name'            => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'state'           => 'nullable|string|max:100',
            'exam_preference' => 'nullable|string|max:100',
            'target_year'     => 'nullable|integer',
            'role'            => 'nullable|in:student,teacher',
        ]);

        $phone = PhoneNumber::normalize($validated['phone']);
        $entry = $phone ? Cache::get('otp_' . $phone) : null;
        $stored = is_array($entry) ? $entry['otp'] : $entry; // legacy string entries

        if (!$phone || !$stored || !hash_equals((string) $stored, trim($validated['otp']))) {
            RateLimiter::hit($key, 60);
            if (is_array($entry)) {
                $entry['tries'] = ($entry['tries'] ?? 0) + 1;
                if ($entry['tries'] >= 5) {
                    Cache::forget('otp_' . $phone);
                    return response()->json(['message' => 'Too many wrong attempts. Request a new OTP.'], 401);
                }
                Cache::put('otp_' . $phone, $entry, now()->addMinutes(10));
            }
            return response()->json(['message' => 'Invalid or expired OTP'], 401);
        }

        $user = User::whereIn('phone', PhoneNumber::candidates($phone))->first();
        $isNewUser = false;

        if (!$user) {
            $regData = Cache::get('reg_data_' . $phone) ?: [];
            $name = $validated['name'] ?? $regData['name'] ?? null;
            if (!$name) {
                // Keep the OTP alive so the client can ask for a name and retry.
                return response()->json([
                    'message'    => 'No account with this number yet. Add your name to create one.',
                    'needs_name' => true,
                ], 404);
            }
            $email = $validated['email'] ?? $regData['email'] ?? null;
            if ($email && User::whereRaw('LOWER(email) = ?', [strtolower($email)])->exists()) {
                return response()->json(['message' => 'This e-mail is already used by another account.'], 409);
            }

            $user = User::create([
                'name'            => $name,
                'email'           => $email,
                'phone'           => $phone,
                'state'           => $validated['state'] ?? $regData['state'] ?? null,
                'exam_preference' => $validated['exam_preference'] ?? $regData['exam_preference'] ?? null,
                'target_year'     => $validated['target_year'] ?? $regData['target_year'] ?? null,
                'role'            => $validated['role'] ?? 'student',
                'password'        => Hash::make(Str::random(32)),
            ]);
            Cache::forget('reg_data_' . $phone);
            $isNewUser = true;

            if ($user->email) {
                try {
                    Mail::to($user->email)->queue(new WelcomeEmail($user));
                } catch (\Throwable $e) {
                    \Log::warning('Welcome email (OTP reg) failed', ['error' => $e->getMessage()]);
                }
            }
        }

        Cache::forget('otp_' . $phone);
        RateLimiter::clear($key);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => $isNewUser ? 'Account created' : 'Signed in',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
            'is_new_user'  => $isNewUser,
        ]);
    }

    // ─── Google OAuth ─────────────────────────────────────────────────────────

    public function options()
    {
        $sms = app(SmsService::class);

        return response()->json([
            'otp' => [
                'enabled'  => true,
                'delivery' => $sms->isConfigured() ? 'sms' : (!app()->environment('production') ? 'test_mode' : 'email'),
                'provider' => $sms->provider(),
            ],
            'google' => [
                'enabled'   => $this->googleConfigured(),
                'client_id' => $this->googleConfigured() ? config('services.google.client_id') : null,
            ],
        ]);
    }

    private function googleConfigured(): bool
    {
        return !empty(config('services.google.client_id')) && !empty(config('services.google.client_secret'));
    }

    public function redirectToGoogle()
    {
        if (!$this->googleConfigured()) {
            return response()->json([
                'message' => 'Google sign-in is not set up yet. Use your mobile number (OTP) or e-mail and password.',
                'code'    => 'GOOGLE_NOT_CONFIGURED',
            ], 503);
        }

        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    /**
     * Sign in with a Google ID token (Google Identity Services button on the
     * web, expo-auth-session on mobile). Verified with Google's tokeninfo
     * endpoint; the audience must be our client id.
     */
    public function googleToken(Request $request)
    {
        if (empty(config('services.google.client_id'))) {
            return response()->json(['message' => 'Google sign-in is not set up yet.', 'code' => 'GOOGLE_NOT_CONFIGURED'], 503);
        }

        $validated = $request->validate(['credential' => 'required|string|max:4096']);

        $info = \Illuminate\Support\Facades\Http::timeout(10)
            ->get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $validated['credential']]);

        if (!$info->successful()
            || $info->json('aud') !== config('services.google.client_id')
            || !in_array($info->json('iss'), ['accounts.google.com', 'https://accounts.google.com'], true)
            || !filter_var($info->json('email_verified'), FILTER_VALIDATE_BOOLEAN)
            || (int) $info->json('exp') < time()) {
            return response()->json(['message' => 'Google sign-in could not be verified.'], 401);
        }

        $user = $this->upsertGoogleUser((string) $info->json('sub'), (string) $info->json('email'), $info->json('name') ?: $info->json('email'), $info->json('picture'));
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Signed in with Google',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
            'needs_phone'  => empty($user->phone),
        ]);
    }

    private function upsertGoogleUser(string $googleId, string $email, string $name, ?string $avatar): User
    {
        $user = User::where('google_id', $googleId)->first()
            ?? User::whereRaw('LOWER(email) = ?', [strtolower($email)])->first();

        if (!$user) {
            $user = User::create([
                'name'              => $name,
                'email'             => $email,
                'google_id'         => $googleId,
                'avatar'            => $avatar,
                'password'          => Hash::make(Str::random(32)),
                'phone'             => null,
                'email_verified_at' => now(),
            ]);
            try {
                Mail::to($user->email)->queue(new WelcomeEmail($user));
            } catch (\Throwable $e) {
                \Log::warning('Welcome email (Google) failed', ['error' => $e->getMessage()]);
            }
        } else {
            $user->forceFill(array_filter([
                'google_id'         => $googleId,
                'avatar'            => $user->avatar ?: $avatar,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ]))->save();
        }

        return $user;
    }

    public function handleGoogleCallback()
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $user = $this->upsertGoogleUser((string) $googleUser->getId(), (string) $googleUser->getEmail(), $googleUser->getName() ?: $googleUser->getEmail(), $googleUser->getAvatar());

            $needsPhone = empty($user->phone) ? '1' : '0';
            $token      = $user->createToken('auth_token')->plainTextToken;

            return redirect("{$frontendUrl}/auth/callback?token={$token}&needs_phone={$needsPhone}");
        } catch (\Exception $e) {
            \Log::warning('Google OAuth callback failed', ['error' => $e->getMessage()]);

            return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Google sign-in failed. Please try again or use OTP.'));
        }
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
