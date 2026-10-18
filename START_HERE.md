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
| SMS OTP login | MSG91 / Textlocal key | `backend/.env` → `SMS_*` (provider code still to be wired) |
| Google sign-in | Google Cloud OAuth client | `backend/.env` → `GOOGLE_CLIENT_ID/SECRET` |
| AI explanations / insights | Gemini or OpenAI key | `backend/.env` → `GEMINI_API_KEY` |
| Error alerts | Sentry DSNs | `backend/.env`, `apps/portal/.env.local` |
