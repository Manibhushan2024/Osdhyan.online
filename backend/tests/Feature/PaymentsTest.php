<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Test;
use App\Models\TestSeries;
use App\Models\User;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\Payments\PaymentsNotConfiguredException;
use App\Services\Payments\RazorpayGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class PaymentsTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    private const KEY_ID = 'rzp_test_abc123';
    private const KEY_SECRET = 'unit-test-key-secret';
    private const WEBHOOK_SECRET = 'unit-test-webhook-secret';

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        $this->useRazorpay();
    }

    // ─── Builders ─────────────────────────────────────────────────────────────

    private function useRazorpay(): void
    {
        config([
            'services.razorpay.key_id'         => self::KEY_ID,
            'services.razorpay.key_secret'     => self::KEY_SECRET,
            'services.razorpay.webhook_secret' => self::WEBHOOK_SECRET,
            'services.razorpay.fake'           => false,
        ]);
    }

    private function useFake(): void
    {
        config([
            'services.razorpay.key_id'     => null,
            'services.razorpay.key_secret' => null,
            'services.razorpay.fake'       => true,
        ]);
    }

    private function useNothing(): void
    {
        config([
            'services.razorpay.key_id'         => null,
            'services.razorpay.key_secret'     => null,
            'services.razorpay.webhook_secret' => null,
            'services.razorpay.fake'           => false,
        ]);
    }

    /** @param Test[] $tests */
    private function series(array $attributes = [], array $tests = []): TestSeries
    {
        $series = TestSeries::create(array_merge([
            'exam_id'      => $this->exam()->id,
            'name_en'      => 'Series ' . \Illuminate\Support\Str::random(4),
            'is_published' => true,
        ], $attributes));

        if ($tests) {
            $series->tests()->attach(array_map(fn (Test $t) => $t->id, $tests));
        }

        return $series->fresh();
    }

    private function paidSeries(array $attributes = [], array $tests = []): TestSeries
    {
        return $this->series(array_merge([
            'is_paid' => true,
            'price'   => 499,
            'mrp'     => 999,
        ], $attributes), $tests);
    }

    /** A test that is only ever unlocked by purchase. */
    private function lockedTest(): Test
    {
        return $this->makeTest(count: 2, attributes: ['is_free' => false]);
    }

    private function fakeRazorpayOrdersApi(string $orderId = 'order_RzpTest123'): void
    {
        Http::fake([
            RazorpayGateway::BASE_URL . '/orders' => Http::response([
                'id'       => $orderId,
                'entity'   => 'order',
                'amount'   => 49900,
                'currency' => 'INR',
                'status'   => 'created',
            ], 200),
        ]);
    }

    private function checkoutSignature(string $orderId, string $paymentId): string
    {
        return hash_hmac('sha256', "{$orderId}|{$paymentId}", self::KEY_SECRET);
    }

    private function webhookBody(string $event, string $providerOrderId, string $paymentId = 'pay_123', array $extra = []): string
    {
        return json_encode([
            'entity'  => 'event',
            'event'   => $event,
            'payload' => [
                'payment' => ['entity' => array_merge([
                    'id'       => $paymentId,
                    'order_id' => $providerOrderId,
                    'status'   => $event === 'payment.failed' ? 'failed' : 'captured',
                ], $extra)],
            ],
        ]);
    }

    private function postWebhook(string $body, ?string $signature = null)
    {
        $signature ??= hash_hmac('sha256', $body, self::WEBHOOK_SECRET);

        return $this->call('POST', '/api/webhooks/razorpay', [], [], [], [
            'HTTP_X_RAZORPAY_SIGNATURE' => $signature,
            'CONTENT_TYPE'              => 'application/json',
            'HTTP_ACCEPT'               => 'application/json',
        ], $body);
    }

    // ─── Enrolment ────────────────────────────────────────────────────────────

    public function test_free_series_enroll_works(): void
    {
        $user = $this->actingAsStudent();
        $series = $this->series();

        $this->postJson("/api/test-series/{$series->id}/enroll")
            ->assertOk()
            ->assertJson(['enrolled' => true]);

        $this->assertDatabaseHas('user_test_series', [
            'user_id'           => $user->id,
            'test_series_id'    => $series->id,
            'access_expires_at' => null,
            'order_id'          => null,
        ]);

        $this->getJson("/api/test-series/{$series->id}")
            ->assertOk()
            ->assertJson(['is_enrolled' => true, 'has_access' => true, 'requires_payment' => false]);
    }

    public function test_paid_series_enroll_returns_402(): void
    {
        $this->actingAsStudent();
        $series = $this->paidSeries();

        $this->postJson("/api/test-series/{$series->id}/enroll")
            ->assertStatus(402)
            ->assertJson([
                'code'     => 'PAYMENT_REQUIRED',
                'price'    => 499,
                'currency' => 'INR',
                'amount'   => 49900,
            ]);

        $this->assertDatabaseCount('user_test_series', 0);
    }

    public function test_checkout_on_free_series_just_enrolls(): void
    {
        $user = $this->actingAsStudent();
        $series = $this->series();

        $this->postJson("/api/test-series/{$series->id}/checkout")
            ->assertOk()
            ->assertJson(['enrolled' => true, 'free' => true]);

        $this->assertDatabaseHas('user_test_series', ['user_id' => $user->id, 'test_series_id' => $series->id]);
        $this->assertDatabaseCount('orders', 0);
    }

    // ─── Configuration ────────────────────────────────────────────────────────

    public function test_checkout_returns_503_when_payments_not_configured(): void
    {
        $this->useNothing();
        $this->actingAsStudent();
        $series = $this->paidSeries();

        $this->postJson("/api/test-series/{$series->id}/checkout")
            ->assertStatus(503)
            ->assertJson(['code' => 'PAYMENTS_NOT_CONFIGURED']);

        $this->getJson('/api/payments/config')
            ->assertOk()
            ->assertJson(['configured' => false, 'fake' => false]);
    }

    public function test_config_exposes_public_key_only(): void
    {
        $this->actingAsStudent();

        $res = $this->getJson('/api/payments/config')->assertOk();
        $res->assertJson(['provider' => 'razorpay', 'key_id' => self::KEY_ID, 'fake' => false, 'configured' => true]);
        $this->assertStringNotContainsString(self::KEY_SECRET, $res->getContent());
    }

    public function test_fake_gateway_is_refused_in_production(): void
    {
        $this->useFake();
        config(['app.env' => 'production']);

        $this->expectException(PaymentsNotConfiguredException::class);
        PaymentGatewayFactory::make();
    }

    public function test_checkout_rejects_fake_gateway_in_production(): void
    {
        $this->useFake();
        config(['app.env' => 'production']);
        $this->actingAsStudent();
        $series = $this->paidSeries();

        $this->postJson("/api/test-series/{$series->id}/checkout")
            ->assertStatus(503)
            ->assertJson(['code' => 'PAYMENTS_MISCONFIGURED']);

        $this->assertDatabaseCount('orders', 0);
        $this->getJson('/api/payments/config')->assertJson(['fake' => false, 'configured' => false]);
    }

    // ─── Fake gateway ─────────────────────────────────────────────────────────

    public function test_fake_gateway_checkout_enrolls_and_creates_paid_order(): void
    {
        $this->useFake();
        $user = $this->actingAsStudent();
        $series = $this->paidSeries(['validity_days' => 30]);

        $res = $this->postJson("/api/test-series/{$series->id}/checkout")
            ->assertOk()
            ->assertJson(['enrolled' => true, 'fake' => true, 'test_mode' => true]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertSame('paid', $order->status);
        $this->assertSame('fake', $order->provider);
        $this->assertSame(49900, $order->amount);
        $this->assertSame($user->id, $order->user_id);
        $this->assertNotNull($order->paid_at);
        $this->assertNotNull($order->expires_at);
        $this->assertTrue($res->json('order.is_test_mode'));

        $this->assertDatabaseHas('user_test_series', [
            'user_id'        => $user->id,
            'test_series_id' => $series->id,
            'order_id'       => $order->id,
        ]);

        $this->getJson("/api/test-series/{$series->id}")
            ->assertOk()
            ->assertJson(['has_access' => true]);
        $this->assertNotNull($this->getJson("/api/test-series/{$series->id}")->json('access_expires_at'));

        $enrolled = $this->getJson('/api/test-series/enrolled')->assertOk()->json();
        $this->assertCount(1, $enrolled);
        $this->assertSame($series->id, $enrolled[0]['id']);
        $this->assertTrue($enrolled[0]['has_access']);
        $this->assertNotNull($enrolled[0]['access_expires_at']);
        $this->assertArrayNotHasKey('pivot', $enrolled[0]);

        // Second checkout: already has access, no new order.
        $this->postJson("/api/test-series/{$series->id}/checkout")
            ->assertOk()
            ->assertJson(['enrolled' => true, 'already' => true]);
        $this->assertDatabaseCount('orders', 1);
    }

    // ─── Razorpay checkout + verify ───────────────────────────────────────────

    public function test_razorpay_checkout_creates_pending_order_with_provider_id(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $user = $this->actingAsStudent($this->student(['name' => 'Asha', 'phone' => '9876543210']));
        $series = $this->paidSeries();

        $res = $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk();

        $res->assertJson([
            'enrolled'          => false,
            'provider_order_id' => 'order_Abc',
            'amount'            => 49900,
            'currency'          => 'INR',
            'key_id'            => self::KEY_ID,
            'description'       => $series->name_en,
            'prefill'           => ['name' => 'Asha', 'email' => $user->email, 'contact' => '9876543210'],
        ]);

        $this->assertDatabaseHas('orders', [
            'id'                => $res->json('order_id'),
            'status'            => 'pending',
            'provider'          => 'razorpay',
            'provider_order_id' => 'order_Abc',
        ]);
        $this->assertDatabaseCount('user_test_series', 0);

        Http::assertSent(function ($request) {
            return $request->url() === RazorpayGateway::BASE_URL . '/orders'
                && $request['amount'] === 49900
                && $request['currency'] === 'INR'
                && $request->hasHeader('Authorization');
        });

        // A second checkout reuses the still-pending provider order.
        $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk()
            ->assertJson(['order_id' => $res->json('order_id')]);
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_signature_verification_accepts_valid_hmac_and_rejects_tampered(): void
    {
        $gateway = new RazorpayGateway(self::KEY_ID, self::KEY_SECRET, self::WEBHOOK_SECRET);

        $valid = $this->checkoutSignature('order_X', 'pay_Y');
        $this->assertTrue($gateway->verifyPaymentSignature('order_X', 'pay_Y', $valid));
        $this->assertFalse($gateway->verifyPaymentSignature('order_X', 'pay_Z', $valid));
        $this->assertFalse($gateway->verifyPaymentSignature('order_X', 'pay_Y', substr($valid, 0, -1) . 'f'));
        $this->assertFalse($gateway->verifyPaymentSignature('order_X', 'pay_Y', ''));

        $body = '{"event":"payment.captured"}';
        $this->assertTrue($gateway->verifyWebhookSignature($body, hash_hmac('sha256', $body, self::WEBHOOK_SECRET)));
        $this->assertFalse($gateway->verifyWebhookSignature($body . ' ', hash_hmac('sha256', $body, self::WEBHOOK_SECRET)));
        $this->assertFalse((new RazorpayGateway(self::KEY_ID, self::KEY_SECRET, null))->verifyWebhookSignature($body, 'x'));
    }

    public function test_verify_marks_order_paid_and_is_idempotent(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $user = $this->actingAsStudent();
        $series = $this->paidSeries(['validity_days' => 90]);

        $orderId = $this->postJson("/api/test-series/{$series->id}/checkout")->json('order_id');

        // Tampered signature → rejected, order stays pending.
        $this->postJson('/api/payments/verify', [
            'order_id'            => $orderId,
            'razorpay_order_id'   => 'order_Abc',
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature'  => $this->checkoutSignature('order_Abc', 'pay_999'),
        ])->assertStatus(422)->assertJson(['code' => 'INVALID_SIGNATURE']);
        $this->assertSame('pending', Order::find($orderId)->status);
        $this->assertDatabaseCount('user_test_series', 0);

        $payload = [
            'order_id'            => $orderId,
            'razorpay_order_id'   => 'order_Abc',
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature'  => $this->checkoutSignature('order_Abc', 'pay_123'),
        ];

        $first = $this->postJson('/api/payments/verify', $payload)->assertOk();
        $first->assertJson(['enrolled' => true, 'already' => false, 'order' => ['status' => 'paid', 'provider_payment_id' => 'pay_123']]);
        $this->assertNotNull($first->json('enrolment.access_expires_at'));

        $order = Order::find($orderId);
        $this->assertSame('paid', $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertDatabaseHas('user_test_series', [
            'user_id'        => $user->id,
            'test_series_id' => $series->id,
            'order_id'       => $order->id,
        ]);

        $paidAt = $order->paid_at;
        $this->travel(5)->minutes();

        $second = $this->postJson('/api/payments/verify', $payload)->assertOk();
        $second->assertJson(['enrolled' => true, 'already' => true]);
        $this->assertTrue($paidAt->equalTo(Order::find($orderId)->paid_at));
        $this->assertDatabaseCount('user_test_series', 1);
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_verify_rejects_order_of_another_user_or_mismatched_provider_order(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $this->actingAsStudent();
        $series = $this->paidSeries();
        $orderId = $this->postJson("/api/test-series/{$series->id}/checkout")->json('order_id');

        $this->postJson('/api/payments/verify', [
            'order_id'            => $orderId,
            'razorpay_order_id'   => 'order_Other',
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature'  => $this->checkoutSignature('order_Other', 'pay_1'),
        ])->assertStatus(422)->assertJson(['code' => 'ORDER_MISMATCH']);

        $this->actingAsStudent(); // a different student
        $this->postJson('/api/payments/verify', [
            'order_id'            => $orderId,
            'razorpay_order_id'   => 'order_Abc',
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature'  => $this->checkoutSignature('order_Abc', 'pay_1'),
        ])->assertNotFound();
    }

    // ─── Webhook ──────────────────────────────────────────────────────────────

    public function test_webhook_with_bad_signature_is_rejected(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $this->actingAsStudent();
        $series = $this->paidSeries();
        $orderId = $this->postJson("/api/test-series/{$series->id}/checkout")->json('order_id');

        $body = $this->webhookBody('payment.captured', 'order_Abc');

        $this->postWebhook($body, 'deadbeef')->assertStatus(400);
        $this->postWebhook($body, hash_hmac('sha256', $body, 'wrong-secret'))->assertStatus(400);
        $this->postWebhook($body . "\n", hash_hmac('sha256', $body, self::WEBHOOK_SECRET))->assertStatus(400);

        $this->assertSame('pending', Order::find($orderId)->status);
        $this->assertDatabaseCount('user_test_series', 0);
    }

    public function test_webhook_with_good_signature_marks_paid_and_enrolls(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $user = $this->actingAsStudent();
        $series = $this->paidSeries();
        $orderId = $this->postJson("/api/test-series/{$series->id}/checkout")->json('order_id');

        $this->postWebhook($this->webhookBody('payment.captured', 'order_Abc', 'pay_wh1'))
            ->assertOk()
            ->assertJson(['ok' => true]);

        $order = Order::find($orderId);
        $this->assertSame('paid', $order->status);
        $this->assertSame('pay_wh1', $order->provider_payment_id);
        $this->assertDatabaseHas('user_test_series', ['user_id' => $user->id, 'test_series_id' => $series->id, 'order_id' => $order->id]);

        // Redelivery (order.paid) is a no-op.
        $this->postWebhook($this->webhookBody('order.paid', 'order_Abc', 'pay_wh1'))->assertOk();
        $this->assertDatabaseCount('user_test_series', 1);

        // A late payment.failed never downgrades a paid order.
        $this->postWebhook($this->webhookBody('payment.failed', 'order_Abc', 'pay_wh2', ['error_description' => 'Declined']))->assertOk();
        $this->assertSame('paid', Order::find($orderId)->status);

        // Unknown orders are acknowledged so Razorpay stops retrying.
        $this->postWebhook($this->webhookBody('payment.captured', 'order_Nope'))->assertOk()->assertJson(['ignored' => 'unknown_order']);
    }

    public function test_webhook_payment_failed_marks_pending_order_failed(): void
    {
        $this->fakeRazorpayOrdersApi('order_Abc');
        $this->actingAsStudent();
        $series = $this->paidSeries();
        $orderId = $this->postJson("/api/test-series/{$series->id}/checkout")->json('order_id');

        $this->postWebhook($this->webhookBody('payment.failed', 'order_Abc', 'pay_f', ['error_description' => 'Card declined']))->assertOk();

        $order = Order::find($orderId);
        $this->assertSame('failed', $order->status);
        $this->assertSame('Card declined', $order->failure_reason);
        $this->assertDatabaseCount('user_test_series', 0);
    }

    public function test_webhook_requires_configured_secret(): void
    {
        config(['services.razorpay.webhook_secret' => null]);
        $body = $this->webhookBody('payment.captured', 'order_Abc');

        $this->postWebhook($body, hash_hmac('sha256', $body, self::WEBHOOK_SECRET))->assertStatus(400);
    }

    // ─── Attempt gating ───────────────────────────────────────────────────────

    public function test_start_attempt_in_paid_series_requires_purchase(): void
    {
        $this->useFake();
        $this->actingAsStudent();
        $test = $this->lockedTest();
        $series = $this->paidSeries([], [$test]);

        $this->postJson("/api/tests/{$test->id}/attempts")
            ->assertForbidden()
            ->assertJson(['code' => 'PAYMENT_REQUIRED', 'test_series_id' => $series->id]);

        $detail = $this->getJson("/api/test-series/{$series->id}")->assertOk();
        $this->assertTrue(collect($detail->json('content'))->flatten(1)->first()['is_locked']);

        $this->getJson('/api/tests')->assertOk()
            ->assertJsonFragment(['id' => $test->id, 'requires_purchase' => true, 'is_locked' => true]);

        $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk()->assertJson(['enrolled' => true]);

        $this->postJson("/api/tests/{$test->id}/attempts")->assertOk();
        $this->getJson('/api/tests')->assertOk()
            ->assertJsonFragment(['id' => $test->id, 'requires_purchase' => true, 'is_locked' => false]);
    }

    public function test_free_tests_and_tests_in_a_free_series_are_never_locked(): void
    {
        $this->actingAsStudent();

        $freeFlag = $this->makeTest(count: 2, attributes: ['is_free' => true]);
        $this->paidSeries([], [$freeFlag]);
        $this->postJson("/api/tests/{$freeFlag->id}/attempts")->assertOk();

        $inBoth = $this->lockedTest();
        $this->paidSeries([], [$inBoth]);
        $this->series([], [$inBoth]);
        $this->postJson("/api/tests/{$inBoth->id}/attempts")->assertOk();

        $this->getJson('/api/tests')->assertOk()
            ->assertJsonFragment(['id' => $inBoth->id, 'requires_purchase' => false, 'is_locked' => false]);
    }

    public function test_admins_bypass_paid_gate(): void
    {
        $this->actingAsStudent($this->admin('editor'));
        $test = $this->lockedTest();
        $this->paidSeries([], [$test]);

        $this->postJson("/api/tests/{$test->id}/attempts")->assertOk();
    }

    public function test_validity_expiry_blocks_access(): void
    {
        $this->useFake();
        $this->actingAsStudent();
        $test = $this->lockedTest();
        $series = $this->paidSeries(['validity_days' => 30], [$test]);

        $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk();
        $this->postJson("/api/tests/{$test->id}/attempts")->assertOk();

        $this->travel(29)->days();
        $this->getJson("/api/test-series/{$series->id}")->assertJson(['has_access' => true, 'is_enrolled' => true]);

        $this->travel(2)->days();
        $this->getJson("/api/test-series/{$series->id}")->assertJson(['has_access' => false, 'is_enrolled' => true]);
        // A fresh test (no ongoing attempt to resume) is locked again.
        $another = $this->lockedTest();
        $series->tests()->attach($another->id);
        $this->postJson("/api/tests/{$another->id}/attempts")
            ->assertForbidden()
            ->assertJson(['code' => 'PAYMENT_REQUIRED']);

        // Enroll endpoint also refuses, and checkout starts a new purchase.
        $this->postJson("/api/test-series/{$series->id}/enroll")->assertStatus(402);
        $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk()->assertJson(['enrolled' => true, 'fake' => true]);
        $this->assertDatabaseCount('orders', 2);
        $this->postJson("/api/tests/{$another->id}/attempts")->assertOk();
    }

    // ─── Orders ───────────────────────────────────────────────────────────────

    public function test_students_see_only_their_own_orders(): void
    {
        $this->useFake();
        $me = $this->actingAsStudent();
        $series = $this->paidSeries();
        $this->postJson("/api/test-series/{$series->id}/checkout")->assertOk();

        $other = $this->student();
        Order::create(['user_id' => $other->id, 'test_series_id' => $series->id, 'amount' => 100, 'currency' => 'INR', 'status' => 'pending', 'provider' => 'fake']);

        $list = $this->getJson('/api/orders')->assertOk()->json();
        $this->assertCount(1, $list);
        $this->assertSame($me->id, $list[0]['user_id']);
        $this->assertSame($series->name_en, $list[0]['test_series']['name_en']);
        $this->assertArrayNotHasKey('provider_signature', $list[0]);

        $this->getJson("/api/orders/{$list[0]['id']}")->assertOk();
        $this->getJson('/api/orders/' . Order::where('user_id', $other->id)->value('id'))->assertNotFound();
    }

    public function test_admin_summary_numbers(): void
    {
        $admin = $this->admin();
        $a = $this->student();
        $b = $this->student();
        $s1 = $this->paidSeries(['price' => 500]);
        $s2 = $this->paidSeries(['price' => 300]);

        $paid = fn (User $u, TestSeries $s, int $amount, $paidAt) => Order::create([
            'user_id' => $u->id, 'test_series_id' => $s->id, 'amount' => $amount, 'currency' => 'INR',
            'status' => 'paid', 'provider' => 'razorpay', 'paid_at' => $paidAt,
            'provider_order_id' => 'order_' . \Illuminate\Support\Str::random(8),
        ]);

        $paid($a, $s1, 50000, now());                 // today
        $paid($b, $s1, 50000, now()->subDays(3));     // 7d
        $paid($a, $s2, 30000, now()->subDays(20));    // 30d
        $paid($b, $s2, 30000, now()->subDays(45));    // total only
        Order::create(['user_id' => $a->id, 'test_series_id' => $s2->id, 'amount' => 30000, 'currency' => 'INR', 'status' => 'failed', 'provider' => 'razorpay']);
        Order::create(['user_id' => $b->id, 'test_series_id' => $s2->id, 'amount' => 30000, 'currency' => 'INR', 'status' => 'pending', 'provider' => 'razorpay']);

        // Students may not read it.
        $this->actingAsStudent($a);
        $this->getJson('/api/admin/orders/summary')->assertForbidden();

        $this->actingAsStudent($admin);
        $summary = $this->getJson('/api/admin/orders/summary')->assertOk()->json();

        $this->assertSame(50000, $summary['revenue']['today']);
        $this->assertSame(100000, $summary['revenue']['7d']);
        $this->assertSame(130000, $summary['revenue']['30d']);
        $this->assertSame(160000, $summary['revenue']['total']);
        $this->assertSame(1600.0, (float) $summary['revenue_rupees']['total']);
        $this->assertSame(4, $summary['paid_count']);
        $this->assertSame(1, $summary['failed_count']);
        $this->assertSame(1, $summary['pending_count']);
        $this->assertSame($s1->id, $summary['by_series'][0]['test_series_id']);
        $this->assertSame(100000, $summary['by_series'][0]['revenue']);
        $this->assertSame(2, $summary['by_series'][0]['orders_count']);

        $page = $this->getJson('/api/admin/orders?status=paid&per_page=10')->assertOk()->json();
        $this->assertSame(4, $page['total']);
        $this->assertSame($b->email, collect($page['data'])->firstWhere('user_id', $b->id)['user']['email']);

        $this->assertSame(1, $this->getJson('/api/admin/orders?status=failed')->json('total'));
        $this->assertSame(2, $this->getJson("/api/admin/orders?test_series_id={$s1->id}")->json('total'));
        $this->assertSame(1, $this->getJson('/api/admin/orders?q=' . urlencode($a->email) . '&status=paid&test_series_id=' . $s1->id)->json('total'));
    }

    public function test_admin_can_set_pricing_on_series(): void
    {
        $this->actingAsStudent($this->admin());

        $created = $this->postJson('/api/admin/test-series', [
            'name_en' => 'Prime Pack', 'is_paid' => true, 'price' => 799, 'mrp' => 1499, 'validity_days' => 180,
        ])->assertCreated()->json();

        $this->assertTrue($created['is_paid']);
        $this->assertSame('799.00', (string) $created['price']);
        $this->assertSame(180, $created['validity_days']);

        $this->postJson('/api/admin/test-series', ['name_en' => 'Bad', 'price' => 500, 'mrp' => 100])
            ->assertStatus(422);

        $updated = $this->postJson("/api/admin/test-series/{$created['id']}/update", [
            'price' => 599, 'validity_days' => 0,
        ])->assertOk()->json();
        $this->assertSame('599.00', (string) $updated['price']);
        $this->assertNull($updated['validity_days']);
    }
}
