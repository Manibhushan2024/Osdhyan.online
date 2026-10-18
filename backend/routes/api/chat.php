<?php

use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Chat (generic 1:1 conversations)
|--------------------------------------------------------------------------
| Polling-based today (thread every 4s, list every 15s). Upgrade path:
| Laravel Reverb websockets, keeping these endpoints for history/catch-up.
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'store']);
    Route::get('/conversations/{id}', [ChatController::class, 'show'])->whereNumber('id');
    Route::get('/conversations/{id}/messages', [ChatController::class, 'messages'])->whereNumber('id');
    Route::post('/conversations/{id}/messages', [ChatController::class, 'send'])->whereNumber('id');
    Route::post('/conversations/{id}/read', [ChatController::class, 'read'])->whereNumber('id');
});
