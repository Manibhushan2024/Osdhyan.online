<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Shared rules for the Courses content system.
 *
 * Stored material types (study_materials.type):
 *   pdf     — PDF notes                (viewer: iframe)
 *   image   — mind map / infographic   (viewer: <img>)
 *   video   — uploaded mp4/webm        (viewer: <video>)
 *   audio   — uploaded mp3/m4a/...     (viewer: <audio>)
 *   youtube — video link (external_url) (viewer: embedded YouTube player)
 *   doc     — Word / PowerPoint        (viewer: download only)
 *
 * The type is always worked out from the file itself (extension, checked
 * against the detected MIME family) — the admin never has to pick it.
 */
class CourseContent
{
    /** Max upload size in kilobytes (500 MB). Keep php.ini / Apache above this. */
    public const MAX_UPLOAD_KB = 512000;

    public const TYPES = ['pdf', 'image', 'video', 'audio', 'youtube', 'doc'];

    /** extension => stored type */
    public const EXTENSIONS = [
        'pdf'  => 'pdf',
        'jpg'  => 'image', 'jpeg' => 'image', 'png' => 'image', 'webp' => 'image', 'gif' => 'image',
        'mp4'  => 'video', 'm4v'  => 'video', 'webm' => 'video',
        'mp3'  => 'audio', 'm4a'  => 'audio', 'aac'  => 'audio', 'wav' => 'audio', 'ogg' => 'audio', 'oga' => 'audio',
        'doc'  => 'doc',   'docx' => 'doc',   'ppt'  => 'doc',   'pptx' => 'doc',
    ];

    /** MIME prefixes that are acceptable for each stored type. */
    private const MIME_FAMILIES = [
        'pdf'   => ['application/pdf', 'application/x-pdf', 'application/octet-stream'],
        'image' => ['image/'],
        // Containers are often reported loosely (an .m4a as video/mp4, a
        // .webm talk as audio/webm), so audio and video accept each other.
        'video' => ['video/', 'audio/', 'application/octet-stream'],
        'audio' => ['audio/', 'video/', 'application/ogg', 'application/octet-stream'],
        'doc'   => ['application/'],
    ];

    /**
     * Work out the stored type of an uploaded file, or null when the file is
     * not something students can be given.
     */
    public static function typeForFile(UploadedFile $file): ?string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $type = self::EXTENSIONS[$ext] ?? null;
        if ($type === null) {
            return null;
        }

        $mime = strtolower((string) $file->getMimeType());
        foreach (self::MIME_FAMILIES[$type] as $prefix) {
            if (str_starts_with($mime, $prefix)) {
                return $type;
            }
        }

        return null;
    }

    /** The YouTube video id in a watch / youtu.be / embed / shorts / live URL, or null. */
    public static function youtubeId(?string $url): ?string
    {
        if (!$url) {
            return null;
        }
        $url = trim($url);
        if (!preg_match('~^https?://~i', $url)) {
            $url = 'https://' . $url;
        }
        $parts = parse_url($url);
        $host = strtolower($parts['host'] ?? '');
        $host = preg_replace('/^(www\.|m\.|music\.)/', '', $host);
        $path = $parts['path'] ?? '';
        $id = null;

        if ($host === 'youtu.be') {
            $id = ltrim($path, '/');
        } elseif (in_array($host, ['youtube.com', 'youtube-nocookie.com'], true)) {
            if ($path === '/watch') {
                parse_str($parts['query'] ?? '', $query);
                $id = $query['v'] ?? null;
            } elseif (preg_match('~^/(embed|shorts|live|v)/([^/?#]+)~', $path, $m)) {
                $id = $m[2];
            }
        }

        $id = is_string($id) ? explode('/', $id)[0] : null;

        return $id && preg_match('/^[A-Za-z0-9_-]{11}$/', $id) ? $id : null;
    }

    public static function youtubeEmbedUrl(?string $url): ?string
    {
        $id = self::youtubeId($url);

        return $id ? "https://www.youtube-nocookie.com/embed/{$id}?rel=0&modestbranding=1" : null;
    }

    // ─── Cache ────────────────────────────────────────────────────────────────
    // Every student-facing course payload is cached under a version token;
    // any change to a subject / chapter / topic / material bumps the token,
    // so admin edits show up on the next request.

    public static function cacheKey(string $suffix): string
    {
        $version = Cache::rememberForever('courses:version', fn () => (string) Str::uuid());

        return "courses:{$version}:{$suffix}";
    }

    public static function flushCache(): void
    {
        Cache::forever('courses:version', (string) Str::uuid());
    }
}
