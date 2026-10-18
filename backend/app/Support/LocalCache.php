<?php

namespace App\Support;

/**
 * Per-server in-memory cache (APCu) in front of the shared Redis cache.
 *
 * Exam payloads are identical for every student; serving them from each
 * server's own memory avoids moving ~200 KB per request out of Redis when
 * thousands of students open a test together. Entries live a short time
 * (other servers can't be told to drop them), so admin edits show up within
 * TTL seconds. A no-op when APCu isn't installed (e.g. local Windows dev).
 */
class LocalCache
{
    public const TTL = 60;

    public static function enabled(): bool
    {
        static $enabled = null;

        return $enabled ??= function_exists('apcu_fetch') && filter_var(ini_get('apc.enabled'), FILTER_VALIDATE_BOOL);
    }

    public static function get(string $key): mixed
    {
        if (!self::enabled()) {
            return null;
        }
        $value = apcu_fetch($key, $hit);

        return $hit ? $value : null;
    }

    public static function put(string $key, mixed $value, int $ttl = self::TTL): void
    {
        if (self::enabled()) {
            apcu_store($key, $value, $ttl);
        }
    }

    public static function forget(string $key): void
    {
        if (self::enabled()) {
            apcu_delete($key);
        }
    }
}
