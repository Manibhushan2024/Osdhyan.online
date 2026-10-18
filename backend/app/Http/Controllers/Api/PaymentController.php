<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\TestSeries;
use App\Services\Payments\CheckoutService;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\Payments\PaymentsNotConfiguredException;
use App\Services\Payments\UserAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout)
    {
    }

    // ─── Config ───────────────────────────────────────────────────────────────

    /** What the browser needs to decide how to render the buy button. */
    public function config(): JsonResponse
    {
        $fake = PaymentGatewayFactory::fakeEnabled() && config('app.env') !== 'production';

        return response()->json([
            'provider'   => $fake ? 'fake' : 'razorpay',
            'key_id'     => $fake ? null : (config('services.razorpay.key_id') ?: null),
            'fake'       => $fake,
            'test_mode'  => $fake,
            'configured' => PaymentGatewayFactory::configured(),
            'currency'   => 'INR',
        ]);
    }

    // ─── Checkout ─────────────────────────────────────────────────────────────

    public function checkout(TestSeries $series): JsonResponse
    {
        $user = Auth::user();

        if (!$series->is_published && !$user->isAdminUser()) {
            return response()->json(['message' => 'This test series is not available.'], 404);
        }

        // Free series: plain enrolment, same as POST /test-series/{id}/enroll.
        if (!$series->requiresPayment()) {
            UserAccess::grant($user, $series);

            return response()->json([
                'enrolled' => true,
                'free'     => true,
                'message'  => 'Enrolled successfully',
            ]);
        }

        if (UserAccess::hasActiveAccess($user, $series)) {
            return response()->json([
                'enrolled'          => true,
                'already'           => true,
                'access_expires_at' => UserAccess::accessExpiresAt($user, $series)?->toISOString(),
                'message'           => 'You already have access to this series',
            ]);
        }

        try {
            $gateway = PaymentGatewayFactory::make();
        } catch (PaymentsNotConfiguredException $e) {
            return $this->notConfigured($e);
        }

        try {
            $order = $this->checkout->begin($user, $series, $gateway);
        } catch (PaymentGatewayException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'code'    => 'GATEWAY_ERROR',
            ], 502);
        }

        if ($gateway->isFake()) {
            return response()->json([
                'enrolled'          => true,
                'fake'              => true,
                'test_mode'         => true,
                'message'           => 'TEST MODE: order marked paid without charging anyone',
                'order'             => $order,
                'access_expires_at' => $order->expires_at?->toISOString(),
            ]);
        }

        return response()->json([
            'enrolled'          => false,
            'fake'              => false,
            'test_mode'         => false,
            'order_id'          => $order->id,
            'provider_order_id' => $order->provider_order_id,
            'amount'            => $order->amount,
            'currency'          => $order->currency,
            'key_id'            => $gateway->keyId(),
            'name'              => config('app.name', 'OSDHYAN'),
            'description'       => $series->name_en,
            'image'             => $series->image ? asset('storage/' . $series->image) : null,
            'prefill'           => [
                'name'    => $user->name,
                'email'   => $user->email,
                'contact' => $user->phone,
            ],
            'notes'             => [
                'order_id'       => (string) $order->id,
                'test_series_id' => (string) $series->id,
            ],
            'theme'             => ['color' => '#2563eb'],
        ]);
    }

    // ─── Verify (browser callback) ────────────────────────────────────────────

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id'            => 'required|integer',
            'razorpay_order_id'   => 'required|string|max:100',
            'razorpay_payment_id' => 'required|string|max:100',
            'razorpay_signature'  => 'required|string|max:200',
        ]);

        $user = Auth::user();

        /** @var Order|null $order */
        $order = Order::query()
            ->where('id', $data['order_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($order->provider_order_id !== $data['razorpay_order_id']) {
            return response()->json([
                'message' => 'Order mismatch.',
                'code'    => 'ORDER_MISMATCH',
            ], 422);
        }

        if ($order->isPaid()) {
            // Webhook (or a retried callback) already processed it.
            return $this->paidResponse($order->fresh(), $user, already: true);
        }

        try {
            $gateway = PaymentGatewayFactory::make();
        } catch (PaymentsNotConfiguredException $e) {
            return $this->notConfigured($e);
        }

        if (!$gateway->verifyPaymentSignature($data['razorpay_order_id'], $data['razorpay_payment_id'], $data['razorpay_signature'])) {
            Log::warning('payments.verify.bad_signature', [
                'order_id' => $order->id,
                'user_id'  => $user->id,
            ]);

            return response()->json([
                'message' => 'Payment signature could not be verified.',
                'code'    => 'INVALID_SIGNATURE',
            ], 422);
        }

        $order = $this->checkout->markPaid($order, $data['razorpay_payment_id'], $data['razorpay_signature'], 'verify');

        return $this->paidResponse($order, $user);
    }

    // ─── Webhook (no auth) ────────────────────────────────────────────────────

    public function webhook(Request $request): JsonResponse
    {
        $raw       = $request->getContent();
        $signature = (string) $request->header('X-Razorpay-Signature', '');

        $gateway = PaymentGatewayFactory::razorpay();
        if (!$gateway || !config('services.razorpay.webhook_secret')) {
            Log::error('payments.webhook.not_configured');

            return response()->json(['message' => 'Webhook not configured.'], 400);
        }

        if (!$gateway->verifyWebhookSignature($raw, $signature)) {
            Log::warning('payments.webhook.bad_signature', ['ip' => $request->ip()]);

            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $event = json_decode($raw, true);
        if (!is_array($event) || empty($event['event'])) {
            return response()->json(['message' => 'Malformed payload.'], 400);
        }

        $name    = (string) $event['event'];
        $payment = $event['payload']['payment']['entity'] ?? [];
        $orderEntity = $event['payload']['order']['entity'] ?? [];

        $providerOrderId = (string) ($payment['order_id'] ?? $orderEntity['id'] ?? '');
        $paymentId       = $payment['id'] ?? null;

        Log::info('payments.webhook.received', [
            'event'             => $name,
            'provider_order_id' => $providerOrderId,
            'payment_id'        => $paymentId,
        ]);

        if ($providerOrderId === '') {
            // Not an order-linked event (e.g. refund/settlement) — acknowledge.
            return response()->json(['ok' => true, 'ignored' => 'no_order']);
        }

        $order = Order::query()->where('provider_order_id', $providerOrderId)->first();
        if (!$order) {
            Log::warning('payments.webhook.unknown_order', ['provider_order_id' => $providerOrderId]);

            return response()->json(['ok' => true, 'ignored' => 'unknown_order']);
        }

        switch ($name) {
            case 'payment.captured':
            case 'order.paid':
                $this->checkout->markPaid($order, $paymentId, null, 'webhook:' . $name);
                break;

            case 'payment.failed':
                $reason = $payment['error_description'] ?? $payment['error_reason'] ?? $payment['error_code'] ?? 'Payment failed';
                $this->checkout->markFailed($order, is_string($reason) ? $reason : 'Payment failed', $paymentId);
                break;

            default:
                return response()->json(['ok' => true, 'ignored' => $name]);
        }

        return response()->json(['ok' => true]);
    }

    // ─── My orders ────────────────────────────────────────────────────────────

    public function myOrders(): JsonResponse
    {
        $orders = Order::query()
            ->with('testSeries:id,name_en,name_hi,image,is_paid,price,mrp,currency,validity_days')
            ->where('user_id', Auth::id())
            ->latest('id')
            ->limit(200)
            ->get();

        return response()->json($orders);
    }

    public function showOrder(int $id): JsonResponse
    {
        $order = Order::query()
            ->with('testSeries:id,name_en,name_hi,image,is_paid,price,mrp,currency,validity_days')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($order);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function paidResponse(Order $order, $user, bool $already = false): JsonResponse
    {
        return response()->json([
            'enrolled'  => true,
            'already'   => $already,
            'test_mode' => $order->is_test_mode,
            'order'     => $order,
            'enrolment' => [
                'test_series_id'    => $order->test_series_id,
                'access_expires_at' => UserAccess::accessExpiresAt($user, $order->test_series_id)?->toISOString(),
            ],
        ]);
    }

    private function notConfigured(PaymentsNotConfiguredException $e): JsonResponse
    {
        Log::error('payments.not_configured', ['reason' => $e->getMessage()]);

        return response()->json([
            'message' => $e->getMessage(),
            'code'    => $e->errorCode,
        ], 503);
    }
}
