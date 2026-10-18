<?php

namespace App\Services\Live;

use App\Models\LiveClass;
use App\Models\User;

/**
 * A video backend for live classes.
 *
 * Implementations are stateless; everything a class needs to be joined
 * (room name, password, video id) lives on the LiveClass row so that
 * swapping providers later (Agora, 100ms, Zoom…) only means adding a
 * class here and a case in LiveProviderResolver.
 */
interface LiveProvider
{
    /** Stable identifier stored in live_classes.provider. */
    public function key(): string;

    /**
     * Validate / normalise provider-specific input at schedule time and
     * return the attributes to persist on the class (e.g. youtube_video_id).
     *
     * @param  array<string,mixed> $input validated request payload
     * @return array<string,mixed>
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function prepareForSchedule(array $input, ?LiveClass $existing = null): array;

    /**
     * Called once when the teacher goes live. Return attributes to persist
     * (room name, password…). Called before status flips to "live".
     *
     * @return array<string,mixed>
     */
    public function prepareForGoLive(LiveClass $class): array;

    /**
     * Everything the browser needs to join. MUST NOT include secrets other
     * than the per-class join password / short-lived JWT for *this* user.
     *
     * @return array<string,mixed>
     */
    public function joinPayload(LiveClass $class, User $user, bool $isModerator): array;

    /** Best-effort recording URL once the class ends (null if unknown). */
    public function defaultRecordingUrl(LiveClass $class): ?string;
}
