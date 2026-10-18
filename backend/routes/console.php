<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Scheduled tasks ─────────────────────────────────────────────
// Regenerate sitemap daily at 08:00 IST (02:30 UTC)
Schedule::command('sitemap:generate')->dailyAt('02:30');

// Auto-submit attempts whose timer ran out (student closed the tab etc.)
Schedule::command('attempts:finalize-expired')->everyFiveMinutes()->withoutOverlapping()->onOneServer();

// Delete expired API tokens daily
Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('23:00');
