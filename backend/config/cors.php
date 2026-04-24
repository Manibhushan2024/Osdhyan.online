<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowlist values are read from environment variables so they can be
    | tightened in production without touching code.
    |
    | Local  : ALLOWED_ORIGINS defaults to localhost:3000
    | Staging: set ALLOWED_ORIGINS=https://staging.osdhyan.com
    | Prod   : set ALLOWED_ORIGINS=https://osdhyan.com,https://www.osdhyan.com
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001'))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-XSRF-TOKEN',
        'Accept',
        'Origin',
        'X-Automation-Token',
    ],

    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'Retry-After',
    ],

    'max_age' => 3600,

    'supports_credentials' => true,

];
