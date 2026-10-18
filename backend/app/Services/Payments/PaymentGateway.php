<?php

namespace App\Services\Payments;

interface PaymentGateway
{
    /** 'razorpay' | 'fake' */
    public function name(): string;

    /** True for the local development gateway that never charges anyone. */
    public function isFake(): bool;

    /** Public key the browser checkout needs (null for the fake gateway). */
    public function keyId(): ?string;

    /**
     * Create a provider-side order.
     *
     * @param  array<string, scalar> $notes
     * @return array{id: string, amount: int, currency: string, raw?: array}
     *
     * @throws PaymentGatewayException
     */
    public function createOrder(int $amountPaise, string $currency, string $receipt, array $notes = []): array;

    /** Checkout callback signature: HMAC-SHA256("{order_id}|{payment_id}", key_secret). */
    public function verifyPaymentSignature(string $orderId, string $paymentId, string $signature): bool;

    /** Webhook signature: HMAC-SHA256(raw body, webhook_secret). */
    public function verifyWebhookSignature(string $rawBody, string $headerSignature): bool;
}
