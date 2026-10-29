<?php

use App\Http\Controllers\Api\StudyPlanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Personal study plan (DSSSB TGT CS)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/study-plan', [StudyPlanController::class, 'show']);
    Route::post('/study-plan/generate', [StudyPlanController::class, 'generate']);
    Route::patch('/study-plan/tasks/{task}', [StudyPlanController::class, 'updateTask'])->whereNumber('task');
});
