<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * YouTube Live — one-to-many broadcast for big batches (500+ students).
 * The teacher streams with OBS/YouTube Studio; we embed the player
 * (youtube-nocookie) and keep chat / polls / hand-raise in-app.
 */
class YoutubeProvider implements LiveProvider
{
    public function key(): string
    {
        return LiveClass::PROVIDER_YOUTUBE;
    }

    public function prepareForSchedule(array $input, ?LiveClass $existing = null): array
    {
        $url = trim((string) ($input['youtube_url'] ?? ''));
        if ($url === '' && $existing?->youtube_video_id) {
            return ['youtube_video_id' => $existing->youtube_video_id];
        }

        $videoId = self::extractVideoId($url);
        if ($videoId === null) {
            throw ValidationException::withMessages([
                'youtube_url' => 'Paste a valid YouTube Live or video URL (e.g. https://youtube.com/live/abc123).',
            ]);
        }

        return ['youtube_video_id' => $videoId, 'room_name' => null, 'join_password' => null];
    }

    public function prepareForGoLive(LiveClass $class): array
    {
        return [];
    }

    public function joinPayload(LiveClass $class, User $user, bool $isModerator): array
    {
        return [
            'kind'         => 'youtube',
            'video_id'     => $class->youtube_video_id,
            'embed_url'    => "https://www.youtube-nocookie.com/embed/{$class->youtube_video_id}?autoplay=1&rel=0&modestbranding=1",
            'is_moderator' => $isModerator,
        ];
    }

    public function defaultRecordingUrl(LiveClass $class): ?string
    {
        return $class->youtube_video_id
            ? "https://www.youtube.com/watch?v={$class->youtube_video_id}"
            : null;
    }

    /** Accepts watch?v=, youtu.be/, /live/, /embed/, /shorts/ and bare ids. */
    public static function extractVideoId(string $url): ?string
    {
        if ($url === '') {
            return null;
        }
        if (preg_match('/^[A-Za-z0-9_-]{11}$/', $url)) {
            return $url;
        }
        $patterns = [
            '#[?&]v=([A-Za-z0-9_-]{11})#',
            '#youtu\.be/([A-Za-z0-9_-]{11})#',
            '#youtube\.com/(?:live|embed|shorts|v)/([A-Za-z0-9_-]{11})#',
        ];
        foreach ($patterns as $p) {
            if (preg_match($p, $url, $m)) {
                return $m[1];
            }
        }

        return null;
    }
}
