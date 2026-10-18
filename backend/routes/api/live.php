<?php

use App\Http\Controllers\Api\LiveClassController;
use App\Http\Controllers\Api\LiveClassTeacherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Live classes
|--------------------------------------------------------------------------
| Auto-required by routes/api.php. Students poll `state` (cached ~2 s per
| class) and `messages?after=` (indexed) — both cheap enough for a batch of
| a thousand viewers polling every few seconds.
*/

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // ── Any signed-in user ────────────────────────────────────────────────
    Route::get('/live-classes', [LiveClassController::class, 'index']);

    // Teacher-only; declared before /live-classes/{id} so "my" never binds as an id.
    Route::middleware('teacher')->group(function () {
        Route::get('/live-classes/my/classes', [LiveClassTeacherController::class, 'myClasses']);
        Route::post('/live-classes', [LiveClassTeacherController::class, 'store']);
        Route::patch('/live-classes/{id}', [LiveClassTeacherController::class, 'update']);
        Route::delete('/live-classes/{id}', [LiveClassTeacherController::class, 'destroy']);

        Route::post('/live-classes/{id}/go-live', [LiveClassTeacherController::class, 'goLive']);
        Route::post('/live-classes/{id}/end', [LiveClassTeacherController::class, 'end']);
        Route::post('/live-classes/{id}/recording', [LiveClassTeacherController::class, 'recording']);

        Route::get('/live-classes/{id}/participants', [LiveClassTeacherController::class, 'participants']);
        Route::post('/live-classes/{id}/participants/{user}/lower-hand', [LiveClassTeacherController::class, 'lowerParticipantHand']);

        Route::patch('/live-classes/{id}/messages/{message}/pin', [LiveClassTeacherController::class, 'pinMessage']);
        Route::patch('/live-classes/{id}/messages/{message}/answered', [LiveClassTeacherController::class, 'answerMessage']);
        Route::delete('/live-classes/{id}/messages/{message}', [LiveClassTeacherController::class, 'deleteMessage']);

        Route::post('/live-classes/{id}/polls', [LiveClassTeacherController::class, 'createPoll']);
        Route::post('/live-classes/{id}/polls/{poll}/close', [LiveClassTeacherController::class, 'closePoll']);
        Route::post('/live-classes/{id}/polls/{poll}/reveal', [LiveClassTeacherController::class, 'revealPoll']);

        // Admin overview (the controller re-checks isAdminUser()).
        Route::get('/admin/live-classes', [LiveClassTeacherController::class, 'adminIndex']);
    });

    Route::get('/live-classes/{id}', [LiveClassController::class, 'show'])->whereNumber('id');
    Route::post('/live-classes/{id}/join', [LiveClassController::class, 'join']);
    Route::post('/live-classes/{id}/leave', [LiveClassController::class, 'leave']);
    Route::get('/live-classes/{id}/state', [LiveClassController::class, 'state']);
    Route::get('/live-classes/{id}/messages', [LiveClassController::class, 'messages']);
    Route::post('/live-classes/{id}/messages', [LiveClassController::class, 'sendMessage']);
    Route::post('/live-classes/{id}/raise-hand', [LiveClassController::class, 'raiseHand']);
    Route::post('/live-classes/{id}/lower-hand', [LiveClassController::class, 'lowerHand']);
    Route::post('/live-classes/{id}/polls/{poll}/vote', [LiveClassController::class, 'vote']);
});
