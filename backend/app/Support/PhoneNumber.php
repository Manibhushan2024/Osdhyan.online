<?php

namespace App\Support;

/**
 * Indian mobile numbers arrive as "98765 43210", "+91-98765-43210",
 * "09876543210" … Everything is normalised to the 10-digit national
 * number; lookups try the formats older rows may have been stored in.
 */
class PhoneNumber
{
    /** 10-digit national number, or null when the input isn't a mobile number. */
    public static function normalize(?string $raw): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $raw);
        if ($digits === '') {
            return null;
        }
        if (strlen($digits) > 10 && str_starts_with($digits, '91')) {
            $digits = substr($digits, 2);
        }
        $digits = ltrim($digits, '0');
        if (strlen($digits) !== 10 || !preg_match('/^[6-9]\d{9}$/', $digits)) {
            return null;
        }

        return $digits;
    }

    /** Every spelling a stored phone column might use for this number. */
    public static function candidates(?string $raw): array
    {
        $raw = trim((string) $raw);
        $n = self::normalize($raw);
        if ($n === null) {
            return $raw === '' ? [] : [$raw];
        }

        return array_values(array_unique([$raw, $n, '0' . $n, '91' . $n, '+91' . $n, '+91 ' . $n]));
    }

    /** E.164 form for SMS gateways. */
    public static function e164(string $national): string
    {
        return '91' . $national;
    }

    public static function mask(string $national): string
    {
        return substr($national, 0, 2) . 'XXXXXX' . substr($national, -2);
    }
}
