# OSDHYAN — Plan: cloud hosting, Firebase, e-mail OTP, mobile-friendly web and the Android app

Written 24 Oct 2026. Each phase says what **I build** and what **you do**, and ends with a check we both can see.
Nothing goes live until Phase 4; the laptop stays the development machine throughout.

## The decision: host in the cloud BEFORE releasing the Android app

- The Android app is only the screen on the phone. Every sign-in, test and answer goes to the server. Today that server is this laptop behind a temporary link that has broken several times a day (restarts, internet drops, sleep).
- The app needs **one fixed https address built into it**. If that address dies, every installed copy stops working until students update the app.
- So: cloud first (Phase 1), then the app (Phase 5). Using your company's cloud now and moving to your own later is fine **if you have written permission** and everything else (domain, Firebase, Razorpay, Play account, e-mail sender) stays in your own name. Moving later = copy the database and files, point the domain at the new server (a few hours, ~10 minutes of downtime).

## What Firebase is for (and what it is not)

| Firebase product | We use it for | Cost |
|---|---|---|
| **Authentication — Phone** | Real SMS OTP to students' phones, on the app and the website. No SMS vendor contract needed. | Free up to a monthly quota (about 10,000 verifications; check the current Firebase pricing page), then pay per SMS |
| **Authentication — Google** | "Continue with Google" on app and web, replacing the separate Google keys | Free |
| **Cloud Messaging (FCM)** | Push notifications: "Your mock starts in 1 hour", "Result ready", "Live class started" | Free |
| **Crashlytics + Analytics** | See app crashes and which screens students use | Free |
| **App Hosting** (optional) | Host the Next.js website | Pay-as-you-go, small |

Firebase does **not** host our Laravel API or the PostgreSQL database. Those run on a normal server (Phase 1). The API already accepts Firebase sign-ins: a student signs in with the Firebase SDK, the app sends us the Firebase ID token, and `POST /api/auth/firebase/token` verifies it against Google's keys and issues our own login token (built and tested, 24 Oct). It switches on the moment `FIREBASE_PROJECT_ID` is set.

**E-mail OTP** stays our own system (already built and tested): a 6-digit code by e-mail, valid 10 minutes, 5 tries. It only needs a working sending account (Phase 2).

---

## Phase 0 — Ready to move (this week) — mostly done

**Done on the laptop (24 Oct):**
- Firebase sign-in endpoint on the server, with 12 tests (177 backend tests pass).
- `php artisan osdhyan:mail-test you@example.com` — sends a real test code so we can confirm e-mail delivery in one command.
- Phone-size check of every section of the website, with fixes (see "Mobile-friendly web" below).
- Audit of the Android app code: `mobile/osdhyan/AUDIT.md` (what works, what is broken, what is missing).

**You do (answers I need before Phase 1):**
1. **Cloud:** company cloud (which: AWS / Azure / Google Cloud) with written permission, or your own server (recommended: Google Cloud because it pairs with Firebase; a small Mumbai VM is ₹1,000–2,500/month).
2. **Domain:** is `osdhyan.online` registered in your own name? Where is it managed? (Cloudflare is easiest; I'll give the exact DNS records.)
3. **Firebase:** create a free Firebase project at console.firebase.google.com with your own Google account, name it "OSDHYAN", add an **Android app** with package name `com.osdhyan.mobile` and a **Web app**; then download `google-services.json` and copy the web config (apiKey, authDomain, projectId, appId, messagingSenderId). Enable Authentication → Sign-in methods → **Phone** and **Google**. Send me the file and the values. (I cannot create accounts for you.)
4. **E-mail sending:** either a Gmail/Workspace address + App Password (Google Account → Security → 2-Step Verification → App passwords), or a free Brevo account (300 e-mails/day) with its SMTP key. Gmail is fine to start; ~500 mails/day limit.
5. **Google Play:** a Google Play Console developer account (one-time US$25) in your name — needed only in Phase 6, but approval takes a few days, so start now.

## Phase 1 — Cloud server with a permanent address (3–4 days after your answers)

**I build**
- One server in **Mumbai** (asia-south1): Docker containers for the API (PHP-FPM + Nginx), the website (Next.js), PostgreSQL 16, Redis; HTTPS certificates that renew themselves; the queue worker and scheduler as services; log rotation.
- Domain: `osdhyan.online` → website, `api.osdhyan.online` → API, `admin` stays under the website. Cloudflare in front for caching and DDoS protection (free plan).
- **Migration:** copy the laptop database (currently 1.8 MB) and uploaded files (PDFs, notes) to the server; run the import scripts there; verify every pack with `scripts/smoke_pack.py` against the new address.
- **Backups:** nightly database dump + files to cloud storage, kept 30 days; a restore drill once.
- **Monitoring:** uptime check every minute with alerts to your phone/e-mail; error alerts from the API.
- **Load test:** 2,000 simulated students taking a mock at the same minute on the small server to find the limit; document how to scale (bigger VM, then split database/Redis onto managed services). For 10,000 concurrent students: move to Cloud Run + Cloud SQL + Memorystore, which is Phase 7.

**You do**
- Give me access to the cloud account (or create the VM yourself from my checklist) and point the domain's DNS to it.

**Check:** `https://osdhyan.online` and the admin panel work from your phone on mobile data; the link never changes; the laptop can be switched off.

**Cost (own server):** VM ₹1,000–2,500/month + domain + Cloudflare free + backups ~₹100/month.

## Phase 2 — Sign-in that works for real (2 days)

**I build**
- **E-mail OTP live:** put your SMTP details in the server's settings, run `osdhyan:mail-test`, and turn off test mode (`APP_ENV=production` so codes are never shown on screen).
- **Firebase Phone OTP** on the website: "Mobile OTP" tab sends the SMS through Firebase (reCAPTCHA check runs invisibly), then signs in through our API. Our own SMS gateway option stays as a fallback.
- **Google sign-in through Firebase** on the website (replaces the current unconfigured Google button).
- Rate limits and abuse protection reviewed (OTP requests per number/IP, sign-in attempts).

**You do:** Firebase project values (from Phase 0) and the e-mail sender.

**Check:** sign up on a new phone number by SMS, sign in by e-mail code, sign in with Google, all on `osdhyan.online`.

## Phase 3 — Mobile-friendly website (1–2 days, started 24 Oct)

The website is what most students will use first, from a phone browser, even before the app. Done and to do:
- Every section was loaded at a 375-pixel phone width and checked for horizontal overflow, unreadable text and tap targets smaller than a fingertip. Fixes are listed at the end of this document.
- **Test player on phones:** question palette as a slide-up sheet, bigger option buttons, sticky Submit, code questions scroll sideways inside their box.
- **PDF notes on phones:** open in the phone's own viewer and a "Download" button (in-page PDF frames are unreliable on Android browsers).
- **Live class on phones:** video on top, chat below, raise-hand and poll reachable with one thumb.
- "Add to Home Screen" (PWA): icon, name and offline page, so the website behaves like an app on Android even before the Play Store app exists.

**Check:** full student journey on a real Android phone in Chrome: sign in → enrol → take a chapter test → see solutions → open notes → join a live class.

## Phase 4 — Go live (1 day)

- Freeze features, final backup, switch `APP_ENV=production`, payments still in test mode until Razorpay KYC is done (see `LAUNCH_AND_INCOME_PLAN.md`).
- Publish the permanent link to your first students; watch errors and server load for 48 hours.

## Phase 5 — Android app (7–10 days)

The app exists (`mobile/osdhyan`, Expo SDK 54, React Native 0.81) but the audit found it is not releasable as it is. Work, in order:

**P0 — must fix before anyone installs it**
1. **Series page is broken** (always shows "No tests"): read the server's `{series, content}` shape, add the category tabs (Previous Year, Mocks, DBMS Special, …) and locked/paid flags.
2. **Test player:** resume with the real remaining time; save answers with the bulk `/sync` call (today it sends one request per question every 30 s); fix the auto-submit so the last answers are never lost; record time per question.
3. **Code questions:** same code box as the website (fences, line breaks, monospace) in the player and in solutions.
4. **Sign-in:** OTP by e-mail as well as phone, sign-up by OTP with name, test-mode code shown while in test mode; Firebase Phone OTP and Google via the server endpoint.
5. **Production address:** `https://api.osdhyan.online` built in; remove the localhost fallback.
6. **App identity:** real icon, adaptive icon, splash screen, version code, release signing key (kept outside the repo, backed up — losing it means you can never update the app on Play).
7. **First signed build** on this laptop: install the missing Android NDK and CMake (~2–3 GB of build tools, 15–30 minutes first time), then `gradlew assembleRelease` → **`osdhyan-release.apk`** for your phone, and `bundleRelease` → `.aab` for the Play Store.

**P1 — before the Play Store listing**
- Guest browsing of the catalogue without sign-in; courses with the DSSSB category and the material viewer (PDF open/download, video, YouTube); live class video (YouTube/Jitsi in a WebView) with chat; Razorpay checkout; push notifications (FCM) with a server endpoint for device tokens; study-materials paging.

**P2 — later**
- Home tuition and chat screens, Crashlytics, offline banner and queued submit, remove the mobile admin tab.

**Testing before you get the APK**
- Automated: TypeScript check, unit tests for the player's timer and sync, the same `smoke_pack.py` journeys against the cloud API.
- Manual on a real Android phone: install from the APK, sign in by SMS and e-mail, enrol, take DBMS Practice — SQL (Part 1) with the phone on mobile data, lock the screen mid-test and resume, submit, read solutions, open a PDF note, join a live class, receive a push notification.

**"No virus" installs:** the APK will be signed with your key. Phones still warn about "unknown sources" for any APK installed outside the Play Store; that warning goes away only with the Play Store listing (Phase 6). Until then, share the APK only from your own links, never through forwarded WhatsApp files.

## Phase 6 — Google Play Store (3–7 days, mostly waiting)

**You do:** Play Console account (US$25), a privacy-policy page link (I write the page), the data-safety form answers (I draft them), screenshots (I generate), a short description in Hindi and English (I draft).
**I build:** the `.aab` production build, the store listing text, `assetlinks.json` on the domain so `osdhyan.online` links open the app, internal-testing track first (you and 5 testers), then production.
**Check:** the app appears on Google Play; "Install" works with no warnings; updates install over the old version.

## Phase 7 — Scale and polish (ongoing)

- Scale path for 10,000 concurrent students (Cloud Run + managed PostgreSQL + Redis, CDN for PDFs and videos), weekly cost review.
- iOS app (needs a Mac or a cloud Mac service and an Apple Developer account, US$99/year) — only if students ask.
- Fast-revision sheets for DBMS and Programming; remaining CS packs (Fundamentals, Software Engineering, Web, IT Tools).

## Summary table

| Phase | What you get | Needs from you | Time |
|---|---|---|---|
| 0 | Firebase endpoint, mail test, mobile-web fixes, app audit | 5 answers/items above | this week |
| 1 | Permanent address, backups, monitoring | cloud access + DNS | 3–4 days |
| 2 | SMS OTP (Firebase), e-mail OTP live, Google sign-in | Firebase values, e-mail sender | 2 days |
| 3 | Website works well on phones, "Add to Home Screen" | a phone to test on | 1–2 days |
| 4 | Live with students | go-ahead | 1 day |
| 5 | Signed Android APK, tested | nothing new | 7–10 days |
| 6 | App on Google Play | Play account, privacy page approval | 3–7 days |
| 7 | 10k-student scale, iOS, more packs | budget decisions | ongoing |

---

## Mobile-friendly web — findings and fixes (24 Oct)

Method: every section (39 pages, student and admin) was loaded at 375 × 812 pixels, checked automatically for page-level horizontal overflow, elements wider than the screen and tap targets under 28 px, then the important pages were checked by eye.

| Page | Found | Fix (done 24 Oct) |
|---|---|---|
| Study material viewer | Toolbar 630 px wide on a 375 px screen; Download hidden below desktop size, so phones had no way to open a PDF reliably | Toolbar wraps; **Download** and **Open PDF** buttons always visible on phones |
| Test player | Question palette opened on top of the question by default, so every question needed a scroll past 30 buttons | Palette starts closed on phones, opens from the ≡ button, closes when a number is tapped; "Back to question" button |
| Whole admin panel | Fixed 256 px side menu left a 120 px column for content: unusable | Top bar with a menu button and slide-in drawer below tablet size; content gets the full width |
| "Add to Home Screen" | The page linked to a manifest that did not exist (404), so Android could not install the site as an app | `manifest.json` + 192/512 px icons made from the OSDHYAN logo |
| Everything else | No crashes; series list, series page tabs, result, solutions, courses, notes list, live classroom (video on top, chat below), tuition, messages, settings, sign-in and sign-up all fit the screen | Teacher sign-up form chips are slightly small (28 px) — acceptable, noted for Phase 3 polish |

Verified after rebuilding: admin editor, test player with a code question, material viewer and live classroom at phone size; 177 backend tests pass.
