<?php

use App\Http\Controllers\Api\AdminTeacherController;
use App\Http\Controllers\Api\TeacherProfileController;
use App\Http\Controllers\Api\TuitionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Home-tuition marketplace
|--------------------------------------------------------------------------
| Contact details are never returned; every student–teacher contact goes
| through /conversations (routes/api/chat.php) so lead fees / commission can
| be metered later (see TODO(revenue) in TuitionController).
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Teacher onboarding + own profile
    Route::post('/teacher/register', [TeacherProfileController::class, 'register']);
    Route::get('/teacher/profile', [TeacherProfileController::class, 'show']);
    Route::put('/teacher/profile', [TeacherProfileController::class, 'update']);

    // Directory (verified + available teachers only)
    Route::get('/tuition/teachers', [TuitionController::class, 'teachers']);
    Route::get('/tuition/teachers/{id}', [TuitionController::class, 'teacher'])->whereNumber('id');
    Route::post('/tuition/teachers/{id}/contact', [TuitionController::class, 'contact'])->whereNumber('id');

    // Student requirements
    Route::post('/tuition/requests', [TuitionController::class, 'storeRequest']);
    Route::get('/tuition/requests/mine', [TuitionController::class, 'myRequests']);
    Route::get('/tuition/requests/{id}', [TuitionController::class, 'showRequest'])->whereNumber('id');
    Route::post('/tuition/requests/{id}/close', [TuitionController::class, 'closeRequest'])->whereNumber('id');
    Route::post('/tuition/requests/{id}/proposals/{p}/accept', [TuitionController::class, 'acceptProposal'])
        ->whereNumber('id')->whereNumber('p');

    // Teacher side (verified profile enforced in the controller)
    Route::middleware('teacher')->group(function () {
        Route::get('/tuition/leads', [TuitionController::class, 'leads']);
        Route::post('/tuition/requests/{id}/proposals', [TuitionController::class, 'storeProposal'])->whereNumber('id');
        Route::get('/tuition/proposals/mine', [TuitionController::class, 'myProposals']);
    });

    // Admin verification queue
    Route::middleware('admin')->group(function () {
        Route::get('/admin/teachers', [AdminTeacherController::class, 'index']);
        Route::post('/admin/teachers/{id}/verify', [AdminTeacherController::class, 'verify'])->whereNumber('id');
        Route::post('/admin/teachers/{id}/unverify', [AdminTeacherController::class, 'unverify'])->whereNumber('id');
    });
});
