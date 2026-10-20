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

    /**
     * Capabilities the portal shows on the schedule form.
     *
     * `default` is what the form pre-selects: YouTube Live unless a Jitsi
     * server that works when embedded is configured (JaaS keys, or a
     * self-hosted JITSI_DOMAIN). On the free public meet.jit.si the host
     * has to sign in with Google/GitHub/Facebook inside the video before
     * anyone can enter, which is unreliable inside our page.
     */
    public function describe(): array
    {
        $jitsi = $this->for(LiveClass::PROVIDER_JITSI);
        $mode = $jitsi instanceof JitsiProvider ? $jitsi->mode() : 'public';
        $jitsiReliable = $mode !== 'public';

        return [
            'default' => $jitsiReliable ? LiveClass::PROVIDER_JITSI : LiveClass::PROVIDER_YOUTUBE,
            'jitsi' => [
                'label'       => 'Small interactive class (Jitsi video call)',
                'mode'        => $mode,
                'recommended' => 'Best for up to ~50 students. Teacher and students can talk, share camera and screen.',
                'warning'     => $jitsiReliable ? null
                    : 'Uses the free public Jitsi server: when you start, Jitsi asks you (the teacher) to sign in with Google, GitHub or Facebook inside the video. Students wait until you do. For a smooth experience ask the admin to add JaaS keys, or use YouTube Live.',
            ],
            'youtube' => [
                'label'       => 'Big class (YouTube Live + OSDHYAN chat)',
                'mode'        => 'embed',
                'recommended' => 'Best for 50 to 5,000+ students. You stream on YouTube (unlisted); students watch here and ask questions in our chat, polls and raise-hand.',
                'warning'     => null,
            ],
        ];
    }
}
