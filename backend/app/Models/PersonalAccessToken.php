<?php

namespace App\Models;

use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

/**
 * Sanctum token model with a short lookup cache.
 *
 * Stock Sanctum costs, on every API request, a token lookup plus an UPDATE of
 * last_used_at. At thousands of concurrent students that per-request write
 * dominates DB load. Here the token row is cached for 2 minutes and
 * last_used_at is written at most every 5 minutes. The user itself is still
 * loaded fresh (one primary-key query), so role/profile changes apply at once.
 *
 * Logout calls forgetCached() so a revoked token stops working immediately;
 * tokens deleted any other way stay valid for up to AUTH_CACHE_TTL seconds.
 */
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    private const AUTH_CACHE_TTL = 120;

    public static function cacheKeyForHash(string $hash): string
    {
        return 'pat_' . $hash;
    }

    public static function findToken($token)
    {
        $hash = str_contains($token, '|')
            ? hash('sha256', explode('|', $token, 2)[1])
            : hash('sha256', $token);

        $cached = Cache::remember(self::cacheKeyForHash($hash), self::AUTH_CACHE_TTL, function () use ($token) {
            $instance = parent::findToken($token);
            $instance?->unsetRelations();

            // Cache::remember treats null as a miss; store an explicit marker
            // so invalid tokens don't hammer the DB either.
            return $instance ?? 'invalid';
        });

        return $cached === 'invalid' ? null : $cached;
    }

    public function forgetCached(): void
    {
        Cache::forget(self::cacheKeyForHash($this->token));
    }

    public function delete()
    {
        $this->forgetCached();

        return parent::delete();
    }

    public function save(array $options = [])
    {
        // Skip writes that only bump last_used_at unless it's >5 min stale.
        $dirty = $this->getDirty();
        if (array_keys($dirty) === ['last_used_at']) {
            $original = $this->getOriginal('last_used_at');
            if ($original && now()->parse($original)->gt(now()->subMinutes(5))) {
                $this->syncOriginal();
                return true;
            }
            // Refresh the cached copy so the 5-minute window is measured correctly.
            $saved = parent::save($options);
            Cache::put(self::cacheKeyForHash($this->token), $this->withoutRelations(), self::AUTH_CACHE_TTL);

            return $saved;
        }

        return parent::save($options);
    }
}
