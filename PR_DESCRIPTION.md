## Exam-day scaling, revenue modules, OTP sign-in, laptop hosting

Four commits that take OSDHYAN from "slow and losing answers" to a launchable product.

### Student exam engine
- Server-side timer (`remaining_sec`/`deadline_at`), 2-minute grace, answers rejected after submit or time-out
- Batched answer sync (one UPSERT), locked + idempotent scoring, negative-marking bug fixed, question order fixed
- Offline-safe web player: local store, batched sync with retry, resume after refresh, spread auto-submit
- 17 DB indexes, cached test payloads (Redis + APCu), Sanctum token cache, named rate limiters (shared-IP safe)

### Admin
- CSV / XLSX bulk import: questions, syllabus, tests (dry run, row errors, duplicate reuse, "create a test from this sheet")
- Tests can be attached to a series on create/edit; prices, MRP, validity on series
- Fixed 500s (exam/subject without code, test without marks, missing relations)

### Revenue modules
- Paid test series with Razorpay (orders, HMAC verify, webhook, test-mode gateway), My Purchases, Orders & revenue
- Live classes: teacher panel, Jitsi (plain/JaaS) + YouTube Live, chat, polls, raise hand, second-device join (QR)
- Home-tuition marketplace: teacher profiles + admin verification, requirements, proposals, in-app chat

### Sign-in
- OTP by mobile or e-mail (login + sign-up without password), SMS via MSG91/Fast2SMS/Textlocal or own Android phone gateway, e-mail via SMTP; test mode shows the OTP until a gateway is connected
- Google sign-in hardened (clear message until configured) + ID-token endpoint for mobile

### Platform & ops
- UI/copy clean-up (plain English, no fake stats), same-origin `/api` proxy, production Docker image (nginx + php-fpm), laptop hosting scripts with Cloudflare tunnel (`scripts/host/HOSTING.md`), `START_HERE.md`, `SCALING_AND_ROADMAP.md`
- Test suite refuses to run against a non-memory DB (cached config would wipe the live database)

### Tests
129 backend feature tests (`php artisan test`), `scripts/smoke_test.py` (42 checks), `scripts/smoke_modules.py` (46 checks) — all green on the laptop host.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
