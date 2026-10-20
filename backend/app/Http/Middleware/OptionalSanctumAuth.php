<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * For public pages that show more to signed-in users (e.g. the test-series
 * catalogue): use the Sanctum guard so a Bearer token is recognised when sent,
 * but let guests through instead of answering 401.
 */
class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        Auth::shouldUse('sanctum');

        return $next($request);
    }
}
