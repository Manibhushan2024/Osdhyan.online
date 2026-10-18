<?php

namespace Tests\Feature;

use App\Models\PersonalAccessToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private function login(string $login, string $password, string $ip = '10.0.0.1')
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/auth/login', ['login' => $login, 'password' => $password]);
    }

    public function test_one_students_failed_logins_do_not_lock_out_classmates_on_the_same_ip(): void
    {
        $alice = $this->student();
        $bob = $this->student();

        // Alice hammers wrong passwords from the coaching-centre IP until throttled.
        $statuses = [];
        for ($i = 0; $i < 12; $i++) {
            $statuses[] = $this->login($alice->email, 'wrong')->status();
        }
        $this->assertContains(429, $statuses, 'brute force on one account must be throttled');

        // Bob, same IP, still logs in.
        $this->login($bob->email, 'Secret@123')->assertOk()->assertJsonStructure(['access_token']);
    }

    public function test_a_whole_classroom_can_log_in_from_one_ip(): void
    {
        for ($i = 0; $i < 40; $i++) {
            $s = $this->student();
            $this->login($s->email, 'Secret@123', '10.0.0.99')->assertOk();
        }
    }

    public function test_login_works_with_phone_number_in_any_common_format(): void
    {
        $s = $this->student(['phone' => '9876543210']);
        foreach (['9876543210', '+91 98765 43210', '09876543210'] as $login) {
            $this->login($login, 'Secret@123')->assertOk();
        }
    }

    public function test_answer_sync_has_its_own_budget_and_is_not_double_counted(): void
    {
        Queue::fake();
        $this->actingAsStudent();
        $test = $this->makeTest(count: 1);
        $key = $this->answerKey($test);
        $id = $this->postJson("/api/tests/{$test->id}/attempts")->json('attempt.id');
        $payload = ['responses' => [['question_id' => $key[0]['question_id'], 'selected_option_id' => $key[0]['correct']]]];

        // The old setup (60/min outer + 120/min inner sharing one key) blocked
        // a student after ~30 saves. The 'answers' limiter allows 90/min.
        for ($i = 0; $i < 90; $i++) {
            $this->postJson("/api/attempts/{$id}/sync", $payload)->assertOk();
        }
        $this->postJson("/api/attempts/{$id}/sync", $payload)->assertStatus(429);

        // Other API calls still work — separate bucket.
        $this->getJson("/api/tests/{$test->id}")->assertOk();
    }

    public function test_logout_revokes_the_cached_token_immediately(): void
    {
        $s = $this->student();
        $token = $this->login($s->email, 'Secret@123')->json('access_token');

        $this->withToken($token)->getJson('/api/user')->assertOk();   // warms the token cache
        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertUnauthorized();
    }

    public function test_token_lookups_are_cached_and_last_used_writes_are_throttled(): void
    {
        $s = $this->student();
        $token = $this->login($s->email, 'Secret@123')->json('access_token');
        $this->withToken($token)->getJson('/api/user')->assertOk();

        $hash = hash('sha256', explode('|', $token, 2)[1]);
        $this->assertNotNull(Cache::get(PersonalAccessToken::cacheKeyForHash($hash)));

        $lastUsed = fn () => (string) PersonalAccessToken::where('token', $hash)->value('last_used_at');
        $first = $lastUsed();
        $this->assertNotSame('', $first);

        // 1 minute later: no write (throttled to once per 5 minutes).
        $this->travel(1)->minutes();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertOk();
        $this->assertSame($first, $lastUsed());

        // 6 minutes later: written again.
        $this->travel(5)->minutes();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertOk();
        $this->assertNotSame($first, $lastUsed());
    }
}
