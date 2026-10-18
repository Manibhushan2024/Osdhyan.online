<?php

namespace App\Services\Payments;

use Illuminate\Support\Str;

/**
 * Local development gateway (PAYMENTS_FAKE=true). Orders are "paid" the
 * moment they are created; nothing leaves the machine. The factory refuses
 * to build it when APP_ENV=production.
 */
class FakeGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'fake';
    }

    public function isFake(): bool
    {
        return true;
    }

    public function keyId(): ?string
    {
        return null;
    }

    public function createOrder(int $amountPaise, string $currency, string $receipt, array $notes = []): array
    {
        return [
            'id'       => 'fake_order_' . Str::lower(Str::random(14)),
            'amount'   => $amountPaise,
            'currency' => $currency,
            'raw'      => ['receipt' => $receipt, 'notes' => $notes, 'test_mode' => true],
        ];
    }

    public function fakePaymentId(): string
    {
        return 'fake_pay_' . Str::lower(Str::random(14));
    }

    public function verifyPaymentSignature(string $orderId, string $paymentId, string $signature): bool
    {
        return str_starts_with($orderId, 'fake_order_') && $signature === 'fake';
    }

    public function verifyWebhookSignature(string $rawBody, string $headerSignature): bool
    {
        return false; // the fake gateway never receives webhooks
    }
}
