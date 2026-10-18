<?php

namespace App\Services;

use App\Support\PhoneNumber;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * OTP delivery over SMS. Provider is chosen by SMS_PROVIDER:
 *
 *   log       — no gateway; the OTP is only written to the log (default)
 *   msg91     — https://msg91.com  (needs SMS_API_KEY = authkey, SMS_TEMPLATE_ID = DLT OTP template)
 *   fast2sms  — https://www.fast2sms.com (SMS_API_KEY; "otp" route needs no DLT template)
 *   textlocal — https://www.textlocal.in (SMS_API_KEY, SMS_SENDER_ID = 6-char DLT sender)
 *   android   — your own Android phone + SIM running the open-source
 *               "SMS Gateway for Android" app (capcom6) in Local Server mode:
 *               SMS_GATEWAY_URL=http://<phone-ip>:8080, SMS_GATEWAY_USER, SMS_GATEWAY_PASSWORD.
 *               Free, no DLT paperwork; fine for hundreds of OTPs a day.
 *
 * sendOtp() returns true only when a gateway accepted the message; the
 * caller falls back to e-mail / test-mode OTP otherwise.
 */
class SmsService
{
    public function provider(): string
    {
        return strtolower((string) config('services.sms.provider', 'log')) ?: 'log';
    }

    public function isConfigured(): bool
    {
        if ($this->provider() === 'android') {
            return !empty(config('services.sms.gateway_url'));
        }

        return $this->provider() !== 'log' && !empty(config('services.sms.api_key'));
    }

    public function sendOtp(string $phone, int|string $otp): bool
    {
        $national = PhoneNumber::normalize($phone) ?? preg_replace('/\D+/', '', $phone);
        $otp = (string) $otp;

        if (!$this->isConfigured()) {
            Log::info('SMS OTP (log driver — not sent)', ['phone' => PhoneNumber::mask($national), 'otp' => $otp]);

            return false;
        }

        $ok = match ($this->provider()) {
            'msg91'     => $this->msg91($national, $otp),
            'fast2sms'  => $this->fast2sms($national, $otp),
            'textlocal' => $this->textlocal($national, $otp),
            'android'   => $this->androidGateway($national, $otp),
            default     => throw new RuntimeException('Unknown SMS provider ' . $this->provider()),
        };

        Log::info('SMS OTP dispatched', ['provider' => $this->provider(), 'phone' => PhoneNumber::mask($national), 'ok' => $ok]);

        return $ok;
    }

    private function message(string $otp): string
    {
        return "{$otp} is your OSDHYAN verification code. Valid for 10 minutes. Do not share it with anyone.";
    }

    private function msg91(string $national, string $otp): bool
    {
        $res = Http::timeout(10)
            ->withHeaders(['authkey' => config('services.sms.api_key')])
            ->post('https://control.msg91.com/api/v5/otp', [
                'template_id' => config('services.sms.template_id'),
                'mobile'      => PhoneNumber::e164($national),
                'otp'         => $otp,
                'otp_expiry'  => 10,
            ]);
        $this->guard($res, 'msg91');

        return ($res->json('type') ?? '') === 'success';
    }

    private function fast2sms(string $national, string $otp): bool
    {
        $res = Http::timeout(10)
            ->withHeaders(['authorization' => config('services.sms.api_key')])
            ->asForm()
            ->post('https://www.fast2sms.com/dev/bulkV2', [
                'route'            => 'otp',
                'variables_values' => $otp,
                'numbers'          => $national,
                'flash'            => 0,
            ]);
        $this->guard($res, 'fast2sms');

        return (bool) ($res->json('return') ?? false);
    }

    private function textlocal(string $national, string $otp): bool
    {
        $res = Http::timeout(10)->asForm()->post('https://api.textlocal.in/send/', [
            'apikey'  => config('services.sms.api_key'),
            'numbers' => PhoneNumber::e164($national),
            'sender'  => config('services.sms.sender_id', 'OSDHYN'),
            'message' => $this->message($otp),
        ]);
        $this->guard($res, 'textlocal');

        return ($res->json('status') ?? '') === 'success';
    }

    /** capcom6/android-sms-gateway local server: POST /message, Basic auth, 202 Accepted. */
    private function androidGateway(string $national, string $otp): bool
    {
        $base = rtrim((string) config('services.sms.gateway_url'), '/');
        $req = Http::timeout(15)->acceptJson();
        if (config('services.sms.gateway_user')) {
            $req = $req->withBasicAuth((string) config('services.sms.gateway_user'), (string) config('services.sms.gateway_password'));
        }
        $res = $req->post($base . '/message', [
            'message'      => $this->message($otp),
            'phoneNumbers' => ['+' . PhoneNumber::e164($national)],
            'ttl'          => 600,
        ]);
        $this->guard($res, 'android-gateway');

        return in_array($res->status(), [200, 201, 202], true);
    }

    private function guard($res, string $provider): void
    {
        if (!$res->successful()) {
            throw new RuntimeException("{$provider} SMS API error HTTP {$res->status()}: " . mb_substr($res->body(), 0, 300));
        }
    }
}
