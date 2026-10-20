<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        // Behind the same-origin proxy the callback lives under the public URL (/api/...).
        'redirect' => env('GOOGLE_REDIRECT_URI') ?: rtrim((string) env('APP_URL', 'http://localhost:8000'), '/') . '/api/auth/google/callback',
    ],

    // Read through config() so values survive `php artisan config:cache`
    // (env() returns null at runtime once config is cached).
    'ai' => [
        'provider'      => env('AI_PROVIDER'),
        'model'         => env('AI_MODEL'),
        'openai_key'    => env('OPENAI_API_KEY'),
        'openai_model'  => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'gemini_key'    => env('GEMINI_API_KEY'),
        'gemini_model'  => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    ],

    // SMS OTP — see App\Services\SmsService for providers (log|msg91|fast2sms|textlocal)
    'sms' => [
        'provider'    => env('SMS_PROVIDER', 'log'),
        'api_key'     => env('SMS_API_KEY'),
        'sender_id'   => env('SMS_SENDER_ID', 'OSDHYN'),
        'template_id' => env('SMS_TEMPLATE_ID'),   // msg91 DLT OTP template
        // provider=android: your own phone as the gateway (see SmsService)
        'gateway_url'      => env('SMS_GATEWAY_URL'),
        'gateway_user'     => env('SMS_GATEWAY_USER'),
        'gateway_password' => env('SMS_GATEWAY_PASSWORD'),
    ],

    // Razorpay checkout for paid test series. PAYMENTS_FAKE=true swaps in a
    // local gateway that marks orders paid instantly (refused in production).
    'razorpay' => [
        'key_id'         => env('RAZORPAY_KEY_ID'),
        'key_secret'     => env('RAZORPAY_KEY_SECRET'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
        'fake'           => (bool) env('PAYMENTS_FAKE', false),
    ],

    // Live classes. Jitsi is used as-is (meet.jit.si or a self-hosted
    // domain); when the three JAAS_* values are set, rooms move to 8x8.vc
    // and every join is signed with an RS256 JWT (see JaasTokenGenerator).
    'live' => [
        'jitsi' => [
            'domain' => env('JITSI_DOMAIN', 'meet.jit.si'),
        ],
        'jaas' => [
            'app_id'      => env('JAAS_APP_ID'),
            'api_key_id'  => env('JAAS_API_KEY_ID'),
            'private_key' => env('JAAS_PRIVATE_KEY'),
            'token_ttl'   => (int) env('JAAS_TOKEN_TTL', 10800),
        ],
        'state_cache_seconds' => (int) env('LIVE_STATE_CACHE_SECONDS', 2),
        // Multiplies the poll interval sent to viewers (state.poll_ms). Raise
        // it (e.g. 2) when the API runs on a small machine and classes are big.
        'poll_scale'          => (float) env('LIVE_POLL_SCALE', 1),
    ],

];
