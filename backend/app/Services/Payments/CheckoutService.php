<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\TestSeries;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Order lifecycle: create → (gateway) → paid/failed, plus enrolment on
 * payment. All "mark paid" paths are idempotent so the checkout callback and
 * the webhook can both fire for the same payment.
 */
class CheckoutService
{
    /** Reuse an unpaid provider order for this long before creating a new one. */
    private const REUSE_PENDING_MINUTES = 60 * 12;

    /**
     * Begin checkout for a paid series. Returns either a paid order (fake
     * gateway) or a pending order carrying the provider order id.
     */
    public function begin(User $user, TestSeries $series, PaymentGateway $gateway): Order
    {
        $amount   = $series->priceInPaise();
        $currency = $series->currencyCode();

        if ($gateway->isFake()) {
            $order = $this->newOrder($user, $series, $amount, $currency, $gateway->name());
            $provider = $gateway->createOrder($amount, $currency, "order_{$order->id}", $this->notes($user, $series, $order));
            $order->forceFill(['provider_order_id' => $provider['id']])->save();

            /** @var FakeGateway $gateway */
            return $this->markPaid($order, $gateway->fakePaymentId(), 'fake', 'fake');
        }

        $reusable = Order::query()
            ->where('user_id', $user->id)
            ->where('test_series_id', $series->id)
            ->where('status', Order::STATUS_PENDING)
            ->where('provider', $gateway->name())
            ->where('amount', $amount)
            ->where('currency', $currency)
            ->whereNotNull('provider_order_id')
            ->where('created_at', '>=', now()->subMinutes(self::REUSE_PENDING_MINUTES))
            ->latest('id')
            ->first();

        if ($reusable) {
            return $reusable;
        }

        $order = $this->newOrder($user, $series, $amount, $currency, $gateway->name());

        try {
            $provider = $gateway->createOrder($amount, $currency, "order_{$order->id}", $this->notes($user, $series, $order));
        } catch (PaymentGatewayException $e) {
            $order->forceFill([
                'status'         => Order::STATUS_FAILED,
                'failure_reason' => mb_substr($e->getMessage(), 0, 500),
            ])->save();
            throw $e;
        }

        $order->forceFill([
            'provider_order_id' => $provider['id'],
            'metadata'          => array_merge($order->metadata ?? [], ['provider_order' => $provider['raw'] ?? null]),
        ])->save();

        return $order;
    }

    /**
     * Mark an order paid and enrol the user. Safe to call repeatedly.
     */
    public function markPaid(Order $order, ?string $paymentId, ?string $signature = null, string $source = 'verify'): Order
    {
        return DB::transaction(function () use ($order, $paymentId, $signature, $source) {
            /** @var Order $locked */
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->isPaid()) {
                // Already processed (e.g. webhook raced the browser callback).
                $this->ensureEnrolled($locked);

                return $locked;
            }

            $series = $locked->testSeries()->firstOrFail();

            $locked->forceFill([
                'status'              => Order::STATUS_PAID,
                'provider_payment_id' => $paymentId ?: $locked->provider_payment_id,
                'provider_signature'  => $signature ?: $locked->provider_signature,
                'paid_at'             => now(),
                'expires_at'          => $series->accessExpiryFromNow(),
                'failure_reason'      => null,
                'metadata'            => array_merge($locked->metadata ?? [], ['paid_via' => $source]),
            ])->save();

            UserAccess::grant($locked->user()->firstOrFail(), $series, $locked);

            Log::info('payments.order.paid', [
                'order_id'   => $locked->id,
                'user_id'    => $locked->user_id,
                'series_id'  => $locked->test_series_id,
                'amount'     => $locked->amount,
                'provider'   => $locked->provider,
                'payment_id' => $paymentId,
                'source'     => $source,
            ]);

            return $locked->fresh();
        });
    }

    /** Only pending orders can fail; a paid order stays paid. */
    public function markFailed(Order $order, ?string $reason, ?string $paymentId = null): Order
    {
        return DB::transaction(function () use ($order, $reason, $paymentId) {
            /** @var Order $locked */
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if (!$locked->isPending()) {
                return $locked;
            }

            $locked->forceFill([
                'status'              => Order::STATUS_FAILED,
                'failure_reason'      => mb_substr((string) ($reason ?: 'Payment failed'), 0, 500),
                'provider_payment_id' => $paymentId ?: $locked->provider_payment_id,
            ])->save();

            Log::warning('payments.order.failed', [
                'order_id' => $locked->id,
                'reason'   => $reason,
            ]);

            return $locked;
        });
    }

    /** Re-grant enrolment for a paid order (idempotent repair path). */
    private function ensureEnrolled(Order $order): void
    {
        $user   = $order->user()->first();
        $series = $order->testSeries()->first();
        if ($user && $series) {
            UserAccess::grant($user, $series, $order);
        }
    }

    private function newOrder(User $user, TestSeries $series, int $amount, string $currency, string $provider): Order
    {
        return Order::create([
            'user_id'        => $user->id,
            'test_series_id' => $series->id,
            'amount'         => $amount,
            'currency'       => $currency,
            'status'         => Order::STATUS_PENDING,
            'provider'       => $provider,
            'metadata'       => [
                'series_name'   => $series->name_en,
                'price'         => (string) $series->price,
                'mrp'           => $series->mrp !== null ? (string) $series->mrp : null,
                'validity_days' => $series->validity_days,
            ],
        ]);
    }

    private function notes(User $user, TestSeries $series, Order $order): array
    {
        return [
            'order_id'       => (string) $order->id,
            'user_id'        => (string) $user->id,
            'test_series_id' => (string) $series->id,
            'series'         => (string) $series->name_en,
        ];
    }
}
