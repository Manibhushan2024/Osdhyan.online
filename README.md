# OSDHYAN — Next-Generation Exam Preparation Platform

> A full-stack test series platform for Indian competitive exam aspirants (BPSC, SSC, Banking, UPSC, and more). Built with Next.js 16, React 19, TypeScript, and Laravel 11.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Key Features](#key-features)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Deployment](#deployment)
11. [Contributing](#contributing)

---

## Overview

OSDHYAN is a competitive exam preparation platform that goes beyond simple MCQ quizzes. It provides:

- **Full-length mock tests** with exam-accurate timing, negative marking, and a live question palette
- **AI-powered performance analysis** using OpenAI / Google Gemini after every test
- **Bilingual interface** — every question and option available in English and Hindi
- **Structured courses** — NCERT video lectures, subject notes, curated materials
- **Productivity tools** — study timer, daily goal tracker, focus sessions, weekly planner
- **Admin portal** — create and manage tests, questions, courses, and view real-time analytics

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│          Next.js 16 Frontend  (apps/portal)             │
│  React 19 · TypeScript · Tailwind CSS 4 · Radix UI      │
│  TanStack Query · Axios · Recharts · React Hot Toast    │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API  (Bearer token)
┌──────────────────────▼──────────────────────────────────┐
│          Laravel 11 Backend  (backend/)                  │
│  PHP 8.2 · Sanctum Auth · Eloquent ORM                  │
│  OpenAI API · Google Gemini API                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               PostgreSQL Database                        │
└─────────────────────────────────────────────────────────┘
```

### Frontend Route Map

| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/auth/login` | Student login |
| `/auth/signup` | Student registration |
| `/auth/forgot-password` | Password reset |
| `/dashboard` | Student home — study timer, goals, activity |
| `/dashboard/test-series` | Browse and enroll in test series |
| `/dashboard/test-series/:id` | Test series detail |
| `/dashboard/tests` | Free quiz listing |
| `/dashboard/tests/play/:id` | Live test player |
| `/dashboard/tests/result/:id` | Test result and score breakdown |
| `/dashboard/tests/solutions/:id` | Full solutions with AI explanations |
| `/dashboard/analytics` | Performance charts and AI insights |
| `/dashboard/courses` | Course catalogue |
| `/dashboard/courses/:category/:subjectId` | Subject learning console |
| `/dashboard/focus` | Focus terminal / productivity |
| `/dashboard/history` | Attempt history |
| `/dashboard/identity` | Profile / dossier |
| `/admin` | Admin command overview |
| `/admin/test-series` | Manage test series |
| `/admin/tests` | Manage tests |
| `/admin/questions` | Question bank |
| `/admin/courses` | Course management |

---

## Tech Stack

### Frontend (`apps/portal/`)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Components | Radix UI (Dialog, Toast, RadioGroup, Label) |
| State | React Context (Auth, Theme) + TanStack Query 5 |
| HTTP | Axios 1.13 with Sanctum CSRF interceptor |
| Charts | Recharts 3.7 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Fonts | Plus Jakarta Sans (Google Fonts via Next.js) |

### Backend (`backend/`)

| Layer | Technology |
|-------|-----------|
| Framework | Laravel 11 |
| Language | PHP 8.2+ |
| Auth | Laravel Sanctum (token-based SPA auth) |
| Database | PostgreSQL (primary) |
| ORM | Eloquent |
| AI | OpenAI GPT + Google Gemini (explanation generation) |
| Storage | Laravel filesystem (local or S3-compatible) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PHP 8.2+ with Composer
- PostgreSQL 15+

### 1. Clone the repository

```bash
git clone <repo-url>
cd test-series-platform
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the frontend environment

```bash
cp apps/portal/.env.local.example apps/portal/.env.local
```

Edit `apps/portal/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Start the frontend dev server

```bash
cd apps/portal
npm run dev
# open http://localhost:3000
```

### 5. Backend setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=osdhyan
DB_USERNAME=postgres
DB_PASSWORD=your_password

OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

Run migrations and start:

```bash
php artisan migrate
php artisan db:seed
php artisan serve
# API available at http://localhost:8000
```

---

## Environment Variables

### Frontend (`apps/portal/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL to the Laravel API including `/api` suffix |
| `NEXT_PUBLIC_STORAGE_URL` | No | Base URL for user-uploaded media. Falls back to `NEXT_PUBLIC_API_URL` with `/api` stripped |
| `NEXT_PUBLIC_SITE_URL` | No | Public URL of the frontend app. Used for canonical links |

> Copy `.env.local.example` to `.env.local` — never commit `.env.local` to version control.

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_KEY` | Yes | Generated by `php artisan key:generate` |
| `DB_*` | Yes | PostgreSQL connection details |
| `OPENAI_API_KEY` | No | Used for AI explanation and suggestion generation |
| `GEMINI_API_KEY` | No | Alternative AI provider (Google Gemini) |
| `SANCTUM_STATEFUL_DOMAINS` | Yes | Comma-separated list of frontend domains allowed for SPA auth |

---

## Project Structure

```
test-series-platform/
├── apps/
│   └── portal/                     # Next.js 16 frontend
│       ├── src/
│       │   ├── app/                # App Router pages
│       │   │   ├── page.tsx        # Public landing page
│       │   │   ├── auth/           # Login, signup, forgot-password
│       │   │   ├── dashboard/      # Student portal (51 pages)
│       │   │   └── admin/          # Admin portal (7 pages)
│       │   ├── components/
│       │   │   ├── layout/         # Sidebar, Navbar, AdminSidebar
│       │   │   ├── providers/      # AuthProvider, QueryProvider, ThemeProvider
│       │   │   ├── courses/        # MultiModalPlayer, SubjectLearningConsole
│       │   │   ├── dashboard/      # StudyTimer, GoalSetupWizard, DailyClosingModal
│       │   │   ├── auth/           # RouteGuard
│       │   │   └── ui/             # Button, Dialog, Input, Toast, Logo …
│       │   └── lib/
│       │       ├── api.ts          # Axios instance with auth + 401 interceptor
│       │       ├── storage.ts      # storageUrl() — resolves relative media paths
│       │       └── utils.ts        # cn() Tailwind class-merging helper
│       ├── .env.local.example
│       └── next.config.ts
│
├── backend/                        # Laravel 11 API
│   ├── app/Http/Controllers/Api/   # API controllers
│   ├── app/Models/                 # Eloquent models
│   ├── database/migrations/        # Schema migrations
│   ├── routes/api.php              # API route definitions
│   └── storage/                    # File uploads and logs
│
└── README.md
```

---

## Key Features

### Test Player

The live test player (`/dashboard/tests/play/:id`) supports:

- **Resume** — in-progress attempts are automatically detected and resumed with all previous answers pre-filled
- **Real-time sync** — each answer is persisted to the backend the moment it is selected
- **Auto-submit** — when the countdown reaches zero, the test is submitted automatically
- **Confirmation modal** — manual submission shows an in-app modal with answered / marked / skipped counts before confirming
- **Language toggle** — switch between English and Hindi per-question at any time during the test
- **Question palette** — colour-coded grid: green = answered, purple = marked for review, red = visited unanswered, grey = not yet visited
- **Pause overlay** — suspends the timer with a full-screen lock screen

### Authentication Flow

- Laravel Sanctum token-based authentication
- Separate localStorage keys for student (`auth_token`) and admin (`admin_auth_token`) sessions
- Automatic redirect to the correct login page on any 401 response (Axios interceptor in `lib/api.ts`)
- CSRF cookie initialised on login and on app boot

### Admin Portal

- Real-time dashboard with student acquisition trend charts and global activity feed
- Full CRUD for test series, tests, questions (with image upload)
- Course management with multi-modal player (video, PDF, notes)
- Separate admin login with a role system (`root` / `editor`)
- Graceful error state when the API is unreachable

---

## API Reference

All endpoints are prefixed with `/api`. Authenticated endpoints require the header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Create student account |
| POST | `/auth/login` | — | Student login → returns `access_token` |
| POST | `/auth/admin-login` | — | Admin login |
| POST | `/auth/logout` | Yes | Invalidate current token |
| POST | `/auth/send-otp` | — | Send OTP to phone number |

### Tests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tests` | Yes | List all published tests |
| GET | `/tests/:id` | Yes | Test details including questions and options |
| POST | `/tests/:id/attempts` | Yes | Start a new attempt or resume an existing one |
| POST | `/attempts/:id/responses` | Yes | Save a single question response |
| POST | `/attempts/:id/complete` | Yes | Submit the test and compute the score |
| GET | `/attempts/:id` | Yes | Fetch attempt result and metadata |

### Test Series

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/test-series` | Yes | List all published series |
| GET | `/test-series/:id` | Yes | Series detail with nested tests |
| POST | `/test-series/:id/enroll` | Yes | Enroll current user in series |
| POST | `/test-series/:id/unenroll` | Yes | Remove enrollment |
| GET | `/test-series/enrolled` | Yes | All series the current user is enrolled in |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/overview` | Yes | Overall stats, score trend (`score_trend[]`), AI suggestions |
| GET | `/analytics/topics` | Yes | Per-topic strength and weakness breakdown |

**`/analytics/overview` response shape:**

```json
{
  "stats": {
    "accuracy_percentage": 74.5,
    "accuracy_trend": 3.2,
    "total_tests": 12,
    "avg_time_per_question_sec": 42,
    "syllabus_covered_percentage": 38
  },
  "score_trend": [
    { "date": "Mon", "score": 65 },
    { "date": "Tue", "score": 72 }
  ],
  "ai_suggestion": "Focus on Bihar Geography — accuracy dropped 15% last test.",
  "ai_time_suggestion": "You are spending too long on Mathematics. Try elimination method."
}
```

### Admin

| Method | Endpoint | Auth (Admin) | Description |
|--------|----------|--------------|-------------|
| GET | `/admin/analytics/overview` | Yes | Platform-wide stats and acquisition trend |
| GET / POST | `/admin/tests` | Yes | List / create tests |
| GET / POST | `/admin/questions` | Yes | List / create questions |
| GET / POST | `/admin/test-series` | Yes | List / create test series |
| GET / POST | `/admin/courses` | Yes | List / create courses |

---

## Database Schema

### Core Tables

| Table | Key Columns |
|-------|-------------|
| `users` | id, name, email, phone, password, exam_preference, target_year, is_admin, admin_role |
| `exams` | id, name_en, name_hi, category |
| `test_series` | id, exam_id, name_en, name_hi, description_en, description_hi, is_published |
| `tests` | id, test_series_id, name_en, name_hi, duration_sec, total_marks, negative_marking, status |
| `questions` | id, question_en, question_hi, image_path, explanation_en, explanation_hi, difficulty |
| `question_options` | id, question_id, option_en, option_hi, image_path, is_correct |
| `test_attempts` | id, user_id, test_id, started_at, completed_at, status, total_score, metadata (JSON) |
| `test_responses` | id, test_attempt_id, question_id, selected_option_id, is_marked_for_review, time_taken_sec |
| `user_test_series` | user_id, test_series_id (enrollment pivot) |

### Attempt `metadata` JSON Structure

```json
{
  "correct_count": 45,
  "incorrect_count": 12,
  "accuracy": 78.9,
  "sectional_stats": {
    "General Studies": {
      "correct": 20,
      "incorrect": 5,
      "total": 30,
      "marks": 60
    }
  }
}
```

---

## Deployment

### Frontend (Vercel)

1. Connect the repo to Vercel
2. Set root directory to `apps/portal`
3. Add environment variables in the Vercel dashboard
4. Deploy

### Frontend (Self-hosted Nginx)

```bash
cd apps/portal
npm run build

# serve the .next output with:
npm start
# or point Nginx to port 3000
```

### Backend (VPS / Cloud VM)

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Sample Nginx vhost:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/backend/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }
}
```

### Database

```bash
createdb osdhyan
php artisan migrate --force
php artisan db:seed   # optional demo data
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and verify the build passes: `npm run build`
4. Submit a pull request with a clear description of what changed and why

### Code Style

- **Frontend**: ESLint (Next.js config) + TypeScript strict mode
- **Backend**: PSR-12 PHP coding standard via Laravel Pint
- Component names: PascalCase
- API endpoints: kebab-case
- CSS: Tailwind utility classes only (no custom CSS unless unavoidable)

---

*Built for Indian competitive exam aspirants.*
