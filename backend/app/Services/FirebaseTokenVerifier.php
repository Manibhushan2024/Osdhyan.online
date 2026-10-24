<?php

namespace App\Services;

use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Verifies a Firebase Authentication ID token (the JWT the Firebase SDK on
 * Android / web hands the client after phone OTP, e-mail link or Google
 * sign-in), following Google's "verify ID tokens using a third-party JWT
 * library" rules:
 *
 *  - RS256, signed by one of Google's securetoken X.509 certs (header `kid`)
 *  - iss = https://securetoken.google.com/{project}, aud = {project}
 *  - exp in the future; iat and auth_time not in the future (60 s skew)
 *  - sub is a non-empty string of at most 128 characters
 *
 * The certificates are fetched with Laravel Http and cached for the
 * Cache-Control max-age Google sends (they rotate every few hours).
 * Signature checking uses firebase/php-jwt, already installed via Socialite.
 */
class FirebaseTokenVerifier
{
    public const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    private const CACHE_KEY = 'firebase:securetoken:x509';
    private const REFRESH_LOCK = 'firebase:securetoken:x509:refreshed';
    private const LEEWAY = 60;

    public function projectId(): ?string
    {
        $id = trim((string) config('services.firebase.project_id'));

        return $id === '' ? null : $id;
    }

    public function isConfigured(): bool
    {
        return $this->projectId() !== null;
    }

    /**
     * @return array<string, mixed> the verified claims
     *
     * @throws FirebaseTokenException
     */
    public function verify(string $idToken): array
    {
        $projectId = $this->projectId();
        if ($projectId === null) {
            throw new FirebaseTokenException('Firebase sign-in is not set up yet.', 503);
        }

        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw new FirebaseTokenException('Malformed Firebase ID token.');
        }
        $header = json_decode((string) JWT::urlsafeB64Decode($parts[0]), true);
        if (!is_array($header) || ($header['alg'] ?? null) !== 'RS256' || !is_string($header['kid'] ?? null) || $header['kid'] === '') {
            throw new FirebaseTokenException('Firebase ID token has an invalid header.');
        }

        $kid = $header['kid'];
        $certs = $this->certificates();
        if (!isset($certs[$kid])) {
            // Keys rotate: refresh once (at most every 5 minutes) before giving up.
            $certs = $this->certificates(refresh: true);
        }
        if (!isset($certs[$kid])) {
            throw new FirebaseTokenException('Firebase ID token was signed with an unknown key.');
        }

        $publicKey = openssl_pkey_get_public($certs[$kid]);
        $pem = $publicKey ? (openssl_pkey_get_details($publicKey)['key'] ?? null) : null;
        if (!$pem) {
            throw new FirebaseTokenException('Firebase signing certificate could not be read.');
        }

        $previousLeeway = JWT::$leeway;
        JWT::$leeway = self::LEEWAY;
        try {
            $payload = JWT::decode($idToken, new Key($pem, 'RS256'));
        } catch (ExpiredException) {
            throw new FirebaseTokenException('Firebase ID token has expired. Please sign in again.');
        } catch (\Throwable $e) {
            throw new FirebaseTokenException('Firebase ID token could not be verified.');
        } finally {
            JWT::$leeway = $previousLeeway;
        }

        $claims = json_decode(json_encode($payload), true) ?: [];
        $now = time();

        if (($claims['aud'] ?? null) !== $projectId) {
            throw new FirebaseTokenException('Firebase ID token was issued for a different project.');
        }
        if (($claims['iss'] ?? null) !== 'https://securetoken.google.com/' . $projectId) {
            throw new FirebaseTokenException('Firebase ID token has the wrong issuer.');
        }
        if (!is_numeric($claims['exp'] ?? null) || (int) $claims['exp'] <= $now) {
            throw new FirebaseTokenException('Firebase ID token has expired. Please sign in again.');
        }
        foreach (['iat', 'auth_time'] as $claim) {
            if (!is_numeric($claims[$claim] ?? null) || (int) $claims[$claim] > $now + self::LEEWAY) {
                throw new FirebaseTokenException("Firebase ID token has an invalid {$claim}.");
            }
        }
        $sub = $claims['sub'] ?? null;
        if (!is_string($sub) || $sub === '' || strlen($sub) > 128) {
            throw new FirebaseTokenException('Firebase ID token has an invalid subject.');
        }

        return $claims;
    }

    /** @return array<string, string> kid => PEM certificate */
    private function certificates(bool $refresh = false): array
    {
        if (!$refresh) {
            $cached = Cache::get(self::CACHE_KEY);
            if (is_array($cached) && $cached) {
                return $cached;
            }
        } elseif (!Cache::add(self::REFRESH_LOCK, 1, 300)) {
            return Cache::get(self::CACHE_KEY) ?: [];
        }

        try {
            $response = Http::timeout(10)->acceptJson()->get(self::CERTS_URL);
        } catch (\Throwable $e) {
            throw new FirebaseTokenException('Could not reach Google to verify the sign-in. Please try again.', 503);
        }
        $certs = $response->successful() ? $response->json() : null;
        if (!is_array($certs) || !$certs) {
            throw new FirebaseTokenException('Could not reach Google to verify the sign-in. Please try again.', 503);
        }

        $ttl = 3600;
        if (preg_match('/max-age=(\d+)/i', (string) $response->header('Cache-Control'), $m)) {
            $ttl = max(60, (int) $m[1]);
        }
        Cache::put(self::CACHE_KEY, $certs, $ttl);

        return $certs;
    }
}
