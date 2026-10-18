<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Teachers and admins only. */
class TeacherMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || (!$user->isTeacher() && !$user->isAdminUser())) {
            return response()->json(['message' => 'Teacher access required.'], 403);
        }

        return $next($request);
    }
}
