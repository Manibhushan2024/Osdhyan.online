# OSDHYAN — Complete Build & Deployment Guide

> **Version:** 2026-04-24  
> **Platform:** India's competitive exam test-series platform (BPSC, UPSC, SSC, NCERT)  
> **Stack:** Laravel 11 · Next.js 16 · React Native / Expo 54 · PostgreSQL · Redis

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current State — What's Built](#2-current-state--whats-built)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [API Reference](#5-api-reference)
6. [Database Schema](#6-database-schema)
7. [Queue System & Jobs](#7-queue-system--jobs)
8. [Email System](#8-email-system)
9. [Admin Panel](#9-admin-panel)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Mobile App](#11-mobile-app)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Production Deployment](#13-production-deployment)
14. [Remaining Roadmap](#14-remaining-roadmap)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        OSDHYAN Platform                          │
├─────────────────┬──────────────────┬────────────────────────────┤
│  Portal (Web)   │  Mobile App      │  Backend API               │
│  Next.js 16     │  Expo RN 54      │  Laravel 11                │
│  React 19       │  TypeScript      │  PHP 8.2                   │
│  Tailwind 4     │  React Native    │  Sanctum Auth              │
│  Port :3000     │  iOS / Android   │  Port :8000                │
├─────────────────┴──────────────────┤                            │
│          Browser / Mobile          │  PostgreSQL 16             │
│  ── axios (Bearer token auth) ──►  │  Redis (cache/queue/sess)  │
│                                    │  Laravel Horizon           │
│                                    │  Filament Admin (/admin)   │
└────────────────────────────────────┴────────────────────────────┘

External services:
  Resend (transactional email)  ·  Sentry (error tracking)
  Google OAuth  ·  TextLocal SMS  ·  Gemini/OpenAI (AI features)
```

### Monorepo layout

```
test-series-platform/
├── backend/              Laravel 11 API
├── apps/
│   └── portal/           Next.js 16 web portal
├── mobile/
│   └── osdhyan/          Expo React Native app
├── docker-compose.yml    Full local stack
├── .github/workflows/    GitHub Actions CI
└── NEW_DOCUMENTATION.md  This file
```

---

## 2. Current State — What's Built

### Backend ✅ Complete

| Layer | Status | Notes |
|-------|--------|-------|
| Laravel 11 scaffold | ✅ | artisan, bootstrap, vendor all present |
| PostgreSQL migrations | ✅ | 12 migrations: users, exams, subjects, chapters, topics, questions+options, tests, test_series, attempts, responses, study tables |
| Auth (OTP + Google OAuth + JWT) | ✅ | Sanctum tokens, rate-limited |
| Test attempt engine | ✅ | start/sync/complete with scoring |
| Analytics (AI-powered) | ✅ | async Gemini/OpenAI via queue |
| Laravel Horizon | ✅ | 3 queues: default/ai/mail |
| Email system | ✅ | Resend driver, 3 transactional templates |
| Rate limiting | ✅ | Per-action brute-force protection |
| CORS | ✅ | Env-driven allowed origins |
| Filament admin panel | ✅ | `/admin` route |
| robots.txt + sitemap | ✅ | SEO-ready |
| Sentry (Laravel) | ✅ installed | Needs real DSN |
| API controllers | ✅ 19 controllers | All routes loading |

### Frontend (Portal) ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Auth flow (OTP / Google) | ✅ | Login, signup, forgot password |
| Dashboard home | ✅ | Stats, recent tests |
| Test player | ✅ | 836-line full-featured player |
| Test result & solutions | ✅ | Score card, per-question solutions |
| Analytics page | ✅ | Charts, AI insights, topic breakdown |
| Test series | ✅ | Browse, enroll, track |
| Focus timer | ✅ | 886-line Pomodoro-style focus session |
| Notes | ✅ | CRUD note-taking |
| History | ✅ | Attempt history |
| Syllabus explorer | ✅ | Hierarchy browser |
| Practice hub | ✅ | Links to tests, series, PYQs |
| Profile / Settings | ✅ | Edit profile, change password |
| Admin panel (Next.js) | ✅ | Questions, tests, test-series, bulk import |
| SEO (OG, sitemap, JSON-LD) | ✅ | Full metadata |
| Sentry (Next.js) | ✅ installed | Needs real DSN |

### Mobile (Expo) ✅ Structured

| Screen | Status |
|--------|--------|
| Auth (login/register/OTP) | ✅ |
| Home | ✅ |
| Tests | ✅ |
| Learn | ✅ |
| Live | ✅ |
| Profile | ✅ |

### Pending (requires external accounts)

| Item | Blocker | Action |
|------|---------|--------|
| Transactional email | Needs real `RESEND_API_KEY` | Create account at resend.com |
| Error tracking | Needs real `SENTRY_LARAVEL_DSN` + `NEXT_PUBLIC_SENTRY_DSN` | Create projects at sentry.io |
| Google OAuth | Needs `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | GCP console → OAuth credentials |
| SMS OTP | Needs `SMS_API_KEY` | TextLocal account |
| AI features | Needs `GEMINI_API_KEY` or `OPENAI_API_KEY` | Google AI Studio / OpenAI |

---

## 3. Local Development Setup

### Prerequisites

| Tool | Version | Windows Install |
|------|---------|----------------|
| PHP | 8.2+ | XAMPP (xampp-windows-x64-8.2.*) |
| Composer | 2.x | getcomposer.org |
| Node.js | 20+ | nodejs.org |
| Docker Desktop | 4.x | docker.com |
| Redis | 7.x | via Docker (recommended) |
| PostgreSQL | 16 | via Docker (recommended) |

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd test-series-platform
```

### Step 2 — Start infrastructure (Docker)

```bash
# Start PostgreSQL + Redis only (backend runs natively via PHP)
docker compose up -d postgres redis

# Verify services are healthy
docker compose ps
```

> **Note:** If you have a local PostgreSQL service, stop it first so Docker takes port 5432.

### Step 3 — Backend setup

```bash
cd backend

# Install PHP dependencies
composer install --ignore-platform-req=ext-pcntl --ignore-platform-req=ext-posix

# Copy and edit environment file
cp .env.example .env

# Fill in your API keys in .env (see Section 4)

# Generate application key
php artisan key:generate

# Run all migrations
php artisan migrate

# Link storage
php artisan storage:link

# Cache config and routes
php artisan config:cache
php artisan route:cache

# (Optional) Start the dev server
php artisan serve --port=8000
```

### Step 4 — Frontend (Portal) setup

```bash
cd apps/portal

# Install dependencies
npm install

# Copy and edit environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL, etc.

# Start dev server
npm run dev
# → http://localhost:3000
```

### Step 5 — Mobile setup

```bash
cd mobile/osdhyan

npm install

# Start Expo dev server
npx expo start

# Run on device/emulator
npx expo run:android   # or
npx expo run:ios
```

### Step 6 — (Optional) Run Horizon queue worker

```bash
cd backend
# On Linux/Mac only — pcntl is not available on Windows
php artisan horizon

# On Windows dev, run the standard queue worker instead:
php artisan queue:work --queue=ai,mail,default
```

### Step 7 — Verify everything

```bash
# Backend health
curl http://localhost:8000/up

# Redis connection
php artisan tinker --execute="echo Cache::put('k','v',60)?'OK':'FAIL';"

# Routes
php artisan route:list --path=api | head -20
```

---

## 4. Environment Variables Reference

### backend/.env (complete)

```env
# ── App ────────────────────────────────────────────────────────────
APP_NAME="OSDHYAN"
APP_ENV=local                          # production for live
APP_DEBUG=true                         # false in production
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# ── Database ───────────────────────────────────────────────────────
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=test_series_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# ── Redis ──────────────────────────────────────────────────────────
CACHE_DRIVER=redis                     # Laravel 11 also reads CACHE_STORE
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# ── Email (Resend) — https://resend.com ────────────────────────────
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="noreply@osdhyan.com"
MAIL_FROM_NAME="OSDHYAN"
RESEND_API_KEY=re_XXXX                 # ← GET FROM resend.com

# ── AI ─────────────────────────────────────────────────────────────
AI_PROVIDER=gemini                     # gemini | openai
GEMINI_API_KEY=                        # ← GET FROM aistudio.google.com
OPENAI_API_KEY=                        # ← GET FROM platform.openai.com
AI_MODEL=gemini-2.5-flash

# ── SMS ────────────────────────────────────────────────────────────
SMS_PROVIDER=textlocal
SMS_API_KEY=                           # ← GET FROM textlocal.in
SMS_SENDER_ID=OSDHYN

# ── Google OAuth ───────────────────────────────────────────────────
GOOGLE_CLIENT_ID=                      # ← GCP Console → APIs → OAuth
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"

# ── Sanctum ────────────────────────────────────────────────────────
SANCTUM_STATEFUL_DOMAINS="localhost:3000,localhost,127.0.0.1"

# ── Sentry ─────────────────────────────────────────────────────────
SENTRY_LARAVEL_DSN=                    # ← GET FROM sentry.io (Laravel project)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_SEND_DEFAULT_PII=false

# ── Horizon ────────────────────────────────────────────────────────
HORIZON_PATH=horizon

# ── CORS (production only) ─────────────────────────────────────────
# ALLOWED_ORIGINS=https://osdhyan.com,https://www.osdhyan.com
```

### apps/portal/.env.local (complete)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=               # ← GET FROM sentry.io (Next.js project)
```

---

## 5. API Reference

All endpoints are prefixed with `/api`. Authentication uses **Bearer tokens** via Laravel Sanctum.

### Auth (public)

| Method | Endpoint | Description | Rate limit |
|--------|----------|-------------|-----------|
| POST | `/auth/login` | Email+password login | 10/min |
| POST | `/auth/admin/login` | Admin login | 10/min |
| POST | `/auth/register` | Register new user | 10/hour |
| POST | `/auth/send-otp` | Send OTP via SMS (email fallback) | 3/min |
| POST | `/auth/verify-otp` | Verify OTP, receive token | 10/min |
| POST | `/auth/forgot-password` | Send reset OTP | 5/5min |
| POST | `/auth/reset-password` | Reset via OTP | 10/min |
| GET | `/auth/google/redirect` | Google OAuth redirect | — |
| GET | `/auth/google/callback` | Google OAuth callback | — |

### Tests & Attempts (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tests` | List tests (paginated, filterable) |
| GET | `/tests/{id}` | Test detail with questions |
| GET | `/tests/{id}/attempts` | User's attempts for a test |
| POST | `/tests/{id}/attempts` | Start new attempt |
| GET | `/tests/{id}/latest-attempt` | Resume in-progress attempt |
| GET | `/attempts/{id}` | Attempt detail + responses |
| POST | `/attempts/{id}/responses` | Save single response |
| POST | `/attempts/{id}/sync` | Bulk sync responses (120/min) |
| POST | `/attempts/{id}/complete` | Submit + score attempt |
| POST | `/attempts/{id}/assistant-chat` | AI chat about attempt (20/min) |

### Analytics (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | AI insights + stats (async, cached 6h) |
| GET | `/analytics/topics` | Topic-wise performance (cached 30min) |
| GET | `/analytics/explanation/{question}` | AI explanation (cached 30 days) |

### Test Series (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test-series` | Browse test series |
| GET | `/test-series/enrolled` | User's enrolled series |
| GET | `/test-series/{id}` | Series detail with tests |
| POST | `/test-series/{id}/enroll` | Enroll in series |
| POST | `/test-series/{id}/unenroll` | Unenroll |

### Syllabus (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exams` | All exams (cached 1h) |
| GET | `/exams/{id}/subjects` | Subjects for exam |
| GET | `/subjects/{id}/chapters` | Chapters for subject |
| GET | `/chapters/{id}/topics` | Topics for chapter |
| GET | `/exams/{id}/full` | Complete hierarchy (cached 1h) |

### Study & Productivity (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/DELETE | `/study-goals` | Manage study goals |
| GET | `/study-sessions/active` | Active session |
| POST | `/study-sessions/start` | Start session |
| POST | `/study-sessions/{id}/pause\|resume\|stop\|sync` | Session lifecycle |
| GET/POST/PATCH/DELETE | `/notes` | CRUD notes |
| GET/POST | `/achievements` | Achievements |

### Admin (admin middleware)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/subjects\|chapters\|topics` | Create syllabus nodes |
| PUT/DELETE | `/admin/subjects\|chapters\|topics/{id}` | Update/delete nodes |
| POST | `/admin/questions` | Create question with options |
| GET | `/admin/questions/search` | Search questions |
| POST | `/admin/tests/with-questions` | Create test + attach questions |
| GET/POST/DELETE | `/admin/test-series` | Manage test series |
| POST | `/admin/automation/import-mock-test` | Bulk import test via JSON |
| GET | `/admin/analytics/overview` | Platform analytics (cached 10min) |

### Root Admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH/DELETE | `/admin/users` | Manage admin users |

---

## 6. Database Schema

```
exams                          subjects                   chapters
┌──────────────┐              ┌──────────────┐           ┌──────────────┐
│ id           │──┐           │ id           │──┐        │ id           │
│ name_en      │  └──────────►│ exam_id      │  └───────►│ subject_id   │
│ name_hi      │              │ name_en      │           │ name_en      │
│ slug         │              │ name_hi      │           │ name_hi      │
│ description  │              │ slug         │           │ slug         │
└──────────────┘              └──────────────┘           └──────────────┘
                                                                │
topics                                                          │
┌──────────────┐◄───────────────────────────────────────────────┘
│ id           │
│ chapter_id   │
│ name_en/hi   │
└──────────────┘

questions                      question_options
┌──────────────┐              ┌──────────────────┐
│ id           │──────────────│ question_id       │
│ subject_id   │              │ label (A/B/C/D)   │
│ chapter_id   │              │ option_en/hi      │
│ topic_id     │              │ is_correct        │
│ question_en  │              └──────────────────┘
│ question_hi  │
│ explanation  │              question_test (pivot)
│ difficulty   │──────────────┌──────────────────┐
└──────────────┘              │ question_id       │
                              │ test_id           │
tests                         │ sort_order        │
┌──────────────┐◄─────────────┤                   │
│ id           │              └──────────────────┘
│ exam_id      │
│ name_en/hi   │
│ mode         │  test_attempts
│ status       │  ┌──────────────────┐
│ duration_sec │──│ id               │
│ neg_marking  │  │ user_id          │
│ total_marks  │  │ test_id          │  test_responses
└──────────────┘  │ status           │  ┌──────────────────┐
                  │ total_score      │──│ test_attempt_id   │
test_series       │ time_taken_sec   │  │ question_id       │
┌──────────────┐  │ metadata (JSON)  │  │ selected_option_id│
│ id           │  └──────────────────┘  │ is_marked_review  │
│ exam_id      │                        │ time_taken_sec    │
│ name_en/hi   │  users                 │ marks_obtained    │
│ is_published │  ┌──────────────────┐  └──────────────────┘
└──────────────┘  │ id               │
                  │ name/username    │
user_test_series  │ email/phone      │
test_series_tests │ google_id/avatar │
(pivot tables)    │ is_admin/role    │
                  │ exam_preference  │
                  │ avg_accuracy     │
                  │ total_study_sec  │
                  └──────────────────┘
```

---

## 7. Queue System & Jobs

OSDHYAN uses **Laravel Horizon** with 3 specialized queues:

| Queue | Timeout | Workers | Purpose |
|-------|---------|---------|---------|
| `default` | 90s | 5 | General tasks |
| `ai` | 300s | 2 | AI API calls (Gemini/OpenAI) |
| `mail` | 30s | 3 | Transactional emails |

### Background jobs

| Job | Queue | Trigger | Caches result |
|-----|-------|---------|--------------|
| `GenerateAIInsightsJob` | ai | Analytics overview miss | `ai_insights_{userId}` for 6h |
| `GenerateAIExplanationJob` | ai | Explanation request miss | `ai_explanation_{questionId}` for 30 days |
| `SendTestResultEmailJob` | mail | Test completion | — |

### Cache keys

```php
ai_insights_{userId}           // 6 hours  — AI-generated user insights
ai_explanation_{questionId}    // 30 days  — AI explanation for question
topic_performance_{userId}     // 30 min   — Topic-wise score breakdown
exams_list                     // 1 hour   — All exams
exam_{id}_subjects             // 1 hour   — Subjects for exam
exam_{id}_full                 // 1 hour   — Full exam hierarchy
admin_analytics_overview       // 10 min   — Platform-wide analytics
```

### Running workers locally

```bash
# Windows dev (pcntl unavailable)
cd backend
php artisan queue:work redis --queue=ai,mail,default --tries=3

# Linux/Mac or Docker
php artisan horizon
```

---

## 8. Email System

Driver: **Resend** (`resend/resend-laravel`)

| Mail class | Trigger | Template |
|------------|---------|----------|
| `WelcomeEmail` | Register / OTP verify / Google OAuth | `emails.welcome` |
| `OtpEmail` | OTP send-otp / forgot-password (SMS fallback) | `emails.otp` |
| `TestResultEmail` | Test completion | `emails.test_result` |

All mail classes implement `ShouldQueue` → dispatched to the `mail` queue.

### Getting Resend API key (free tier: 3,000 emails/month)

1. Go to **resend.com** → Sign up
2. Add and verify your domain (`osdhyan.com`)
3. API Keys → Create key
4. Copy `re_xxxx` value into `backend/.env` as `RESEND_API_KEY`

---

## 9. Admin Panel

OSDHYAN has **two** admin interfaces:

### A. Filament Admin (Laravel) — `/admin`

- Full database CRUD via Filament 3 UI
- Protected by `is_admin = true` and `admin_role = root|editor`
- Access: `http://localhost:8000/admin`
- Create first root admin via tinker:

```bash
php artisan tinker --execute="
App\Models\User::create([
  'name' => 'Admin',
  'email' => 'admin@osdhyan.com',
  'password' => bcrypt('your-password'),
  'is_admin' => true,
  'admin_role' => 'root',
]);
"
```

### B. Next.js Admin — `/admin` (portal)

- Question creation with cascading selectors
- Test series management
- Bulk import via JSON
- Test management

---

## 10. Frontend Architecture

### Tech stack

```
Next.js 16 (App Router)
React 19 + TypeScript
Tailwind CSS 4
TanStack Query 5 (server state)
Lucide React (icons)
Sentry (error tracking)
```

### Directory structure

```
apps/portal/src/
├── app/                    Next.js App Router pages
│   ├── layout.tsx          Root layout (OG meta, JSON-LD, fonts)
│   ├── page.tsx            Landing page (marketing)
│   ├── auth/               Login, signup, forgot-password, OTP
│   ├── dashboard/          Student dashboard
│   │   ├── page.tsx        Home dashboard (stats, recent tests)
│   │   ├── tests/          Test listing + player + result + solutions
│   │   ├── analytics/      AI-powered performance insights
│   │   ├── test-series/    Browse and enroll
│   │   ├── focus/          Pomodoro focus timer
│   │   ├── notes/          Note taking
│   │   ├── history/        Attempt history
│   │   ├── syllabus/       Syllabus explorer
│   │   ├── practice/       Practice hub
│   │   ├── productivity/   Productivity tracker
│   │   ├── settings/       Account settings
│   │   └── identity/       Profile editor
│   └── admin/              Admin panel (question/test management)
├── components/
│   ├── auth/               Auth form components
│   ├── dashboard/          Dashboard widgets and cards
│   ├── courses/            Course/syllabus components
│   ├── layout/             Sidebar, navbar, shell
│   ├── providers/          React context providers
│   └── ui/                 Reusable UI primitives
├── hooks/                  Custom React hooks (API data fetching)
├── lib/
│   ├── api.ts              Axios instance + auth interceptors
│   ├── axios.ts            Compat alias for api.ts
│   ├── storage.ts          Storage URL helper
│   └── utils.ts            Shared utilities
├── app/robots.ts           Next.js robots.txt
└── app/sitemap.ts          Next.js sitemap
```

### API communication

All API calls go through `src/lib/api.ts`:
- Base URL from `NEXT_PUBLIC_API_URL`
- Bearer token automatically attached from `localStorage`
- 401 responses → auto logout and redirect
- Admin routes use `admin_auth_token` key

---

## 11. Mobile App

### Tech stack

```
Expo SDK 54
React Native (TypeScript)
Expo Router (file-based navigation)
EAS Build (cloud builds)
```

### Directory structure

```
mobile/osdhyan/
├── src/
│   ├── screens/            Auth, Home, Tests, Learn, Live, Profile
│   ├── components/         Shared RN components
│   ├── navigation/         Navigation configuration
│   ├── store/              State management
│   ├── api/                API client
│   ├── theme/              Colors, typography
│   ├── types/              TypeScript types
│   └── utils/              Utilities
├── app.config.ts           Expo config (app name, bundle ID, etc.)
└── eas.json                EAS build profiles (development, preview, production)
```

### Build commands

```bash
cd mobile/osdhyan

# Development build (requires physical device or emulator)
npx expo run:android
npx expo run:ios

# EAS cloud build
eas build --profile preview --platform android
eas build --profile production --platform all

# Publish OTA update
eas update --channel production --message "Bug fixes"
```

---

## 12. CI/CD Pipeline

GitHub Actions runs on every push to `main` / `develop` and on pull requests.

### Jobs

| Job | What it checks | Blocks merge? |
|-----|---------------|---------------|
| `portal-lint` | TypeScript typecheck + ESLint | Yes |
| `portal-build` | `next build` with prod env | Yes (depends on lint) |
| `backend-syntax` | `php -l` on all PHP files | Yes |
| `mobile-typecheck` | TypeScript typecheck | Yes |

### Workflow file

```yaml
# .github/workflows/ci.yml
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main, develop] }
```

---

## 13. Production Deployment

### Option A — VPS (DigitalOcean / AWS EC2 / GCP Compute)

#### Server requirements

- Ubuntu 22.04 LTS
- 2 vCPU, 4 GB RAM minimum
- 40 GB SSD
- PHP 8.2-fpm, Nginx, PostgreSQL 16, Redis 7, Supervisor

#### Step 1 — Server setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx php8.2-fpm php8.2-pgsql php8.2-redis \
  php8.2-zip php8.2-mbstring php8.2-xml php8.2-curl \
  postgresql-16 redis-server supervisor git unzip

# Install Composer
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

#### Step 2 — Clone and configure backend

```bash
cd /var/www
sudo git clone <repo-url> osdhyan
sudo chown -R www-data:www-data osdhyan

cd /var/www/osdhyan/backend
composer install --no-dev --optimize-autoloader

cp .env.example .env
# Fill in ALL production values (see Section 4)
# APP_ENV=production, APP_DEBUG=false, real API keys

php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan sitemap:generate
```

#### Step 3 — Nginx config

```nginx
# /etc/nginx/sites-available/osdhyan-api
server {
    listen 80;
    server_name api.osdhyan.com;
    root /var/www/osdhyan/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* { deny all; }

    # Gate Horizon to admin IPs
    location /horizon {
        allow YOUR.ADMIN.IP;
        deny all;
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/osdhyan-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.osdhyan.com
```

#### Step 4 — Supervisor (Horizon + Scheduler)

```bash
sudo cp /var/www/osdhyan/backend/supervisor.conf /etc/supervisor/conf.d/osdhyan.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start osdhyan:*
sudo supervisorctl status  # both osdhyan-horizon and osdhyan-scheduler should be RUNNING
```

#### Step 5 — Frontend deploy (Vercel)

```bash
# Connect repo to Vercel, set root directory to apps/portal
# Environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.osdhyan.com/api
NEXT_PUBLIC_STORAGE_URL=https://api.osdhyan.com/storage
NEXT_PUBLIC_SITE_URL=https://osdhyan.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

#### Step 6 — Production CORS

```env
# backend/.env (production)
ALLOWED_ORIGINS=https://osdhyan.com,https://www.osdhyan.com
```

### Option B — Docker (Recommended for staging)

```bash
# Full stack (postgres + redis + backend + horizon + portal)
docker compose up -d

# Run migrations inside container
docker compose exec backend php artisan migrate --force

# Access:
# API: http://localhost:8000
# Portal: http://localhost:3000
# Horizon: http://localhost:8000/horizon
```

### Option C — Railway / Render (No-ops)

1. Create new project → Deploy from GitHub
2. Select `backend/` as the root
3. Set all environment variables from Section 4
4. Add a PostgreSQL and Redis plugin
5. Set start command: `php artisan serve --host=0.0.0.0 --port=$PORT`
6. For Next.js: new service → `apps/portal/` root → Node.js buildpack

---

## 14. Remaining Roadmap

### Phase 1 — Third-party integrations (needs your accounts)

- [ ] Resend API key → enable transactional email
- [ ] Sentry DSN → enable error tracking
- [ ] Google OAuth credentials → enable social login
- [ ] Gemini / OpenAI API key → enable AI features
- [ ] TextLocal SMS key → enable OTP via SMS

### Phase 2 — Content layer

- [ ] Implement blog/article system (ContentController fully built out)
- [ ] Study materials with PDF/video upload (S3 / R2)
- [ ] Live classes integration (Jitsi / 100ms)
- [ ] NCERT content structured by class → subject → chapter → topic

### Phase 3 — Advanced features

- [ ] Leaderboard (Redis sorted sets)
- [ ] Streak tracking (daily login streak)
- [ ] Push notifications (Expo + FCM for mobile)
- [ ] Referral system
- [ ] Subscription / payment (Razorpay)
- [ ] Mock interview module
- [ ] Video explanations per question

### Phase 4 — Scale & monitoring

- [ ] CDN for static assets (Cloudflare)
- [ ] Read replica for analytics queries
- [ ] Grafana + Prometheus dashboards
- [ ] Load testing (k6)
- [ ] Blue-green deployment

---

## Quick Reference Cheatsheet

```bash
# ─── Backend dev commands ────────────────────────────────────────
php artisan serve                     # Start dev server :8000
php artisan migrate                   # Run new migrations
php artisan migrate:rollback          # Rollback last batch
php artisan queue:work                # Process queue jobs (Windows)
php artisan horizon                   # Process queues with Horizon (Linux)
php artisan config:cache              # Cache config (production)
php artisan route:cache               # Cache routes (production)
php artisan config:clear              # Clear config cache
php artisan tinker                    # REPL
php artisan sitemap:generate          # Regenerate sitemap

# ─── Frontend commands ──────────────────────────────────────────
npm run dev                           # Start dev server :3000
npm run build                         # Production build
npm run lint                          # ESLint
npx tsc --noEmit                      # TypeScript check

# ─── Docker commands ────────────────────────────────────────────
docker compose up -d                  # Start all services
docker compose up -d postgres redis   # Start only DB + cache
docker compose ps                     # Service health
docker compose exec backend bash      # Shell into backend container
docker compose logs -f horizon        # Follow Horizon logs

# ─── Redis debugging ────────────────────────────────────────────
redis-cli ping                        # → PONG
redis-cli keys "*"                    # List all keys
redis-cli flushdb                     # Clear all cache (dev only!)

# ─── Git workflow ───────────────────────────────────────────────
git checkout -b feature/your-feature main
# Make changes
git commit -m "feat: description"
git push origin feature/your-feature
# Open PR → CI runs → merge to develop → promote to main
```

---

*Generated: 2026-04-24 | Platform: OSDHYAN | Next update: after Phase 2 completion*
