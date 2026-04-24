# OSDHYAN — Mobile App Handoff Document

> **Prepared for:** Antigravity Development Team  
> **Project:** OSDHYAN EdTech Platform — React Native Mobile App  
> **Backend Base URL:** `http://YOUR_PRODUCTION_DOMAIN/api`  
> **Date:** April 2026  
> **Version:** 1.0.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Web Stack](#2-current-web-stack)
3. [Mobile Tech Stack Decision](#3-mobile-tech-stack-decision)
4. [Quick Start](#4-quick-start)
5. [Documentation Index](#5-documentation-index)
6. [Feature Scope](#6-feature-scope)
7. [Phase Summary](#7-phase-summary)
8. [Important Notes for the Team](#8-important-notes-for-the-team)
9. [Execution Plan](#9-execution-plan)

---

## 1. Project Overview

**OSDHYAN** is a full-featured EdTech platform targeting Indian competitive exam aspirants (SSC, UPSC, BPSC, Railways, etc.). It provides:

- Mock tests & test series with detailed analytics
- Live classes with WebRTC video, chat, and polls
- Syllabus-mapped study materials
- Pomodoro-based focus timer with study planning
- Study goal tracking & progress analytics
- Coin rewards for correct poll answers
- Bilingual support (English + Hindi)

The web app (Next.js 15) is fully built and deployed. This document covers building the **React Native mobile app** that consumes the same Laravel 11 backend API.

---

## 2. Current Web Stack

| Layer | Technology |
|---|---|
| Frontend (Web) | Next.js 15, TypeScript, Tailwind CSS |
| Backend API | Laravel 11, PHP 8.2 |
| Auth | Laravel Sanctum (Bearer token) |
| Database | MySQL |
| Storage | Laravel public disk (local / S3-compatible) |
| Video | WebRTC (HTTP-polling signaling) |
| Admin Panel | Filament 3.3 |

**Backend is already complete. The mobile app only consumes the existing API — no backend changes needed.**

---

## 3. Mobile Tech Stack Decision

### Chosen Stack: React Native + Expo (SDK 51+)

| Package | Purpose |
|---|---|
| `expo` SDK 51 | Build toolchain, EAS Build |
| `react-native` 0.74 | Core framework |
| `typescript` | Type safety |
| `@react-navigation/native` v6 | Navigation |
| `@react-navigation/bottom-tabs` | Tab bar |
| `@react-navigation/stack` | Stack navigation |
| `@tanstack/react-query` v5 | API data fetching + caching |
| `axios` | HTTP client |
| `zustand` | Global state (auth, user) |
| `@react-native-async-storage/async-storage` | Token persistence |
| `react-native-webrtc` | Live class WebRTC |
| `expo-av` | Video/audio playback (recordings) |
| `expo-document-picker` | File uploads |
| `expo-notifications` | Push notifications |
| `expo-linear-gradient` | Gradient UI elements |
| `react-native-reanimated` v3 | Smooth animations |
| `react-native-gesture-handler` | Swipe gestures |
| `react-native-svg` | Charts & SVG progress rings |
| `victory-native` | Charts (test analytics) |
| `expo-haptics` | Haptic feedback |
| `expo-secure-store` | Secure token storage |
| `@shopify/flash-list` | High-performance lists |
| `react-native-toast-message` | Toast notifications |

---

## 4. Quick Start

```bash
# 1. Navigate to the actual Expo app
cd test-series-platform/mobile/osdhyan

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL/api

# 4. Start Expo dev server
npx expo start

# 5. Run on Android emulator
npx expo run:android

# 6. Run on iOS simulator (Mac only)
npx expo run:ios
```

---

## 5. Documentation Index

| File | Contents |
|---|---|
| [docs/01-SETUP.md](docs/01-SETUP.md) | Dev environment, prerequisites, Expo setup |
| [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | Folder structure, navigation map, state management |
| [docs/03-DESIGN-SYSTEM.md](docs/03-DESIGN-SYSTEM.md) | Colors, typography, spacing, component library |
| [docs/04-API-REFERENCE.md](docs/04-API-REFERENCE.md) | All 130 API endpoints with request/response shapes |
| [docs/05-SCREENS.md](docs/05-SCREENS.md) | Every screen with purpose, API calls, UI notes |
| [docs/06-PHASE-1-FOUNDATION.md](docs/06-PHASE-1-FOUNDATION.md) | Phase 1: Project init, auth, navigation shell |
| [docs/07-PHASE-2-TESTS.md](docs/07-PHASE-2-TESTS.md) | Phase 2: Tests, test series, attempt engine |
| [docs/08-PHASE-3-CONTENT.md](docs/08-PHASE-3-CONTENT.md) | Phase 3: Courses, syllabus, materials, blogs |
| [docs/09-PHASE-4-LIVE.md](docs/09-PHASE-4-LIVE.md) | Phase 4: Live classes, WebRTC, chat, polls |
| [docs/10-PHASE-5-PRODUCTIVITY.md](docs/10-PHASE-5-PRODUCTIVITY.md) | Phase 5: Study goals, Pomodoro, planner, analytics |
| [docs/11-DEPLOYMENT.md](docs/11-DEPLOYMENT.md) | EAS Build, Play Store, App Store submission |
| [docs/12-EXECUTION-PLAN.md](docs/12-EXECUTION-PLAN.md) | Current phasewise plan from the implemented app to deployment |
| [docs/13-INPUT-COLLECTION-GUIDE.md](docs/13-INPUT-COLLECTION-GUIDE.md) | Stepwise guide to collect API URL, package IDs, Expo/EAS values, branding, and store inputs |
| [docs/14-DEPLOYMENT-AUTHORIZATION-PLAN.md](docs/14-DEPLOYMENT-AUTHORIZATION-PLAN.md) | Actual zero-to-deployment plan for this machine, including blockers and required approvals |

---

## 6. Feature Scope

### MVP (Phases 1–3)
- [ ] Authentication (login, register, OTP, forgot password)
- [ ] Home dashboard with exam selector
- [ ] Free tests & quizzes
- [ ] Test Series (browse, enroll, attempt)
- [ ] Test attempt engine (timer, navigation, submit)
- [ ] Test results & solutions
- [ ] Syllabus browser (Exam → Subject → Chapter → Topic)
- [ ] Study materials viewer (PDF, video)
- [ ] Courses browser

### Phase 2 Release (Phases 4–5)
- [ ] Live classes (list, join as viewer)
- [ ] Live class chat & polls (with coin rewards)
- [ ] Study goal setting & tracking
- [ ] Pomodoro focus timer with task tree
- [ ] Analytics dashboard (accuracy, topic-wise)
- [ ] User profile & settings
- [ ] Notes (CRUD)
- [ ] Push notifications

### Phase 3 Release (Teacher/Admin)
- [ ] Teacher live class management
- [ ] WebRTC screen share (teacher)
- [ ] Class recording playback
- [ ] Admin bulk import (CSV)

---

## 7. Phase Summary

| Phase | Duration | Deliverable |
|---|---|---|
| Phase 1: Foundation | 2 weeks | Auth, navigation shell, design system, home |
| Phase 2: Tests | 3 weeks | Full test attempt engine + results + test series |
| Phase 3: Content | 2 weeks | Courses, syllabus, materials, blogs, notes |
| Phase 4: Live Classes | 3 weeks | WebRTC viewer, chat, polls, recordings |
| Phase 5: Productivity | 2 weeks | Goals, Pomodoro, analytics, profile |
| Phase 6: Polish & Deploy | 2 weeks | Push notifications, deep links, store submission |

**Total estimated timeline: 14 weeks**

---

## 8. Important Notes for the Team

### Authentication
- Uses **Laravel Sanctum** — Bearer token auth
- Token must be sent as: `Authorization: Bearer {token}`
- Token is obtained from `POST /api/auth/login` or `POST /api/auth/register`
- Store token securely using `expo-secure-store` (NOT AsyncStorage for the token)
- No token expiry by default — persists until logout

### Bilingual Content
- All content fields come in **English (_en)** and **Hindi (_hi)** variants
- e.g., `name_en`, `name_hi`, `question_en`, `question_hi`
- Implement a global language toggle (English / हिंदी) using Zustand
- Default to English; fall back to Hindi if English is empty

### API Base URL
- Development: `http://192.168.X.X:8000/api` (your machine's LAN IP — localhost doesn't work on real devices)
- Production: `https://yourdomain.com/api`
- Use `EXPO_PUBLIC_API_URL` in `.env` for configuration

### WebRTC (Live Classes)
- Signaling is done via **HTTP polling** (not WebSockets)
- Poll `GET /api/live-classes/{id}/signals?since_id=X` every 800ms
- Student role is **viewer only** — no camera/mic
- Teacher sends offers; students respond with answers
- Use `react-native-webrtc` — requires custom dev client (not Expo Go)

### Coin System
- Students earn coins for correct poll answers
- Displayed with amber/gold styling throughout the app
- `GET /api/live-classes/{id}/state` returns `user_coins` balance

### File Uploads
- Profile photo: `POST /api/profile` with multipart form
- Study material upload (admin): `POST /api/admin/materials/upload`
- Class recording upload: `POST /api/live-classes/{id}/upload-recording`
- Max upload: 500MB (configured in `.htaccess`)

---

## 9. Execution Plan

The active delivery plan from the current implementation to deployment is tracked in:

- [docs/12-EXECUTION-PLAN.md](docs/12-EXECUTION-PLAN.md)
