<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class OtpAndGoogleAuthTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private function otpFor(string $phone): string
    {
        $entry = Cache::get('otp_' . $phone);

        return is_array($entry) ? $entry['otp'] : (string) $entry;
    }

    // ─── OTP login ────────────────────────────────────────────────────────────

    public function test_otp_login_for_existing_user_in_test_mode(): void
    {
        $user = $this->student(['phone' => '9876543210']);

        $res = $this->postJson('/api/auth/send-otp', ['phone' => '+91 98765 43210'])->assertOk();
        $res->assertJson(['delivery' => 'none', 'test_mode' => true, 'phone' => '9876543210']);
        $otp = $res->json('dev_otp');
        $this->assertMatchesRegularExpression('/^\d{6}$/', $otp);

        $this->postJson('/api/auth/verify-otp', ['phone' => '09876543210', 'otp' => $otp])
            ->assertOk()->assertJsonStructure(['access_token'])->assertJson(['is_new_user' => false, 'user' => ['id' => $user->id]]);

        // OTP is single-use
        $this->postJson('/api/auth/verify-otp', ['phone' => '9876543210', 'otp' => $otp])->assertStatus(401);
    }

    public function test_otp_login_for_unknown_number_suggests_signup(): void
    {
        $this->postJson('/api/auth/send-otp', ['phone' => '9000000099'])
            ->assertNotFound()->assertJson(['can_signup' => true]);
    }

    public function test_invalid_phone_is_rejected(): void
    {
        $this->postJson('/api/auth/send-otp', ['phone' => '12345'])->assertStatus(422);
        $this->postJson('/api/auth/send-otp', ['phone' => '1234567890'])->assertStatus(422); // not an Indian mobile
    }

    public function test_wrong_otp_is_rejected_and_locks_after_five_tries(): void
    {
        $this->student(['phone' => '9876543211']);
        $this->postJson('/api/auth/send-otp', ['phone' => '9876543211'])->assertOk();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/verify-otp', ['phone' => '9876543211', 'otp' => '000000'])->assertStatus(401);
        }
        $this->assertNull(Cache::get('otp_9876543211'), 'OTP must be discarded after 5 wrong tries');
    }

    // ─── OTP sign-up ──────────────────────────────────────────────────────────

    public function test_otp_signup_creates_an_account_without_password(): void
    {
        $send = $this->postJson('/api/auth/send-otp', ['phone' => '9123456789', 'purpose' => 'signup'])->assertOk();
        $otp = $send->json('dev_otp');

        // Without a name the server asks for one instead of creating a blank account
        $this->postJson('/api/auth/verify-otp', ['phone' => '9123456789', 'otp' => $otp])
            ->assertNotFound()->assertJson(['needs_name' => true]);

        // OTP was consumed by that attempt? No — only on success. Re-verify with a name.
        $res = $this->postJson('/api/auth/verify-otp', [
            'phone' => '9123456789', 'otp' => $otp, 'name' => 'Priya Kumari', 'email' => 'priya@example.test', 'exam_preference' => 'BPSC',
        ])->assertOk();

        $res->assertJson(['is_new_user' => true]);
        $this->assertDatabaseHas('users', ['phone' => '9123456789', 'name' => 'Priya Kumari', 'role' => 'student']);
        $this->withToken($res->json('access_token'))->getJson('/api/user')->assertOk()->assertJson(['phone' => '9123456789']);
    }

    public function test_signup_otp_for_registered_number_points_to_login(): void
    {
        $this->student(['phone' => '9123456780']);
        $this->postJson('/api/auth/send-otp', ['phone' => '9123456780', 'purpose' => 'signup'])
            ->assertStatus(409)->assertJson(['can_login' => true]);
    }

    public function test_dev_otp_is_never_returned_in_production(): void
    {
        $this->student(['phone' => '9876543212']);
        $this->app->detectEnvironment(fn () => 'production');
        config(['mail.default' => 'array']);

        $res = $this->postJson('/api/auth/send-otp', ['phone' => '9876543212']);
        $this->assertNull($res->json('dev_otp'));
        $this->assertFalse((bool) $res->json('test_mode'));
    }

    public function test_sms_gateway_is_used_when_configured(): void
    {
        config(['services.sms.provider' => 'fast2sms', 'services.sms.api_key' => 'test-key']);
        Http::fake(['www.fast2sms.com/*' => Http::response(['return' => true, 'request_id' => 'x'], 200)]);
        $this->student(['phone' => '9876543213']);

        $res = $this->postJson('/api/auth/send-otp', ['phone' => '9876543213'])->assertOk();
        $res->assertJson(['delivery' => 'sms']);
        $this->assertNull($res->json('dev_otp'));
        Http::assertSent(fn ($req) => str_contains($req->url(), 'fast2sms') && $req['numbers'] === '9876543213');
    }

    // ─── Google ───────────────────────────────────────────────────────────────

    public function test_google_is_reported_unavailable_until_configured(): void
    {
        config(['services.google.client_id' => null, 'services.google.client_secret' => null]);
        $this->getJson('/api/auth/options')->assertOk()->assertJson(['google' => ['enabled' => false], 'otp' => ['enabled' => true]]);
        $this->getJson('/api/auth/google/redirect')->assertStatus(503)->assertJson(['code' => 'GOOGLE_NOT_CONFIGURED']);
        $this->postJson('/api/auth/google/token', ['credential' => 'abc'])->assertStatus(503);
    }

    public function test_google_id_token_signs_in_and_creates_user(): void
    {
        config(['services.google.client_id' => 'client-123', 'services.google.client_secret' => 'secret']);
        Http::fake(['oauth2.googleapis.com/tokeninfo*' => Http::response([
            'aud' => 'client-123', 'iss' => 'https://accounts.google.com', 'sub' => 'g-1', 'email' => 'ravi@gmail.com',
            'email_verified' => 'true', 'name' => 'Ravi', 'picture' => 'https://img/x.png', 'exp' => time() + 600,
        ], 200)]);

        $res = $this->postJson('/api/auth/google/token', ['credential' => 'good-token'])->assertOk();
        $res->assertJson(['needs_phone' => true, 'user' => ['email' => 'ravi@gmail.com']]);
        $this->assertDatabaseHas('users', ['email' => 'ravi@gmail.com', 'google_id' => 'g-1']);

        // Second sign-in links the same account
        $this->postJson('/api/auth/google/token', ['credential' => 'good-token'])->assertOk();
        $this->assertSame(1, User::where('email', 'ravi@gmail.com')->count());
    }

    public function test_google_id_token_with_wrong_audience_is_rejected(): void
    {
        config(['services.google.client_id' => 'client-123', 'services.google.client_secret' => 'secret']);
        Http::fake(['oauth2.googleapis.com/tokeninfo*' => Http::response([
            'aud' => 'someone-else', 'iss' => 'https://accounts.google.com', 'sub' => 'g-2', 'email' => 'x@gmail.com',
            'email_verified' => 'true', 'exp' => time() + 600,
        ], 200)]);

        $this->postJson('/api/auth/google/token', ['credential' => 'bad'])->assertStatus(401);
        $this->assertDatabaseMissing('users', ['email' => 'x@gmail.com']);
    }

    public function test_password_login_accepts_any_phone_format(): void
    {
        $this->student(['phone' => '9876543299']);
        foreach (['9876543299', '+91 98765 43299', '09876543299', '919876543299'] as $login) {
            $this->postJson('/api/auth/login', ['login' => $login, 'password' => 'Secret@123'])->assertOk();
        }
    }
}
