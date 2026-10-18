<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use InvalidArgumentException;

/**
 * Maps live_classes.provider to an implementation. Add Agora/100ms here.
 */
class LiveProviderResolver
{
    /** @var array<string, LiveProvider> */
    private array $instances = [];

    public function for(LiveClass|string $classOrKey): LiveProvider
    {
        $key = $classOrKey instanceof LiveClass ? (string) $classOrKey->provider : $classOrKey;

        return $this->instances[$key] ??= match ($key) {
            LiveClass::PROVIDER_JITSI   => JitsiProvider::fromConfig(),
            LiveClass::PROVIDER_YOUTUBE => new YoutubeProvider(),
            default => throw new InvalidArgumentException("Unknown live provider [{$key}]."),
        };
    }

    /** Capabilities the portal shows on the schedule form. */
    public function describe(): array
    {
        $jitsi = $this->for(LiveClass::PROVIDER_JITSI);

        return [
            'jitsi' => [
                'label'       => 'Interactive (Jitsi)',
                'mode'        => $jitsi instanceof JitsiProvider && $jitsi->usesJaas() ? 'jaas' : 'plain',
                'recommended' => 'Up to ~50 students. Camera, mic, screen share, two-way Q&A.',
            ],
            'youtube' => [
                'label'       => 'Broadcast (YouTube Live)',
                'mode'        => 'embed',
                'recommended' => 'For 500+ students. Stream with OBS / YouTube Studio; chat and polls stay in-app.',
            ],
        ];
    }
}
