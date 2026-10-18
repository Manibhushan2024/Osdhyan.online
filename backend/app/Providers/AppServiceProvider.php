<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // Junk ids (/live-classes/abc) become 404s instead of 500 TypeErrors
        // in controllers with typed int $id parameters.
        Route::pattern('id', '[0-9]+');

        $this->configureRateLimiting();
    }

    /**
     * Named limiters. Each has its own key prefix, so nested limiters no
     * longer double-count against one bucket (the old throttle:60 + 120
     * pair let a student save only ~30 answers a minute).
     *
     * Auth limits are keyed by IP *and* login identifier: many students in a
     * coaching centre or behind a mobile carrier share one public IP, so a
     * pure per-IP limit of 5/min would lock out a whole classroom.
     */
    protected function configureRateLimiting(): void
    {
        $identity = fn (Request $r) => strtolower(trim((string) ($r->input('login') ?? $r->input('email') ?? $r->input('phone') ?? '')));

        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(300)
            ->by('u:' . ($r->user()?->id ?: $r->ip())));

        RateLimiter::for('answers', fn (Request $r) => Limit::perMinute(90)
            ->by('u:' . ($r->user()?->id ?: $r->ip())));

        RateLimiter::for('ai', fn (Request $r) => Limit::perMinute(20)
            ->by('u:' . ($r->user()?->id ?: $r->ip())));

        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(10)->by('id:' . $r->ip() . '|' . sha1($identity($r))),
            Limit::perMinute(600)->by('ip:' . $r->ip()),
        ]);

        RateLimiter::for('otp', fn (Request $r) => [
            Limit::perMinute(3)->by('id:' . sha1($identity($r))),
            Limit::perMinute(120)->by('ip:' . $r->ip()),
        ]);

        // Typing a wrong OTP must not count against "send OTP" (3/min).
        RateLimiter::for('otp-verify', fn (Request $r) => [
            Limit::perMinute(10)->by('id:' . sha1($identity($r))),
            Limit::perMinute(300)->by('ip:' . $r->ip()),
        ]);

        RateLimiter::for('register', fn (Request $r) => Limit::perHour(500)->by('ip:' . $r->ip()));
    }
}
