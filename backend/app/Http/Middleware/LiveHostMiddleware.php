<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Live-class hosting: admins, and teachers whose profile an admin has
 * approved in Admin → Teachers. A teacher still waiting gets a clear code
 * so the portal can say so.
 */
class LiveHostMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $user->canHostLiveClasses()) {
            return $next($request);
        }

        if ($user && $user->isTeacher()) {
            return response()->json([
                'message' => 'Your teacher account is waiting for admin approval. You can schedule live classes once it is approved.',
                'code'    => 'teacher_pending',
            ], 403);
        }

        return response()->json([
            'message' => 'Only approved teachers and admins can run live classes.',
            'code'    => 'not_teacher',
        ], 403);
    }
}
