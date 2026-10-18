<?php

namespace Tests\Feature;

use App\Mail\OtpEmail;
use App\Models\TestSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class EmailOtpAndSeriesTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    public function test_email_otp_signup_and_login_in_test_mode(): void
    {
        $send = $this->postJson('/api/auth/send-otp', ['identifier' => 'Ravi.Kumar@Example.test', 'purpose' => 'signup'])->assertOk();
        $send->assertJson(['channel' => 'email', 'email' => 'ravi.kumar@example.test', 'test_mode' => true]);
        $otp = $send->json('dev_otp');

        $res = $this->postJson('/api/auth/verify-otp', ['identifier' => 'ravi.kumar@example.test', 'otp' => $otp, 'name' => 'Ravi Kumar'])->assertOk();
        $res->assertJson(['is_new_user' => true]);
        $this->assertDatabaseHas('users', ['email' => 'ravi.kumar@example.test', 'phone' => null]);
        $this->assertNotNull($res->json('user.email_verified_at'));

        // login with the same e-mail
        $otp2 = $this->postJson('/api/auth/send-otp', ['identifier' => 'ravi.kumar@example.test'])->assertOk()->json('dev_otp');
        $this->postJson('/api/auth/verify-otp', ['identifier' => 'ravi.kumar@example.test', 'otp' => $otp2])->assertOk()->assertJson(['is_new_user' => false]);

        // signup again with the same e-mail is refused
        $this->postJson('/api/auth/send-otp', ['identifier' => 'ravi.kumar@example.test', 'purpose' => 'signup'])->assertStatus(409);
    }

    public function test_email_otp_is_sent_through_the_mailer_when_configured(): void
    {
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => 'smtp.gmail.com', 'mail.mailers.smtp.username' => 'x@gmail.com']);
        Mail::fake();
        $this->student(['email' => 'priya@example.test']);

        $res = $this->postJson('/api/auth/send-otp', ['identifier' => 'priya@example.test'])->assertOk();
        $res->assertJson(['delivery' => 'email']);
        $this->assertNull($res->json('dev_otp'));
        Mail::assertSent(OtpEmail::class, fn ($m) => $m->hasTo('priya@example.test'));
    }

    public function test_phone_otp_falls_back_to_email_when_sms_is_down(): void
    {
        config(['services.sms.provider' => 'android', 'services.sms.gateway_url' => 'http://10.0.0.5:8080',
            'mail.default' => 'smtp', 'mail.mailers.smtp.host' => 'smtp.gmail.com', 'mail.mailers.smtp.username' => 'x@gmail.com']);
        Http::fake(['10.0.0.5:8080/*' => Http::response('offline', 500)]);
        Mail::fake();
        $this->student(['phone' => '9876543210', 'email' => 'fallback@example.test']);

        $res = $this->postJson('/api/auth/send-otp', ['identifier' => '9876543210'])->assertOk();
        $res->assertJson(['delivery' => 'email']);
        Mail::assertSent(OtpEmail::class);
    }

    public function test_android_gateway_provider_posts_to_the_phone(): void
    {
        config(['services.sms.provider' => 'android', 'services.sms.gateway_url' => 'http://10.0.0.5:8080',
            'services.sms.gateway_user' => 'sms', 'services.sms.gateway_password' => 'pw']);
        Http::fake(['10.0.0.5:8080/message' => Http::response(['id' => 'abc', 'state' => 'Pending'], 202)]);
        $this->student(['phone' => '9876543211']);

        $this->postJson('/api/auth/send-otp', ['identifier' => '+91 98765 43211'])->assertOk()->assertJson(['delivery' => 'sms']);
        Http::assertSent(fn ($req) => $req->url() === 'http://10.0.0.5:8080/message'
            && $req['phoneNumbers'] === ['+919876543211']
            && $req->hasHeader('Authorization'));
    }

    public function test_options_reports_channels(): void
    {
        $this->getJson('/api/auth/options')->assertOk()
            ->assertJsonStructure(['otp' => ['enabled', 'sms_configured', 'email_configured', 'test_mode'], 'google' => ['enabled']]);
    }

    public function test_admin_can_create_and_update_a_series_with_tests(): void
    {
        $this->actingAsStudent($this->admin());
        $t1 = $this->makeTest(count: 1);
        $t2 = $this->makeTest(count: 1);
        $t3 = $this->makeTest(count: 1);

        $res = $this->post('/api/admin/test-series', [
            'name_en' => 'Launch Series', 'exam_id' => $t1->exam_id, 'is_published' => 1, 'test_ids' => [$t1->id, $t2->id],
        ])->assertCreated();
        $sid = $res->json('id');
        $this->assertSame(2, $res->json('tests_count'));

        $this->postJson("/api/admin/test-series/{$sid}/update", ['test_ids' => [$t3->id]])->assertOk()->assertJson(['tests_count' => 1]);
        $this->assertSame([$t3->id], TestSeries::find($sid)->tests()->pluck('tests.id')->all());

        $list = $this->getJson('/api/admin/test-series')->assertOk();
        $this->assertSame(1, collect($list->json())->firstWhere('id', $sid)['tests_count']);

        // Students see it with the right count
        $this->actingAsStudent();
        $this->getJson('/api/test-series')->assertOk()->assertJsonFragment(['stats' => ['total_tests' => 1]]);
    }
}
