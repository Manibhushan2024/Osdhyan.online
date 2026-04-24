<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    |
    | Leave HORIZON_DOMAIN blank to serve /horizon on the same host.
    | In production, gate access via HorizonServiceProvider or Nginx.
    */
    'domain' => env('HORIZON_DOMAIN'),
    'path'   => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    */
    'use' => 'default',

    'prefix' => env(
        'HORIZON_PREFIX',
        Str::slug(env('APP_NAME', 'osdhyan'), '_') . '_horizon:'
    ),

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds (seconds)
    |--------------------------------------------------------------------------
    */
    'waits' => [
        'redis:default' => 60,
        'redis:ai'      => 300,
        'redis:mail'    => 120,
    ],

    /*
    |--------------------------------------------------------------------------
    | Worker Trim
    |--------------------------------------------------------------------------
    */
    'trim' => [
        'recent'        => 60,   // minutes to keep recent jobs
        'pending'       => 60,
        'completed'     => 60,
        'recent_failed' => 10080, // 7 days
        'failed'        => 10080,
        'monitored'     => 10080,
    ],

    /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */
    'metrics' => [
        'trim_snapshots' => [
            'job'   => 24,
            'queue' => 24,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Fast Termination
    |--------------------------------------------------------------------------
    */
    'fast_termination' => false,

    /*
    |--------------------------------------------------------------------------
    | Memory Limit (MB)
    |--------------------------------------------------------------------------
    */
    'memory_limit' => 256,

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Environments
    |--------------------------------------------------------------------------
    |
    | Three queues with distinct priorities:
    |   default  — general app jobs (study planner, scores)
    |   ai       — long-running AI explanation / insight jobs (5-min timeout)
    |   mail     — email dispatch jobs
    */
    'environments' => [
        'production' => [
            'supervisor-default' => [
                'connection'   => 'redis',
                'queue'        => ['default'],
                'balance'      => 'auto',
                'autoScalingStrategy' => 'time',
                'maxProcesses' => 5,
                'minProcesses' => 1,
                'maxTime'      => 0,
                'maxJobs'      => 0,
                'memory'       => 256,
                'tries'        => 3,
                'timeout'      => 90,
                'nice'         => 0,
            ],
            'supervisor-ai' => [
                'connection'   => 'redis',
                'queue'        => ['ai'],
                'balance'      => 'simple',
                'maxProcesses' => 2,
                'minProcesses' => 1,
                'maxTime'      => 0,
                'maxJobs'      => 0,
                'memory'       => 512,
                'tries'        => 2,
                'timeout'      => 300,  // 5-min AI timeout
                'nice'         => 10,   // lower priority than default
            ],
            'supervisor-mail' => [
                'connection'   => 'redis',
                'queue'        => ['mail'],
                'balance'      => 'simple',
                'maxProcesses' => 3,
                'minProcesses' => 1,
                'maxTime'      => 0,
                'maxJobs'      => 0,
                'memory'       => 128,
                'tries'        => 5,
                'timeout'      => 30,
                'nice'         => 0,
            ],
        ],

        'local' => [
            'supervisor-local' => [
                'connection'   => 'redis',
                'queue'        => ['default', 'ai', 'mail'],
                'balance'      => 'simple',
                'maxProcesses' => 2,
                'minProcesses' => 1,
                'tries'        => 2,
                'timeout'      => 300,
            ],
        ],
    ],
];
