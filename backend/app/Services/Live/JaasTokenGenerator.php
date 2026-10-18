<?php

namespace App\Services\Live;

use App\Models\User;
use RuntimeException;

/**
 * Builds the RS256 JWT Jitsi-as-a-Service (8x8.vc) expects. Implemented
 * with openssl_sign so no Composer package is needed.
 *
 * @see https://developer.8x8.com/jaas/docs/api-keys-jwt
 */
class JaasTokenGenerator
{
    public function __construct(
        private readonly string $appId,
        private readonly string $apiKeyId,
        private readonly string $privateKeyPem,
        private readonly int $ttlSeconds = 3 * 3600,
    ) {
    }

    public static function fromConfig(): ?self
    {
        $cfg = config('services.live.jaas', []);
        $appId = (string) ($cfg['app_id'] ?? '');
        $kid = (string) ($cfg['api_key_id'] ?? '');
        $pem = (string) ($cfg['private_key'] ?? '');
        if ($appId === '' || $kid === '' || $pem === '') {
            return null;
        }

        // Allow the PEM to be pasted into .env with literal "\n".
        $pem = str_replace('\n', "\n", $pem);

        return new self($appId, $kid, $pem, (int) ($cfg['token_ttl'] ?? 3 * 3600));
    }

    public function appId(): string
    {
        return $this->appId;
    }

    /**
     * @param string $room bare room name (without the appId prefix)
     */
    public function token(User $user, string $room, bool $moderator): string
    {
        $now = time();
        $header = ['alg' => 'RS256', 'typ' => 'JWT', 'kid' => $this->apiKeyId];
        $payload = [
            'aud'     => 'jitsi',
            'iss'     => 'chat',
            'sub'     => $this->appId,
            'room'    => $room,
            'iat'     => $now,
            'nbf'     => $now - 10,
            'exp'     => $now + $this->ttlSeconds,
            'context' => [
                'user' => [
                    'id'        => (string) $user->id,
                    'name'      => (string) $user->name,
                    'email'     => (string) ($user->email ?? ''),
                    'avatar'    => (string) ($user->avatar ?? ''),
                    'moderator' => $moderator ? 'true' : 'false',
                ],
                'features' => [
                    'livestreaming'  => 'false',
                    'recording'      => $moderator ? 'true' : 'false',
                    'transcription'  => 'false',
                    'outbound-call'  => 'false',
                ],
            ],
        ];

        $segments = [
            self::b64(json_encode($header, JSON_UNESCAPED_SLASHES)),
            self::b64(json_encode($payload, JSON_UNESCAPED_SLASHES)),
        ];
        $signingInput = implode('.', $segments);

        $key = openssl_pkey_get_private($this->privateKeyPem);
        if ($key === false) {
            throw new RuntimeException('JAAS_PRIVATE_KEY is not a valid private key.');
        }
        $signature = '';
        if (!openssl_sign($signingInput, $signature, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Unable to sign JaaS token: ' . openssl_error_string());
        }
        $segments[] = self::b64($signature);

        return implode('.', $segments);
    }

    private static function b64(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}
