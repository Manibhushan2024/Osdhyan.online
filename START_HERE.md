# OSDHYAN — Start here

| I want to… | Go to |
|---|---|
| Start / stop the site on this laptop, get the public link | `scripts/host/HOSTING.md` |
| Know what is built, what needs my accounts, the phase plan | `SCALING_AND_ROADMAP.md` (§7 = revenue modules) |
| Upload questions / build tests from Excel or CSV | Admin → **Bulk import** (templates are downloadable there) |
| Re-import the AEDO / BSSC CGL question sets on a new server | `cd backend && php artisan osdhyan:import-question-sets database/data/question_sets_aedo.json` (idempotent; rebuild the JSON from the app folder with `node scripts/content/extract-question-sets.js <folder> backend/database/data/question_sets_aedo.json`) |
| Set prices on a test series | Admin → **Test Series** → Edit (Paid, price, MRP, validity) |
| See money coming in | Admin → **Orders & revenue** |
| Approve tutors for home tuition | Admin → **Teachers** |
| Run a live class | Sign in as a teacher → **Live Classes → Teacher panel** |
| Demo logins (local only) | `backend/database/seeders/LocalDevUsersSeeder.php` |
| Run the automated checks | `cd backend && php artisan config:clear && php artisan test` · `python scripts/smoke_test.py` · `python scripts/smoke_modules.py` |

## Accounts / keys still needed (nothing works "for real" without them)

| Feature | What to get | Where it goes |
|---|---|---|
| Permanent link | Cloudflare account + osdhyan.online on Cloudflare DNS; run `cloudflared tunnel login` once | `scripts/host/setup-permanent-link.ps1 -Hostname app.osdhyan.online` |
| Real payments | Razorpay account (KYC) → Key ID, Key Secret, Webhook secret | `backend/.env` → `RAZORPAY_*`, set `PAYMENTS_FAKE=false` |
| Live classes without the "sign in to start" prompt | JaaS (8x8) free tier → App ID, API key, private key — or a self-hosted Jitsi | `backend/.env` → `JAAS_*` / `JITSI_DOMAIN` |
| Result / welcome e-mails at scale | Resend API key + verified domain (or the same Gmail SMTP above for small volumes) | `backend/.env` → `MAIL_MAILER=resend`, `RESEND_API_KEY` |
| OTP by **mobile** (works now in test mode: the code is shown on screen) | Cheapest real option: your **own Android phone + SIM** as the gateway — install the free open-source app *SMS Gateway for Android* (github.com/capcom6/android-sms-gateway), turn on *Local server*, note its IP, username and password → `SMS_PROVIDER=android`, `SMS_GATEWAY_URL=http://<phone-ip>:8080`, `SMS_GATEWAY_USER`, `SMS_GATEWAY_PASSWORD` (phone on the same Wi-Fi as the laptop). Or a bulk provider: **Fast2SMS** (`SMS_PROVIDER=fast2sms`, `SMS_API_KEY`), **MSG91** (`msg91`, `SMS_API_KEY`, `SMS_TEMPLATE_ID`), **Textlocal** (`textlocal`, `SMS_API_KEY`, `SMS_SENDER_ID`) | `backend/.env` then `php artisan config:cache` |
| OTP by **e-mail** (works now in test mode) | Any mailbox you own. Easiest: a Gmail/Google Workspace account with an *App password* (Google account → Security → 2-Step Verification → App passwords) → `MAIL_MAILER=smtp`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USERNAME=you@gmail.com`, `MAIL_PASSWORD=<app password>`, `MAIL_ENCRYPTION=tls`, `MAIL_FROM_ADDRESS=you@gmail.com`. (Gmail allows ~500 mails/day; for more use Resend with your domain.) | `backend/.env` then `php artisan config:cache` |
| Google sign-in / sign-up (button shows a clear message until set up) | Google Cloud → OAuth client (Web). Authorized redirect URI: `https://<your permanent link>/api/auth/google/callback` — needs the **permanent link** first (a changing trycloudflare URL can't be registered) | `backend/.env` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_URL`, `FRONTEND_URL` |
| AI explanations / insights | Gemini or OpenAI key | `backend/.env` → `GEMINI_API_KEY` |
| Error alerts | Sentry DSNs | `backend/.env`, `apps/portal/.env.local` |
