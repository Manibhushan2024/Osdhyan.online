<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust all proxies — app runs behind Cloudflare / Render reverse-proxy
        $middleware->trustProxies(at: '*');

        // There is no web "login" route (sign-in lives in the Next.js portal),
        // so guests on API routes must never be redirected; they get a 401.
        $middleware->redirectGuestsTo(
            fn (\Illuminate\Http\Request $request) => $request->is('api/*') ? null : '/auth/login'
        );

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'root_admin' => \App\Http\Middleware\RootAdminMiddleware::class,
            'teacher' => \App\Http\Middleware\TeacherMiddleware::class,
            'auth.optional' => \App\Http\Middleware\OptionalSanctumAuth::class,
            'live.host' => \App\Http\Middleware\LiveHostMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Everything under /api answers in JSON, even when the client did not
        // send "Accept: application/json". Without this an unauthenticated
        // request (browser, curl, app) was redirected to a non-existent
        // "login" route and turned into a 500 instead of a 401.
        $exceptions->shouldRenderJsonWhen(
            fn (\Illuminate\Http\Request $request, \Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
