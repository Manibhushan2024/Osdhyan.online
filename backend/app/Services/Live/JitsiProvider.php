<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Jitsi Meet — interactive classes (camera/mic/screen share) for small
 * batches (~50). Two modes, picked purely from config:
 *
 *  - JaaS (8x8.vc) when JAAS_APP_ID/JAAS_API_KEY_ID/JAAS_PRIVATE_KEY are
 *    set: every join gets a short-lived RS256 JWT (teacher = moderator).
 *  - Plain Jitsi (JITSI_DOMAIN, default meet.jit.si, or a self-hosted
 *    instance) otherwise: a random room name + a join password the
 *    teacher sets through the iframe API as soon as they join.
 */
class JitsiProvider implements LiveProvider
{
    public function __construct(
        private readonly string $domain,
        private readonly ?JaasTokenGenerator $jaas,
    ) {
    }

    public static function fromConfig(): self
    {
        $domain = trim((string) config('services.live.jitsi.domain', 'meet.jit.si'));
        $domain = preg_replace('#^https?://#', '', $domain) ?: 'meet.jit.si';

        return new self(rtrim($domain, '/'), JaasTokenGenerator::fromConfig());
    }

    public function key(): string
    {
        return LiveClass::PROVIDER_JITSI;
    }

    public function usesJaas(): bool
    {
        return $this->jaas !== null;
    }

    public function prepareForSchedule(array $input, ?LiveClass $existing = null): array
    {
        return ['youtube_video_id' => null];
    }

    public function prepareForGoLive(LiveClass $class): array
    {
        $attrs = [];
        if (!$class->room_name) {
            // id is known (class already persisted); the random suffix keeps
            // rooms unguessable on public Jitsi instances.
            $attrs['room_name'] = sprintf('osdhyan-%d-%s', $class->id, Str::lower(Str::random(8)));
        }
        if (!$class->join_password) {
            $attrs['join_password'] = Str::lower(Str::random(10));
        }

        return $attrs;
    }

    public function joinPayload(LiveClass $class, User $user, bool $isModerator): array
    {
        $room = (string) $class->room_name;

        if ($this->jaas) {
            $appId = $this->jaas->appId();

            return [
                'kind'             => 'jitsi',
                'mode'             => 'jaas',
                'domain'           => '8x8.vc',
                'external_api_url' => "https://8x8.vc/{$appId}/external_api.js",
                // JaaS rooms are namespaced by app id.
                'room'             => "{$appId}/{$room}",
                'jwt'              => $this->jaas->token($user, $room, $isModerator),
                'password'         => null,
                'is_moderator'     => $isModerator,
            ];
        }

        return [
            'kind'             => 'jitsi',
            'mode'             => 'plain',
            'domain'           => $this->domain,
            'external_api_url' => "https://{$this->domain}/external_api.js",
            'room'             => $room,
            'jwt'              => null,
            'password'         => $class->join_password,
            'is_moderator'     => $isModerator,
        ];
    }

    public function defaultRecordingUrl(LiveClass $class): ?string
    {
        return null;
    }
}
