<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * All times are in UTC. Convert to IST (UTC+5:30) when reading.
     *   02:30 UTC = 08:00 IST  — morning, before peak traffic
     *   23:30 UTC = 05:00 IST  — early morning, low traffic
     */
    protected function schedule(Schedule $schedule): void
    {
        // Regenerate sitemap.xml every day at 08:00 IST
        $schedule->command('sitemap:generate')
            ->dailyAt('02:30')
            ->withoutOverlapping()
            ->runInBackground()
            ->appendOutputTo(storage_path('logs/sitemap.log'));

        // Prune Telescope data older than 48 hours (if Telescope installed)
        if (class_exists(\Laravel\Telescope\Telescope::class)) {
            $schedule->command('telescope:prune --hours=48')
                ->daily()
                ->appendOutputTo(storage_path('logs/telescope-prune.log'));
        }

        // Clear expired password reset & OTP tokens from cache (Redis TTL handles it,
        // but this is a belt-and-suspenders cleanup for file cache fallback)
        $schedule->call(function () {
            \Illuminate\Support\Facades\Cache::flush();
        })->weekly()->sundays()->at('23:30');

        // Snapshot Horizon metrics every 5 minutes
        if (class_exists(\Laravel\Horizon\Horizon::class)) {
            $schedule->command('horizon:snapshot')
                ->everyFiveMinutes()
                ->runInBackground();
        }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
