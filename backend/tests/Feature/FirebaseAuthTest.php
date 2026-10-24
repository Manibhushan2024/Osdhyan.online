<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\FirebaseTokenVerifier;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class FirebaseAuthTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private const PROJECT = 'osdhyan-test';
    private const KID = 'test-kid-1';

    /** One RSA key + self-signed cert for the whole class (key generation is slow). */
    private static ?string $privateKey = null;
    private static ?string $certificate = null;

    protected function setUp(): void
    {
        parent::setUp();

        if (self::$privateKey === null) {
            [self::$privateKey, $key] = self::newRsaKey();
            $opts = self::opensslOptions();
            $csr = openssl_csr_new(['commonName' => 'securetoken.system.gserviceaccount.com'], $key, $opts);
            $x509 = openssl_csr_sign($csr, null, $key, 1, $opts);
            openssl_x509_export($x509, $cert);
            self::$certificate = $cert;
        }

        config(['services.firebase' => [
            'project_id'          => self::PROJECT,
            'web_api_key'         => 'AIza-test',
            'auth_domain'         => self::PROJECT . '.firebaseapp.com',
            'web_app_id'          => '1:123:web:abc',
            'messaging_sender_id' => '123',
        ]]);

        Http::fake([
            'www.googleapis.com/robot/v1/metadata/x509/*' => Http::response(
                [self::KID => self::$certificate],
                200,
                ['Cache-Control' => 'public, max-age=19000, must-revalidate, no-transform'],
            ),
        ]);
    }

    /**
     * PHP on Windows often has no usable openssl.cnf; a minimal one makes key,
     * CSR and certificate generation work everywhere.
     */
    private static function opensslOptions(): array
    {
        static $config = null;
        if ($config === null) {
            $config = tempnam(sys_get_temp_dir(), 'osslcnf');
            register_shutdown_function(fn () => @unlink($config));
            file_put_contents($config, "[ req ]\ndistinguished_name = req_dn\n[ req_dn ]\n");
        }

        return ['config' => $config, 'digest_alg' => 'sha256', 'private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA];
    }

    /** @return array{0: string, 1: \OpenSSLAsymmetricKey} PEM private key and the key resource */
    private static function newRsaKey(): array
    {
        $key = openssl_pkey_new(self::opensslOptions());
        openssl_pkey_export($key, $pem, null, self::opensslOptions());

        return [$pem, $key];
    }

    private function token(array $claims = [], string $kid = self::KID): string
    {
        $now = time();

        return JWT::encode(array_merge([
            'iss'       => 'https://securetoken.google.com/' . self::PROJECT,
            'aud'       => self::PROJECT,
            'auth_time' => $now - 10,
            'iat'       => $now - 10,
            'exp'       => $now + 3600,
            'sub'       => 'fb-uid-1',
            'user_id'   => 'fb-uid-1',
            'phone_number' => '+919876500011',
            'firebase'  => ['identities' => ['phone' => ['+919876500011']], 'sign_in_provider' => 'phone'],
        ], $claims), self::$privateKey, 'RS256', $kid);
    }

    // ─── Sign-in ──────────────────────────────────────────────────────────────

    public function test_phone_sign_in_creates_user_with_normalised_phone(): void
    {
        $res = $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(), 'name' => 'Anjali'])->assertOk();

        $res->assertJsonStructure(['message', 'access_token', 'token_type', 'user', 'is_new_user'])
            ->assertJson(['is_new_user' => true, 'token_type' => 'Bearer', 'user' => ['phone' => '9876500011', 'name' => 'Anjali']]);
        $this->assertDatabaseHas('users', ['phone' => '9876500011', 'firebase_uid' => 'fb-uid-1', 'role' => 'student']);
        $this->withToken($res->json('access_token'))->getJson('/api/user')->assertOk()->assertJson(['phone' => '9876500011']);

        // Certificates were fetched once and cached
        Http::assertSentCount(1);
    }

    public function test_second_sign_in_reuses_the_user(): void
    {
        $first = $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token()])->assertOk();
        $this->assertSame('Student', $first->json('user.name'));

        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token()])
            ->assertOk()->assertJson(['is_new_user' => false, 'user' => ['id' => $first->json('user.id')]]);
        $this->assertSame(1, User::where('firebase_uid', 'fb-uid-1')->count());
        Http::assertSentCount(1);
    }

    public function test_phone_sign_in_links_existing_otp_user_in_any_format(): void
    {
        $user = $this->student(['phone' => '09876500022']);

        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['sub' => 'fb-uid-2', 'phone_number' => '+919876500022'])])
            ->assertOk()->assertJson(['is_new_user' => false, 'user' => ['id' => $user->id]]);
        $this->assertSame('fb-uid-2', $user->fresh()->firebase_uid);
    }

    public function test_verified_email_sign_in_links_existing_user(): void
    {
        $user = $this->student(['email' => 'meera@example.test', 'phone' => '9876500033']);

        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token([
            'sub' => 'fb-uid-3', 'phone_number' => null, 'email' => 'Meera@Example.test', 'email_verified' => true,
            'name' => 'Meera', 'firebase' => ['sign_in_provider' => 'password'],
        ])])->assertOk()->assertJson(['is_new_user' => false, 'user' => ['id' => $user->id]]);

        $fresh = $user->fresh();
        $this->assertSame('fb-uid-3', $fresh->firebase_uid);
        $this->assertNotNull($fresh->email_verified_at);
    }

    public function test_unverified_email_does_not_take_over_existing_account(): void
    {
        $user = $this->student(['email' => 'victim@example.test']);

        $res = $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token([
            'sub' => 'fb-uid-4', 'phone_number' => null, 'email' => 'victim@example.test', 'email_verified' => false,
            'firebase' => ['sign_in_provider' => 'password'],
        ])])->assertOk()->assertJson(['is_new_user' => true]);

        $this->assertNotSame($user->id, $res->json('user.id'));
        $this->assertNull($user->fresh()->firebase_uid);
    }

    // ─── Rejections ───────────────────────────────────────────────────────────

    public function test_wrong_audience_or_issuer_is_rejected(): void
    {
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['aud' => 'someone-else'])])->assertStatus(401);
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['iss' => 'https://securetoken.google.com/someone-else'])])->assertStatus(401);
        $this->assertDatabaseMissing('users', ['phone' => '9876500011']);
    }

    public function test_expired_token_is_rejected(): void
    {
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['exp' => time() - 5])])
            ->assertStatus(401)->assertJsonFragment(['message' => 'Firebase ID token has expired. Please sign in again.']);
    }

    public function test_future_iat_and_bad_subject_are_rejected(): void
    {
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['iat' => time() + 600])])->assertStatus(401);
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['auth_time' => time() + 600])])->assertStatus(401);
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['sub' => ''])])->assertStatus(401);
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token(['sub' => str_repeat('a', 129)])])->assertStatus(401);
    }

    public function test_unknown_kid_or_forged_signature_is_rejected(): void
    {
        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token([], 'other-kid')])
            ->assertStatus(401)->assertJsonFragment(['message' => 'Firebase ID token was signed with an unknown key.']);

        [$otherPem] = self::newRsaKey();
        $forged = JWT::encode(['iss' => 'https://securetoken.google.com/' . self::PROJECT, 'aud' => self::PROJECT, 'sub' => 'x',
            'iat' => time(), 'auth_time' => time(), 'exp' => time() + 600, 'phone_number' => '+919876500044'], $otherPem, 'RS256', self::KID);
        $this->postJson('/api/auth/firebase/token', ['id_token' => $forged])->assertStatus(401);

        $this->postJson('/api/auth/firebase/token', ['id_token' => 'not-a-jwt'])->assertStatus(401);
    }

    public function test_returns_503_when_not_configured(): void
    {
        config(['services.firebase.project_id' => null]);

        $this->postJson('/api/auth/firebase/token', ['id_token' => $this->token()])
            ->assertStatus(503)->assertJson(['code' => 'FIREBASE_NOT_CONFIGURED']);
        $this->getJson('/api/auth/options')->assertOk()->assertJson(['firebase' => ['enabled' => false, 'project_id' => null]]);
        Http::assertNothingSent();
    }

    // ─── Options / routing ────────────────────────────────────────────────────

    public function test_options_shows_firebase_web_config(): void
    {
        $this->getJson('/api/auth/options')->assertOk()->assertJson(['firebase' => [
            'enabled'    => true,
            'project_id' => self::PROJECT,
            'web'        => [
                'apiKey'            => 'AIza-test',
                'authDomain'        => self::PROJECT . '.firebaseapp.com',
                'appId'             => '1:123:web:abc',
                'messagingSenderId' => '123',
            ],
        ]]);
    }

    public function test_route_is_rate_limited_like_login(): void
    {
        $route = Route::getRoutes()->match(request()->create('/api/auth/firebase/token', 'POST'));
        $this->assertContains('throttle:login', $route->gatherMiddleware());
        $this->assertTrue(app(FirebaseTokenVerifier::class)->isConfigured());
    }
}
