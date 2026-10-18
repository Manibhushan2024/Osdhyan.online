# OSDHYAN — Start here

| I want to… | Go to |
|---|---|
| Start / stop the site on this laptop, get the public link | `scripts/host/HOSTING.md` |
| Know what is built, what needs my accounts, the phase plan | `SCALING_AND_ROADMAP.md` (§7 = revenue modules) |
| Upload questions / build tests from Excel or CSV | Admin → **Bulk import** (templates are downloadable there) |
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
| Emails (results, OTP fallback, welcome) | Resend API key + verified domain | `backend/.env` → `RESEND_API_KEY` |
| SMS OTP login / sign-up (works now in **test mode**: the OTP is shown on screen) | One of: **MSG91** (`SMS_PROVIDER=msg91`, `SMS_API_KEY`=authkey, `SMS_TEMPLATE_ID`=DLT OTP template), **Fast2SMS** (`SMS_PROVIDER=fast2sms`, `SMS_API_KEY`; no DLT needed to start), **Textlocal** (`SMS_PROVIDER=textlocal`, `SMS_API_KEY`, `SMS_SENDER_ID`) | `backend/.env` |
| Google sign-in / sign-up (button shows a clear message until set up) | Google Cloud → OAuth client (Web). Authorized redirect URI: `https://<your permanent link>/api/auth/google/callback` — needs the **permanent link** first (a changing trycloudflare URL can't be registered) | `backend/.env` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_URL`, `FRONTEND_URL` |
| AI explanations / insights | Gemini or OpenAI key | `backend/.env` → `GEMINI_API_KEY` |
| Error alerts | Sentry DSNs | `backend/.env`, `apps/portal/.env.local` |
