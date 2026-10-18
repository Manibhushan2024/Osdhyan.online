<?php

namespace App\Services\Payments;

/**
 * Picks the gateway from config('services.razorpay'). Tests (or a service
 * provider) may bind PaymentGateway in the container to override it.
 */
class PaymentGatewayFactory
{
    public static function fakeEnabled(): bool
    {
        return (bool) config('services.razorpay.fake', false);
    }

    public static function hasRazorpayKeys(): bool
    {
        return filled(config('services.razorpay.key_id')) && filled(config('services.razorpay.key_secret'));
    }

    /** True when a checkout can proceed (real keys or the fake gateway). */
    public static function configured(): bool
    {
        if (self::fakeEnabled()) {
            return config('app.env') !== 'production';
        }

        return self::hasRazorpayKeys();
    }

    /**
     * @throws PaymentsNotConfiguredException
     */
    public static function make(): PaymentGateway
    {
        if (app()->bound(PaymentGateway::class)) {
            return app(PaymentGateway::class);
        }

        if (self::fakeEnabled()) {
            if (config('app.env') === 'production') {
                throw PaymentsNotConfiguredException::fakeInProduction();
            }

            return new FakeGateway();
        }

        if (!self::hasRazorpayKeys()) {
            throw PaymentsNotConfiguredException::missingKeys();
        }

        return new RazorpayGateway(
            (string) config('services.razorpay.key_id'),
            (string) config('services.razorpay.key_secret'),
            config('services.razorpay.webhook_secret') ?: null,
        );
    }

    /**
     * Gateway used for the webhook endpoint: always Razorpay, since only
     * Razorpay posts webhooks. Returns null when keys are missing.
     */
    public static function razorpay(): ?RazorpayGateway
    {
        if (!self::hasRazorpayKeys()) {
            return null;
        }

        return new RazorpayGateway(
            (string) config('services.razorpay.key_id'),
            (string) config('services.razorpay.key_secret'),
            config('services.razorpay.webhook_secret') ?: null,
        );
    }
}
