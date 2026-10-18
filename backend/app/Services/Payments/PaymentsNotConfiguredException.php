<?php

namespace App\Services\Payments;

use RuntimeException;

/** No Razorpay keys and PAYMENTS_FAKE is off: checkout cannot proceed. */
class PaymentsNotConfiguredException extends RuntimeException
{
    public string $errorCode = 'PAYMENTS_NOT_CONFIGURED';

    public static function missingKeys(): self
    {
        return new self('Payments are not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET or enable PAYMENTS_FAKE for local development.');
    }

    public static function fakeInProduction(): self
    {
        $e = new self('PAYMENTS_FAKE cannot be enabled when APP_ENV=production.');
        $e->errorCode = 'PAYMENTS_MISCONFIGURED';

        return $e;
    }
}
