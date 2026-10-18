<?php

namespace App\Services\Payments;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Razorpay Orders API over plain HTTP (no SDK). Docs:
 * https://razorpay.com/docs/api/orders/
 */
class RazorpayGateway implements PaymentGateway
{
    public const BASE_URL = 'https://api.razorpay.com/v1';

    public function __construct(
        private readonly string $keyId,
        private readonly string $keySecret,
        private readonly ?string $webhookSecret = null,
    ) {
    }

    public function name(): string
    {
        return 'razorpay';
    }

    public function isFake(): bool
    {
        return false;
    }

    public function keyId(): ?string
    {
        return $this->keyId;
    }

    public function createOrder(int $amountPaise, string $currency, string $receipt, array $notes = []): array
    {
        if ($amountPaise < 100) {
            // Razorpay's minimum is INR 1.00
            throw new PaymentGatewayException('Order amount must be at least 100 paise.');
        }

        try {
            $response = Http::withBasicAuth($this->keyId, $this->keySecret)
                ->acceptJson()
                ->timeout(15)
                ->retry(2, 300, throw: false)
                ->post(self::BASE_URL . '/orders', [
                    'amount'   => $amountPaise,
                    'currency' => $currency,
                    'receipt'  => mb_substr($receipt, 0, 40),
                    'notes'    => $this->normaliseNotes($notes),
                ]);
        } catch (ConnectionException $e) {
            Log::error('razorpay.create_order.connection_failed', ['error' => $e->getMessage()]);
            throw new PaymentGatewayException('Could not reach Razorpay. Please try again.', 0, $e);
        }

        if (!$response->successful()) {
            $description = $response->json('error.description') ?? $response->body();
            Log::error('razorpay.create_order.failed', [
                'status' => $response->status(),
                'error'  => $description,
            ]);
            throw new PaymentGatewayException('Razorpay rejected the order: ' . mb_substr((string) $description, 0, 200));
        }

        $data = $response->json();
        if (empty($data['id'])) {
            throw new PaymentGatewayException('Razorpay returned no order id.');
        }

        return [
            'id'       => (string) $data['id'],
            'amount'   => (int) ($data['amount'] ?? $amountPaise),
            'currency' => (string) ($data['currency'] ?? $currency),
            'raw'      => $data,
        ];
    }

    public function verifyPaymentSignature(string $orderId, string $paymentId, string $signature): bool
    {
        if ($orderId === '' || $paymentId === '' || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $this->keySecret);

        return hash_equals($expected, strtolower(trim($signature)));
    }

    public function verifyWebhookSignature(string $rawBody, string $headerSignature): bool
    {
        if (!$this->webhookSecret || $headerSignature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $this->webhookSecret);

        return hash_equals($expected, strtolower(trim($headerSignature)));
    }

    /** Razorpay allows at most 15 notes, each a string of <= 256 chars. */
    private function normaliseNotes(array $notes): array
    {
        $out = [];
        foreach (array_slice($notes, 0, 15, true) as $key => $value) {
            $out[(string) $key] = mb_substr((string) $value, 0, 256);
        }

        return $out;
    }
}
