# Backend Workspace

This folder now contains the recovered backend source that could be reconstructed from the current repository.

## Current State

The backend is not yet a complete Laravel application. The recovered source is enough to continue reconstruction, but framework bootstrap files, migrations, and many controllers are still missing.

## Key Files

- `app/Http/Controllers/Api/`
- `app/Models/`
- `app/Services/`
- `routes/api.php`
- `recovery/RECOVERY-STATUS.md`

## Current Priority

Reconstruct the minimum student-facing API required by the mobile app:

1. auth
2. tests and attempts
3. test series
4. content read flows

## Tests

```bash
cd backend
php artisan test                       # whole suite, SQLite in memory (~25 s)
php artisan test --filter=BulkImport   # one file / test name
```

- `tests/Feature/TestAttemptFlowTest.php` — start/resume, server timer, batched sync, deadline + grace, scoring (incl. negative marking), idempotent submit, expired-attempt finaliser, answer leakage.
- `tests/Feature/BulkImportTest.php` — CSV/XLSX question, syllabus and test imports, dry run, duplicates, admin-only.
- `tests/Feature/RateLimitingTest.php` — shared-IP logins, answer-sync budget, token cache and logout revocation.
- Test data is built with the helpers in `tests/Concerns/BuildsExamData.php`. The BPSC content-seed migration is skipped when `APP_ENV=testing`.
- CI runs the suite on every push/PR (`.github/workflows/ci.yml`, job `backend-tests`).
- End-to-end check against a running server: `python ../scripts/smoke_test.py --api http://localhost:8000/api`.

