<?php

// Partial override — merged over the package defaults by Sanctum's provider.
return [
    // API auth is Bearer-token only. An empty guard list skips the session
    // ("web") guard probe Sanctum otherwise runs on every request.
    'guard' => [],

    // Tokens expire after this many minutes (default 30 days). null = never.
    'expiration' => env('SANCTUM_EXPIRATION', 60 * 24 * 30),
];
