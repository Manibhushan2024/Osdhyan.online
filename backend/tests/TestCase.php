<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;

abstract class TestCase extends BaseTestCase
{
    /**
     * Refuse to run against anything but the in-memory SQLite database.
     *
     * If `php artisan config:cache` was run, the cached config overrides the
     * phpunit.xml environment and RefreshDatabase would wipe the REAL
     * database. This check runs before any trait (RefreshDatabase) touches it.
     */
    protected function refreshApplication(): void
    {
        parent::refreshApplication();

        $default = config('database.default');
        $db = config("database.connections.{$default}.database");
        if ($default !== 'sqlite' || $db !== ':memory:') {
            fwrite(STDERR, PHP_EOL . "REFUSING TO RUN TESTS: database is '{$default}' ({$db}), not sqlite :memory:." . PHP_EOL
                . "A cached config is probably active. Run:  php artisan config:clear   and try again." . PHP_EOL);
            exit(1);
        }
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Array cache persists within a process; start every test clean so
        // cached payloads / rate-limit counters never leak between tests.
        Cache::flush();
    }
}
