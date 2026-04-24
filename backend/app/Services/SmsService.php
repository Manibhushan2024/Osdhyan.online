<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SmsService
{
    public function sendOtp(string $phone, int|string $otp): bool
    {
        // Recovery-safe default: log OTPs until a real SMS gateway is wired.
        Log::info('SmsService OTP dispatch', [
            'phone' => $phone,
            'otp' => (string) $otp,
            'driver' => config('services.sms.driver', 'log'),
        ]);

        return true;
    }
}
