<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudyGoalController;
use App\Http\Controllers\Api\StudySessionController;
use App\Http\Controllers\Api\TestAttemptController;
use App\Http\Controllers\Api\TestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Endpoints — rate-limited per IP
|--------------------------------------------------------------------------
|
| throttle:10,1   → 10 requests per 1 minute
| throttle:5,1    → 5 requests per 1 minute
| throttle:60,1   → 60 requests per 1 minute (generous, for normal browsing)
|
| Laravel's built-in RateLimiter middleware adds X-RateLimit-* headers.
| The AuthController also uses Laravel's RateLimiter facade for per-action
| limits that persist across the 1-minute window.
*/

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('throttle:3,1')->group(function () {
    Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
});

Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ── Syllabus ──────────────────────────────────────────────────────────────
    Route::get('/exams', [\App\Http\Controllers\Api\SyllabusController::class, 'getExams']);
    Route::get('/exams/{exam}/subjects', [\App\Http\Controllers\Api\SyllabusController::class, 'getSubjects']);
    Route::get('/subjects/{subject}/chapters', [\App\Http\Controllers\Api\SyllabusController::class, 'getChapters']);
    Route::get('/chapters/{chapter}/topics', [\App\Http\Controllers\Api\SyllabusController::class, 'getTopics']);
    Route::get('/exams/{exam}/full', [\App\Http\Controllers\Api\SyllabusController::class, 'getFullHierarchy']);

    // ── Tests ────────────────────────────────────────────────────────────────
    Route::get('/tests', [TestController::class, 'index']);
    Route::get('/tests/{test}', [TestController::class, 'show']);

    Route::get('/tests/{test}/attempts', [TestAttemptController::class, 'index']);
    Route::post('/tests/{test}/attempts', [TestAttemptController::class, 'startAttempt']);
    Route::get('/tests/{test}/latest-attempt', [TestAttemptController::class, 'getLatestAttempt']);
    Route::get('/attempts/{attempt}', [TestAttemptController::class, 'show']);

    // Answer sync is high-frequency — give it a higher limit
    Route::middleware('throttle:120,1')->group(function () {
        Route::post('/attempts/{attempt}/responses', [TestAttemptController::class, 'saveResponse']);
        Route::post('/attempts/{attempt}/sync', [TestAttemptController::class, 'syncResponses']);
    });

    Route::post('/attempts/{attempt}/complete', [TestAttemptController::class, 'completeAttempt']);

    // AI chat is expensive — tighter limit
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('/attempts/{attempt}/assistant-chat', [AnalyticsController::class, 'assistantChat']);
    });

    // ── Analytics ────────────────────────────────────────────────────────────
    Route::get('/analytics/overview', [AnalyticsController::class, 'getOverview']);
    Route::get('/analytics/topics', [AnalyticsController::class, 'getTopicWisePerformance']);
    Route::get('/analytics/explanation/{question}', [AnalyticsController::class, 'getQuestionExplanation']);

    // ── Study Goals ───────────────────────────────────────────────────────────
    Route::get('/study-goals', [StudyGoalController::class, 'index']);
    Route::post('/study-goals', [StudyGoalController::class, 'store']);
    Route::delete('/study-goals/{id}', [StudyGoalController::class, 'destroy']);

    // ── Study Sessions ────────────────────────────────────────────────────────
    Route::get('/study-sessions/active', [StudySessionController::class, 'getActive']);
    Route::post('/study-sessions/start', [StudySessionController::class, 'start']);
    Route::post('/study-sessions/{id}/pause', [StudySessionController::class, 'pause']);
    Route::post('/study-sessions/{id}/resume', [StudySessionController::class, 'resume']);
    Route::post('/study-sessions/{id}/stop', [StudySessionController::class, 'stop']);
    Route::post('/study-sessions/{id}/sync', [StudySessionController::class, 'sync']);

    // ── Achievements ──────────────────────────────────────────────────────────
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::post('/achievements', [AchievementController::class, 'store']);

    // ── Notes ────────────────────────────────────────────────────────────────
    Route::get('/notes', [NoteController::class, 'index']);
    Route::get('/notes/{note}', [NoteController::class, 'show']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::patch('/notes/{note}', [NoteController::class, 'update']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);

    // ── Profile ───────────────────────────────────────────────────────────────
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // ── Support ───────────────────────────────────────────────────────────────
    Route::post('/support/tickets', [\App\Http\Controllers\Api\SupportController::class, 'submitTicket']);
    Route::get('/support/tickets', [\App\Http\Controllers\Api\SupportController::class, 'getMyTickets']);

    // ── Content ───────────────────────────────────────────────────────────────
    Route::get('/blogs', [\App\Http\Controllers\Api\ContentController::class, 'getBlogs']);
    Route::get('/blogs/{slug}', [\App\Http\Controllers\Api\ContentController::class, 'getBlogBySlug']);
    Route::get('/study-materials', [\App\Http\Controllers\Api\ContentController::class, 'getStudyMaterials']);
    Route::get('/study-materials/{id}', [\App\Http\Controllers\Api\ContentController::class, 'getMaterialDetail']);
    Route::post('/study-materials/{id}/progress', [\App\Http\Controllers\Api\ContentController::class, 'updateProgress']);

    // ── Courses ───────────────────────────────────────────────────────────────
    Route::get('/courses/categories', [\App\Http\Controllers\Api\CourseController::class, 'getCategories']);
    Route::get('/courses/subjects', [\App\Http\Controllers\Api\CourseController::class, 'getSubjectsByCategory']);
    Route::get('/courses/ncert/classes', [\App\Http\Controllers\Api\CourseController::class, 'getNcertClasses']);
    Route::get('/courses/ncert/classes/{class}/subjects', [\App\Http\Controllers\Api\CourseController::class, 'getNcertSubjectsByClass']);
    Route::get('/courses/subjects/{subject}/hierarchy', [\App\Http\Controllers\Api\CourseController::class, 'getSubjectChapters']);
    Route::get('/courses/topics/{topic}/materials', [\App\Http\Controllers\Api\CourseController::class, 'getTopicMaterials']);

    // ── Test Series ───────────────────────────────────────────────────────────
    Route::get('/test-series', [\App\Http\Controllers\Api\TestSeriesController::class, 'index']);
    Route::get('/test-series/enrolled', [\App\Http\Controllers\Api\TestSeriesController::class, 'enrolled']);
    Route::get('/test-series/{series}', [\App\Http\Controllers\Api\TestSeriesController::class, 'show']);
    Route::post('/test-series/{series}/enroll', [\App\Http\Controllers\Api\TestSeriesController::class, 'enroll']);
    Route::post('/test-series/{series}/unenroll', [\App\Http\Controllers\Api\TestSeriesController::class, 'unenroll']);

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::middleware('admin')->group(function () {
        Route::get('/admin/subjects', [\App\Http\Controllers\Api\AdminCourseController::class, 'getSubjects']);
        Route::post('/admin/subjects', [\App\Http\Controllers\Api\AdminCourseController::class, 'storeSubject']);
        Route::put('/admin/subjects/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'updateSubject']);
        Route::delete('/admin/subjects/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'deleteSubject'])
            ->middleware('root_admin');

        Route::post('/admin/chapters', [\App\Http\Controllers\Api\AdminCourseController::class, 'storeChapter']);
        Route::put('/admin/chapters/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'updateChapter']);
        Route::delete('/admin/chapters/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'deleteChapter'])
            ->middleware('root_admin');

        Route::post('/admin/topics', [\App\Http\Controllers\Api\AdminCourseController::class, 'storeTopic']);
        Route::put('/admin/topics/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'updateTopic']);
        Route::delete('/admin/topics/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'deleteTopic'])
            ->middleware('root_admin');

        Route::post('/admin/materials/upload', [\App\Http\Controllers\Api\AdminCourseController::class, 'uploadMaterial']);
        Route::delete('/admin/materials/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'deleteMaterial'])
            ->middleware('root_admin');

        Route::get('/admin/test-series', [\App\Http\Controllers\Api\AdminCourseController::class, 'getAdminTestSeries']);
        Route::post('/admin/test-series', [\App\Http\Controllers\Api\AdminCourseController::class, 'storeTestSeries']);
        Route::post('/admin/test-series/{id}/update', [\App\Http\Controllers\Api\AdminCourseController::class, 'updateTestSeries']);
        Route::delete('/admin/test-series/{id}', [\App\Http\Controllers\Api\AdminCourseController::class, 'deleteTestSeries'])
            ->middleware('root_admin');

        Route::get('/admin/questions/search', [\App\Http\Controllers\Api\AdminCourseController::class, 'searchQuestions']);
        Route::post('/admin/questions', [\App\Http\Controllers\Api\AdminCourseController::class, 'createQuestion']);
        Route::post('/admin/tests/with-questions', [\App\Http\Controllers\Api\AdminCourseController::class, 'createTestWithQuestions']);

        Route::post('/admin/automation/token', [\App\Http\Controllers\Api\AdminAutomationController::class, 'createAutomationToken']);
        Route::post('/admin/automation/import-mock-test', [\App\Http\Controllers\Api\AdminAutomationController::class, 'importMockTest']);

        Route::get('/admin/analytics/overview', [\App\Http\Controllers\Api\AdminAnalyticsController::class, 'getOverview']);

        Route::middleware('root_admin')->group(function () {
            Route::get('/admin/users', [\App\Http\Controllers\Api\AdminUserController::class, 'index']);
            Route::post('/admin/users', [\App\Http\Controllers\Api\AdminUserController::class, 'storeEditor']);
            Route::patch('/admin/users/{user}', [\App\Http\Controllers\Api\AdminUserController::class, 'updateEditor']);
            Route::delete('/admin/users/{user}', [\App\Http\Controllers\Api\AdminUserController::class, 'destroyEditor']);
        });
    });

    // ── Study Planner ─────────────────────────────────────────────────────────
    Route::prefix('study-planner')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\StudyPlannerController::class, 'getDashboardData']);
        Route::post('/goal', [\App\Http\Controllers\Api\StudyPlannerController::class, 'setGoal']);
        Route::post('/log', [\App\Http\Controllers\Api\StudyPlannerController::class, 'logActivity']);
        Route::post('/close-day', [\App\Http\Controllers\Api\StudyPlannerController::class, 'closeDay']);
        Route::post('/tasks', [\App\Http\Controllers\Api\StudyPlannerController::class, 'addTask']);
        Route::patch('/tasks/{task}', [\App\Http\Controllers\Api\StudyPlannerController::class, 'toggleTask']);
        Route::patch('/tasks/{task}/reschedule', [\App\Http\Controllers\Api\StudyPlannerController::class, 'rescheduleTask']);
        Route::get('/nodes', [\App\Http\Controllers\Api\StudyPlannerController::class, 'listNodes']);
        Route::post('/nodes', [\App\Http\Controllers\Api\StudyPlannerController::class, 'addNode']);
        Route::patch('/nodes/{node}', [\App\Http\Controllers\Api\StudyPlannerController::class, 'updateNode']);
        Route::patch('/nodes/{node}/move', [\App\Http\Controllers\Api\StudyPlannerController::class, 'moveNode']);
        Route::delete('/nodes/{node}', [\App\Http\Controllers\Api\StudyPlannerController::class, 'deleteNode']);
        Route::get('/timer/active', [\App\Http\Controllers\Api\StudyPlannerController::class, 'getActiveNodeTimer']);
        Route::post('/nodes/{node}/timer/start', [\App\Http\Controllers\Api\StudyPlannerController::class, 'startNodeTimer']);
        Route::post('/nodes/{node}/timer/stop', [\App\Http\Controllers\Api\StudyPlannerController::class, 'stopNodeTimer']);
    });
});
