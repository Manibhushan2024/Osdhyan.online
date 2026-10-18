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
        'redirect' => env('GOOGLE_REDIRECT_URI'),
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

    'sms' => [
        'provider'  => env('SMS_PROVIDER', 'log'),
        'api_key'   => env('SMS_API_KEY'),
        'sender_id' => env('SMS_SENDER_ID', 'OSDHYN'),
    ],

];
