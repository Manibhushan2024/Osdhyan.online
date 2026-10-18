# OSDHYAN — Status, Scaling Plan & Roadmap

> **Update 2026-10-18 (evening):** revenue modules added — paid test series with Razorpay, live classes (Jitsi / YouTube Live) with teacher panel, home-tuition marketplace with in-app chat, and a UI/copy clean-up. Laptop hosting with a public link is in `scripts/host/HOSTING.md`. Backend suite: 111 tests. See §7.

> Written 2026-10-18 after a full audit and local end-to-end test of backend (Laravel 11), portal (Next.js 16) and admin.
> Goal: **10,000 students logging in and taking a test at the same time**, reliably, with bulk CSV/Excel question upload for admins.

---

## 1. Where things stand (short version)

| Area | Before | Now (local, verified) |
|---|---|---|
| Student login / register | Worked, but **5 logins/min per IP** — a whole coaching centre or mobile-carrier NAT could be locked out | Limits keyed by IP **+ account**; a shared IP allows 600 logins/min |
| Taking a test | Answers POSTed one-per-click, failures silently dropped; effective limit **~30 saves/min** (double rate-limit bug) → **answers were being lost** | Answers saved on the device first, synced in batches every ~30 s with retry/backoff; offline-safe; “All answers saved” indicator |
| Timer | Client-only, **reset to full time on refresh**, had a **Pause** button, no server deadline | Server-authoritative deadline (`remaining_sec`), no pause, survives refresh/tab close; server rejects answers after deadline + 2 min grace |
| Submit | ~600 DB queries for a 150-question test; double-submit double-counted stats; unattempted always shown as 0 | Scored in memory from a cached answer key, one bulk UPDATE, row-locked & idempotent; unattempted correct |
| Scoring correctness | **Negative marking ignored** for every admin/automation-created test; question order random | Fixed (plus data backfill migration); questions follow admin order |
| Test page under load | Cache stampede when a mock opens | Cached payload with a build lock + per-server APCu cache |
| Admin bulk import | UI existed but **all 4 backend endpoints were missing (404)**; CSV only | Questions / Syllabus / Tests import from **.csv or .xlsx**, dry-run preview, per-row errors, duplicate reuse, optional “create a test from this sheet” |
| Admin 500 errors | Create exam/subject without code, create test without total_marks, syllabus hierarchy endpoints | Fixed |
| Production server | `php artisan serve` (**one request at a time**) on Render free plan, DB in another region (~650 ms/query) | New image: nginx + php-fpm + OPcache + APCu + queue worker + scheduler. **Infra move still required — see §3** |
| AI features | Always mocked in prod (`env()` after `config:cache`); explanations leaked answers mid-test; AI job dispatched on every dashboard view | Keys read via config; explanations only after submit; AI never blocks a request; job deduplicated |

**Verified locally:** 42/42 API smoke checks (`scripts/smoke_test.py`), exact scoring check (45 correct − 5 × 0.25 = 43.75 ✔), browser walkthrough (login → start test → answer → refresh mid-test → resume with answers & timer intact → submit → result page), admin login → bulk import (dry run + real import creating a published test).

**Not yet verified:** the new Docker image was not built (the dev laptop ran out of memory), and no load test has been run against production-like infrastructure. Both are Phase 2 step 1.

---

## 2. Is it self-sufficient for 10k students today?

**The code is now ready to scale horizontally. The current hosting is not.** Three things must change before a real 10k exam:

1. **Stop using Render free + `php artisan serve`.** Free plan = 0.1 CPU, sleeps when idle (50 s cold starts), single-threaded server. → Deploy the new nginx/php-fpm image on paid instances.
2. **Co-locate everything in one region** (e.g. Singapore/Mumbai for Indian students): API, Postgres, Redis. The ~650 ms per query seen earlier was cross-region latency — no code fix can beat that.
3. **Use a connection pooler** for Postgres (Neon “-pooler” endpoint / PgBouncer) and a **same-region Redis** for cache, rate limits and queues.

No change of backend language/framework is needed — Laravel + Postgres + Redis handles this load comfortably when deployed correctly.

### Capacity estimate for 10,000 concurrent students (one mock, same start time)

| Phase of the exam | Request rate (est.) | Notes |
|---|---|---|
| Start burst (login + test + start, spread over ~5 min) | 150–250 req/s | Login is the heaviest (bcrypt) — `BCRYPT_ROUNDS=10` cuts it ~4× |
| During the exam (batched sync every ~30 s + navigation flushes) | ~350–450 req/s | Was ~2 req/s **per student** before (≈20,000 req/s) |
| End (auto-submits spread over 45 s + result page) | ~250–400 req/s | Spread is client-side; server accepts final answers for 2 min |

At ~15–25 ms CPU per request with OPcache, that is roughly **8–12 vCPU of PHP** at peak.

**Recommended starting setup (verify with the load test):**

| Component | Size | Why |
|---|---|---|
| API | 3–4 instances × 2 vCPU / 4 GB (`FPM_MAX_CHILDREN=40`) behind the platform load balancer | Headroom ×2 over the estimate; scale down between exams |
| Workers | 1 small instance with `RUN_WORKERS=1` (web instances `RUN_WORKERS=0`) | Result emails, AI insights, expired-attempt finaliser |
| Postgres | Managed, 2–4 vCPU, same region, **pooled** connection string | ~5–8 queries per request on hot paths, all indexed |
| Redis | Managed, same region, ≥ 1 GB | Token cache, rate limiters, queues, test payloads |
| Portal | Vercel (already) | Static/edge — not the bottleneck |
| CDN | Cloudflare in front of API (optional) | TLS termination, DDoS protection |

---

## 3. What was changed (file map)

**Backend**
- `app/Http/Controllers/Api/TestAttemptController.php`, `app/Services/AttemptScorer.php` — server deadline, bulk upsert sync, locked idempotent scoring, auto-finalise on resume.
- `app/Services/TestAnswerKey.php`, `app/Services/TestPayload.php`, `app/Support/LocalCache.php` — cached answer key & test payloads (Redis + APCu, stampede lock).
- `app/Http/Controllers/Api/AdminBulkImportController.php`, `app/Services/SpreadsheetReader.php` — CSV/XLSX import (no new Composer packages).
- `database/migrations/2026_10_18_000001_add_performance_indexes_and_fix_pivot_marks.php` — 17 indexes, unique `(attempt, question)`, negative-marking backfill.
- `app/Providers/AppServiceProvider.php`, `routes/api.php`, `AuthController.php` — named rate limiters, identity-keyed auth throttles.
- `app/Models/PersonalAccessToken.php`, `config/sanctum.php` — token lookup cache (now actually registered), `last_used_at` writes throttled, tokens expire after 30 days.
- `AnalyticsController.php` — overview cached per user, no responses eager-load, AI never on the request path, explanations gated until submit.
- `AdminTestController.php`, `AdminCourseController.php`, `AdminAutomationController.php`, `Models/Test.php`, `Subject.php`, `Chapter.php`, `Support/Slug.php` — 500 fixes, pivot marks, cache busting, ordering.
- `app/Console/Commands/FinalizeExpiredAttempts.php`, `routes/console.php` — auto-submit abandoned attempts every 5 min; prune expired tokens.
- `Dockerfile`, `docker/*`, `supervisor.conf`, `render.yaml`, `docker-compose.yml` — production image & deploy config.
- Seeders: `LocalDevUsersSeeder` (demo student/admin), `LoadTestUsersSeeder` (bulk users) — both refuse to run in production.

**Portal**
- `dashboard/tests/play/[id]/page.tsx` — offline-safe player (local save, batched sync, server timer, retrying submit, resume, 401-safe).
- `admin/bulk-import/page.tsx` — Excel support, “create a test from this sheet”.
- `lib/api.ts`, `lib/redirect.ts`, `AuthProvider.tsx`, `auth/login`, `auth/signup`, `auth/callback` — Bearer-only (no CSRF call per page load), `?redirect=` after login, OAuth callback fix.
- `DashboardLayout.tsx`, `Sidebar.tsx` — removed the hard redirect of admins to `http://localhost:8000/admin`; auth guard on private dashboard pages.
- `dashboard/tests/page.tsx` — question count on cards was showing total marks.
- `next.config.ts` — camera/mic allowed for live classes. Deleted the leftover `auth/linkedin-callback` dev page.

**Scripts:** `scripts/smoke_test.py` (end-to-end API check), `scripts/load_test.py` (exam-day load simulation).

---

## 4. Bulk upload format (admins)

Admin → **Bulk Import** → *Questions* tab. Upload **.xlsx** or **.csv** (for Hindi in CSV, save as “CSV UTF-8”). Always run **Dry Run** first.

| Column | Required | Notes |
|---|---|---|
| `question_en` | ✔ (or `question_hi`) | Also accepts “Question” |
| `question_hi` | | Hindi question |
| `option_a` … `option_e` | ✔ at least A, B | Also “Option A”; Hindi in `option_a_hi` … |
| `correct_option` | ✔ | `A`–`E`, `1`–`5`, or the exact option text. Also “Answer” |
| `explanation_en`, `explanation_hi` | | Shown after submit |
| `difficulty` | | easy / medium / hard |
| `exam_code`, `subject_name_en`, `chapter_name_en`, `topic_name_en` | | Subject/chapter/topic auto-created under the exam |
| `marks`, `negative_marks` | | Per question; otherwise the test defaults |

Turn on **“Also create a test from this sheet”** to get a ready test (name, duration, marks, negative marking) in one upload. Questions already in the bank (same text) are reused, not duplicated. The *Tests* tab builds a test from the existing bank using `TEST` / `SECTION` / `CRITERIA` / `Q_IDS` rows; the *Syllabus* tab bulk-creates subjects/chapters/topics. Download the templates from each tab.

---

## 5. Phase-wise plan

### Phase 1 — Finish local (≈ 1 week)  ← **we are here**
1. ✅ Fix answer loss, timer, scoring, submit, rate limits, admin 500s, bulk import (done in this pass).
2. Review & commit the changes on a branch; open a PR.
3. Set the local `.env` DB password correctly (see §6) and run `php artisan migrate` on your own database.
4. ✅ Backend feature test suite (45 tests: attempt flow & scoring, bulk import, rate limits) runs in CI — `php artisan test`. Still to add: Playwright end-to-end tests for the test player.
5. Decide on the hardcoded marketing numbers on test cards (“206.1k Students”, “4.8 Rating”) — they are fake data shown to every student.
6. Hide or finish unfinished features: live-class teacher endpoints are missing (UI calls 404 routes) and WebRTC signalling is a stub; blogs return empty; `/dashboard/*` guest views 401 because all content APIs require login.
7. Password reset / OTP: SMS sending is a log-only stub and email needs a queue worker + Resend key — wire a real SMS provider (MSG91/Textlocal) or hide OTP login.

### Phase 2 — Staging & cloud deployment (≈ 1 week)
1. Build the new image (`docker build backend`) and run it with `docker compose up` on a machine with ≥ 8 GB free RAM; run `scripts/smoke_test.py` against it.
2. Create staging in **one region**: API (2 instances), managed Postgres (pooled URL), managed Redis. Set env from `render.yaml` (APP_KEY, DATABASE_URL, REDIS_URL, ALLOWED_ORIGINS, ADMIN_EMAIL/PASSWORD, BCRYPT_ROUNDS=10).
3. Seed load users: `LOADTEST_USERS=10000 php artisan db:seed --class=LoadTestUsersSeeder` (staging only).
4. Run `scripts/load_test.py` from 2–3 machines/cloud VMs in steps: 500 → 2,000 → 5,000 → 10,000 students. Target: p95 < 500 ms, error rate < 0.1 %. Watch DB CPU, connection count, Redis ops.
5. Tune `FPM_MAX_CHILDREN`, instance count, DB size from the results; repeat until 10k passes with 2× headroom.
6. Move uploads (materials, images) to S3/R2 — Render disk is wiped on deploy.
7. Monitoring: Sentry DSNs (already integrated, need keys), uptime check on `/api/health`, DB/Redis dashboards, alert on 5xx rate.
8. Production cut-over: DNS (`api.osdhyan.com` currently does **not** resolve), TLS, backups (daily DB snapshot + PITR), rotate any keys that were ever committed or shared.

### Phase 3 — Mobile app (≈ 2 weeks)
1. Point the Expo app to the production API; it still uses the old one-request-per-click save (`/attempts/{id}/responses`) — port the portal’s offline queue + batched sync + server timer (`remaining_sec`) to the app.
2. Handle 409 `ATTEMPT_CLOSED` and idempotent submit like the portal.
3. EAS builds (internal track) → Play Store closed testing → production. Push notifications (Expo + FCM) for test reminders/results.

### Phase 4 — Exam-day hardening (before first big live mock)
1. Full dress rehearsal at 10k with the real test content.
2. Scale-up runbook: raise instance count 1 h before a scheduled mock, scale down after.
3. Admin “exam mode”: schedule tests with a start window (start_at/end_at), so not everyone can start at the same second.
4. Leaderboard/rank via Redis sorted sets computed after the exam (not live).
5. Incident playbook: what to do if DB or Redis is degraded (students keep answering offline; submits retry for minutes).

### Phase 5 — Growth features (after launch)
Payments (Razorpay) & paid series enforcement (`is_free`, enrolment checks), referral, streaks, video explanations, image questions in bulk import (`image_url` column is accepted today but images aren’t uploaded), AI insights with a real key, read replica for analytics.

---

## 6. Running locally

```bash
# Backend
cd backend
cp .env.example .env            # set DB_PASSWORD to your local Postgres password
php artisan key:generate
php artisan migrate
php artisan db:seed --class=LocalDevUsersSeeder   # demo student + admin (see the class docblock)
php artisan serve                                 # dev only — production uses the Docker image

# Portal
cd apps/portal && npm run dev                     # http://localhost:3000

# Checks
python scripts/smoke_test.py --admin-login admin@local.test --admin-password <see LocalDevUsersSeeder>
```

Note: the password in `backend/.env` does not match the local PostgreSQL 16 service on this machine, so testing in this pass used a separate throw-away Postgres on port 5433 (`DB_PORT=5433`).

---

## 7. Revenue modules (added 2026-10-18)

| Module | What works | Needs from you |
|---|---|---|
| **Paid test series** (`routes/api/payments.php`) | Admin sets price / MRP / validity on a series; students see price, pay via Razorpay checkout, access is granted (with expiry), locked tests show a lock; My Purchases page; admin Orders & revenue page (today / 7d / 30d / total, top series); webhook keeps orders in sync. `PAYMENTS_FAKE=true` gives a working **test-mode** checkout until keys exist. | Razorpay account → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, webhook at `https://<host>/api/webhooks/razorpay` with `RAZORPAY_WEBHOOK_SECRET`; set `PAYMENTS_FAKE=false`. Note: tests inside a paid series stay free until you untick *Free* on them (admin → Tests → Edit). |
| **Live classes** (`routes/api/live.php`) | Teacher panel (`/dashboard/live/manage`): schedule, Go live, End, add recording, copy link. In-class: video (Jitsi) or YouTube Live embed, chat, pin/answer, polls, raise hand, participants, **join from a second device** (link + password + QR). Students: Live now / Upcoming / Recordings. | Free: works with public `meet.jit.si` (the teacher signs in once to become moderator). Better: JaaS (8x8) keys `JAAS_APP_ID`, `JAAS_API_KEY_ID`, `JAAS_PRIVATE_KEY` → no sign-in, up to 100 participants; or self-hosted Jitsi. For 500+ students use **YouTube Live** (OBS → YouTube, paste the link). |
| **Home tuition** (`routes/api/tuition.php`) | Teachers register (`/teach/register`), admin verifies (`/admin/teachers`), students search tutors by subject/exam/city/mode, post requirements, teachers send proposals from Leads, student accepts → chat opens. Contact details are never exposed; all contact is through chat. | Decide the revenue rule: lead fee per proposal / contact (hooks marked `TODO(revenue)` in `TuitionController`), or commission on the agreed fee at accept. |
| **Chat** (`routes/api/chat.php`) | 1:1 conversations (student ↔ teacher), unread counts, polling (4 s thread / 15 s list). Reusable for support chat later. | Upgrade path: Laravel Reverb websockets when traffic grows. |

**Tests:** 111 backend feature tests (`php artisan test`), `scripts/smoke_test.py` (42 checks) and `scripts/smoke_modules.py` (46 checks) — all green on the laptop host.

### What to do first to earn revenue
1. Upload content (Admin → Bulk import, .xlsx), create 2–3 paid series with prices, keep one free series as a funnel.
2. Get Razorpay live keys (KYC takes a few days) — until then checkout runs in test mode.
3. Register 5–10 tutors in your city, verify them, and announce the tuition board.
4. Run one free YouTube-Live class per week to bring students in; sell the paid series inside the class.
5. Move hosting to the cloud (Phase 2) before the first big scheduled mock.

