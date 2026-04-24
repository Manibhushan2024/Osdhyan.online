# Mobile Delivery Plan

## Current Baseline

The Expo mobile app in `mobile/osdhyan` now has:

- App shell, providers, navigation, and auth hydration
- Home, tests, learn, live, and profile tab flows
- Shared API client and Zustand stores
- Type-safe screen layer and reusable UI primitives
- Typecheck passing

This plan covers the work from the current baseline to store deployment.

---

## Phase 1 - Stabilize The App

### Goal
Make the current implementation reliable enough for continuous QA on real devices.

### Steps
1. Lock down project config for builds and environments.
2. Add deployment/build profiles and app metadata scaffolding.
3. Audit startup flow, auth hydration, route transitions, and screen back behavior.
4. Verify all implemented screens against real backend payloads.
5. Fix runtime issues found during device smoke testing.
6. Normalize documentation so the team has one source of truth.

### Deliverables
- `app.config.ts` driven by environment variables
- `eas.json` with development, preview, and production profiles
- updated mobile docs and env template
- clean startup and navigation behavior on device

### Exit Criteria
- app boots on emulator/device
- login works with real API
- all primary routes open without crashes
- Expo config/build profiles are valid

---

## Phase 2 - Harden Core Product Flows

### Goal
Turn the current UI coverage into production-grade feature behavior.

### Step 2.1 - Tests
1. Verify `/tests`, `/attempts`, and `/test-series` payloads against the real backend.
2. Harden test attempt resume, timer recovery, and local backup restore.
3. Add better submit confirmation, error recovery, and partial sync handling.
4. Validate result and solution mapping against real question payloads.

### Step 2.2 - Learn / Content
1. Verify subject hierarchy and material payloads for all categories.
2. Improve material rendering for PDFs, videos, and HTML articles.
3. Validate notes CRUD against real exam/subject/topic mappings.
4. Tighten blog and syllabus navigation.

### Step 2.3 - Live
1. Validate list/detail/state polling against the production API shape.
2. Complete native WebRTC viewer setup in custom dev client.
3. Harden chat, polls, participant updates, and leave/join flow.
4. Validate recording playback URLs and class state transitions.

### Step 2.4 - Productivity
1. Verify analytics payloads and weak-area rendering.
2. Harden study goal creation/deletion with real hierarchy.
3. Improve focus timer persistence across background/foreground.
4. Validate profile update and password change on device.

### Deliverables
- stable core user flows
- real API compatibility confirmed
- major UX and runtime bugs resolved

### Exit Criteria
- one full user journey works per surface:
  - auth -> dashboard -> test -> result
  - learn -> material -> notes
  - live -> join -> poll/chat -> leave
  - profile -> goals -> focus -> settings

---

## Phase 3 - Native Platform Setup

### Goal
Prepare the project for actual Android/iOS builds instead of dev-only usage.

### Steps
1. Configure Android package name and iOS bundle identifier final values.
2. Create or connect EAS project.
3. Add deep link domain and scheme configuration.
4. Add app icons, splash assets, notification icon assets, and store-safe metadata.
5. Prepare custom dev client path for WebRTC testing.
6. Prepare permissions text for image picker and notifications.

### Deliverables
- working `eas.json`
- final app config values
- deep linking setup
- release-ready icon/splash bundle

### Exit Criteria
- `eas build --profile preview` succeeds
- custom dev client runs for live/WebRTC testing
- deep links resolve to app screens

---

## Phase 4 - QA And Release Validation

### Goal
Test the mobile app like a release candidate, not a dev prototype.

### Steps
1. Define test matrix:
   - Android 10+
   - Android large/small screens
   - iOS 14+
2. Run smoke tests for auth, dashboard, tests, content, live, and profile.
3. Run unstable-network tests:
   - slow network
   - intermittent network
   - offline launch
4. Verify file/image upload, notes CRUD, attempt backup, and timer restore.
5. Verify bilingual rendering for English/Hindi fields.
6. Log defects and fix in priority order.

### Deliverables
- QA checklist with pass/fail notes
- resolved blocker bug list
- preview build approved for release

### Exit Criteria
- no crash in main journeys
- no blocking backend mismatches
- no console-breaking runtime issues in preview build

---

## Phase 5 - Deployment

### Goal
Ship internal test builds first, then production store binaries.

### Step 5.1 - Internal Release
1. Generate preview Android APK/AAB.
2. Generate preview iOS build/TestFlight build.
3. Share builds with stakeholders and collect feedback.

### Step 5.2 - Production Release
1. Finalize app name, package IDs, privacy policy URL, support email, and store descriptions.
2. Prepare Play Store and App Store assets:
   - icon
   - splash
   - screenshots
   - feature graphic
3. Build production Android AAB.
4. Build production iOS archive.
5. Submit Android and iOS releases.
6. Monitor review feedback and patch if needed.

### Deliverables
- signed release builds
- store listing package
- deployment runbook

### Exit Criteria
- Android production build uploaded
- iOS production build uploaded
- submission assets complete

---

## Immediate Execution Order

1. Finish release/config scaffolding.
2. Validate runtime against the real backend URL you provide.
3. Run on Android first and fix runtime defects.
4. Set up custom dev client for live-class WebRTC.
5. Produce preview build.
6. Run QA checklist.
7. Prepare store submission package.

---

## Inputs Required From You

We can keep implementing without waiting on all of these, but deployment cannot finish without them:

1. Production/staging API URL
2. Final Android package name and iOS bundle identifier
3. EAS project ownership/account details
4. Deep link domain
5. Final app icon, splash, adaptive icon, and store screenshots
6. Privacy policy URL
7. Support email/contact

---

## What I Will Implement Next

The next implementation slice after this plan is:

1. build/release config
2. environment-driven app config
3. deployment scripts
4. then backend-driven runtime validation
