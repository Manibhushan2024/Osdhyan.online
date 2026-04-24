# Backend Recovery Status

This backend is currently in recovery mode.

## Recovered Into `backend/`

Recovered source files have been moved into a Laravel-style layout:

- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Controllers/Api/TestAttemptController.php`
- `app/Http/Controllers/Api/TestSeriesController.php`
- `app/Models/User.php`
- `app/Services/AIService.php`
- `app/Services/SmsService.php`
- `routes/api.php`

Core model stubs were added so the recovered controllers now have concrete class targets for their main relationships:

- `Exam`
- `Subject`
- `Chapter`
- `Topic`
- `Question`
- `QuestionOption`
- `Test`
- `TestAttempt`
- `TestResponse`
- `TestSeries`
- `UserTestSeries`
- `StudyGoal`
- `StudySession`
- `Note`
- `Achievement`

Recovery scripts preserved from the older environment:

- `recovery/scripts/patch_backend.php`
- `recovery/scripts/patch_profile.php`
- `recovery/scripts/seed_test_user.php`

## Still Missing

The backend is not runnable yet. The following pieces are still missing from the local repo:

- Laravel framework bootstrap files such as `artisan`, `composer.json`, `bootstrap/app.php`, and `config/*`
- Database migrations
- The remaining API controllers referenced by `routes/api.php`
- Middleware such as `admin` and `root_admin`
- Filament panel setup
- Socialite and Sanctum package wiring
- Real SMS provider integration

## Remaining Controller Gaps From `routes/api.php`

The route snapshot references controllers that are not yet recovered locally:

- `SyllabusController`
- `TestController`
- `AnalyticsController`
- `StudyGoalController`
- `StudySessionController`
- `NoteController`
- `ProfileController`
- `AchievementController`
- `SupportController`
- `ContentController`
- `CourseController`
- `AdminCourseController`
- `AdminAutomationController`
- `AdminAnalyticsController`
- `AdminUserController`
- `StudyPlannerController`

## Recommended Next Slice

The next backend reconstruction slice should focus on the minimum API needed to support the mobile app end-to-end:

1. auth and profile
2. tests and attempts
3. test series
4. course/content read APIs

Only after that should we reconstruct admin-only and study planner features.
