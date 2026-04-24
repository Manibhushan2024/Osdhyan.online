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

// Horizon queue metrics snapshot every 5 minutes
Schedule::command('horizon:snapshot')->everyFiveMinutes();
