# PHASE 0 — Foundation Hardening: Deployment Runbook

> Run these commands on the production server (GCP / DigitalOcean / Railway).
> All commands assume the app lives at `/var/www/osdhyan/` and the OS is Ubuntu 22.04.

---

## 1. Install Redis

```bash
sudo apt update && sudo apt install -y redis-server

# Enable and start
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping   # → PONG
```

---

## 2. Install Composer Packages

```bash
cd /var/www/osdhyan

# Resend mail driver
composer require resend/resend-laravel

# Laravel Horizon (queue monitoring)
composer require laravel/horizon

# Sentry for Laravel
composer require sentry/sentry-laravel

# Publish Horizon assets
php artisan horizon:install

# Publish Sentry config
php artisan sentry:publish --dsn=YOUR_SENTRY_DSN

# Publish Horizon config (already in repo, skip if exists)
# php artisan vendor:publish --provider="Laravel\Horizon\HorizonServiceProvider"
```

---

## 3. Update Production .env

Copy `.env.example` → `.env` and fill in **all** values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://osdhyan.com
FRONTEND_URL=https://osdhyan.com

# Redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null        # set a password in production!
REDIS_PORT=6379

# Mail — get API key from resend.com (free tier: 3k emails/month)
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=noreply@osdhyan.com
MAIL_FROM_NAME="OSDHYAN"
RESEND_API_KEY=re_XXXXXXXXXX

# Sentry — get DSN from sentry.io
SENTRY_LARAVEL_DSN=https://XXXXX@XXXXX.ingest.sentry.io/XXXXX
SENTRY_TRACES_SAMPLE_RATE=0.1

# CORS — lock to your actual domain
ALLOWED_ORIGINS=https://osdhyan.com,https://www.osdhyan.com
```

---

## 4. Run Cache & Route Optimization

```bash
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan storage:link
```

---

## 5. Run Database Migrations

```bash
php artisan migrate --force
```

---

## 6. Generate Initial Sitemap

```bash
php artisan sitemap:generate
# Outputs: public/sitemap.xml
```

---

## 7. Install Supervisor

```bash
sudo apt install -y supervisor

# Copy config
sudo cp /var/www/osdhyan/supervisor.conf /etc/supervisor/conf.d/osdhyan.conf

# Update path in config if different from /var/www/osdhyan
# sudo nano /etc/supervisor/conf.d/osdhyan.conf

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start osdhyan:*

# Verify both processes are running
sudo supervisorctl status
```

---

## 8. Set File Permissions

```bash
sudo chown -R www-data:www-data /var/www/osdhyan/storage /var/www/osdhyan/bootstrap/cache
sudo chmod -R 775 /var/www/osdhyan/storage /var/www/osdhyan/bootstrap/cache
```

---

## 9. Nginx Config (add to your server block)

```nginx
location /horizon {
    # Restrict Horizon dashboard to admin IPs only
    allow YOUR.ADMIN.IP.ADDRESS;
    deny all;

    try_files $uri $uri/ /index.php?$query_string;
}
```

---

## 10. Frontend (Next.js on Vercel)

Set these environment variables in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.osdhyan.com/api` |
| `NEXT_PUBLIC_STORAGE_URL` | `https://api.osdhyan.com/storage` |
| `NEXT_PUBLIC_SITE_URL` | `https://osdhyan.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | *(from sentry.io)* |

Then install Sentry in the portal:
```bash
cd apps/portal
npm install @sentry/nextjs
```

Update `next.config.ts` to wrap with Sentry (optional, adds source maps upload):
```bash
npx @sentry/wizard@latest -i nextjs
```

---

## 11. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://osdhyan.com`
3. Verify via DNS TXT record
4. Submit sitemap: `https://osdhyan.com/sitemap.xml`

---

## 12. Verify Everything Works

```bash
# Redis connection
php artisan tinker --execute="echo Cache::put('test', 1, 10) ? 'Redis OK' : 'Redis FAIL';"

# Queue works
php artisan queue:work --once

# Horizon dashboard
# Visit: https://osdhyan.com/horizon  (gated by IP)

# Test sitemap
curl https://osdhyan.com/sitemap.xml | head -5

# Test robots.txt
curl https://osdhyan.com/robots.txt

# Test rate limiting (should 429 on 6th request)
for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.osdhyan.com/api/auth/send-otp -H "Content-Type: application/json" -d '{"phone":"9999999999"}'; done

# Test email (sends welcome email to yourself)
php artisan tinker --execute="Mail::to('your@email.com')->send(new App\Mail\WelcomeEmail(App\Models\User::first()));"
```

---

## Files Created in Phase 0

### Backend
| File | Purpose |
|---|---|
| `.env` | Redis + Resend mail + Sentry config |
| `config/cors.php` | Production CORS with env-driven allowed origins |
| `config/horizon.php` | Horizon queue config (default / ai / mail queues) |
| `app/Mail/WelcomeEmail.php` | Welcome email on registration |
| `app/Mail/TestResultEmail.php` | Result summary email after test completion |
| `app/Mail/OtpEmail.php` | OTP via email (fallback when SMS fails) |
| `resources/views/emails/welcome.blade.php` | Welcome email HTML template |
| `resources/views/emails/test_result.blade.php` | Test result HTML template |
| `resources/views/emails/otp.blade.php` | OTP email HTML template |
| `app/Jobs/GenerateAIInsightsJob.php` | Async AI insights (dispatched to `ai` queue) |
| `app/Jobs/GenerateAIExplanationJob.php` | Async AI explanation (dispatched to `ai` queue) |
| `app/Jobs/SendTestResultEmailJob.php` | Async result email (dispatched to `mail` queue) |
| `app/Http/Controllers/Api/AuthController.php` | + Rate limiting, welcome email, OTP email fallback |
| `app/Http/Controllers/Api/AnalyticsController.php` | + Caching (30min topic, 6h AI insights), async jobs |
| `app/Http/Controllers/Api/TestAttemptController.php` | + Result email job dispatch, cache bust on completion |
| `routes/api.php` | + Throttle middleware (5/min auth, 3/min OTP, 120/min sync) |
| `app/Console/Commands/GenerateSitemap.php` | `php artisan sitemap:generate` |
| `app/Console/Kernel.php` | Scheduled: sitemap daily, Horizon snapshot every 5min |
| `public/robots.txt` | Blocks crawlers from /api, /admin, /horizon |
| `supervisor.conf` | Horizon + scheduler supervisor config |
| `Dockerfile` | Production Docker image (PHP 8.2-fpm + Nginx) |

### Frontend
| File | Purpose |
|---|---|
| `apps/portal/src/app/layout.tsx` | Full OG/Twitter/robots meta tags + JSON-LD schema |
| `apps/portal/src/app/robots.ts` | Next.js robots.txt (blocks AI scrapers) |
| `apps/portal/src/app/sitemap.ts` | Next.js sitemap with all public routes |
| `apps/portal/sentry.client.config.ts` | Sentry browser config + Replay integration |
| `apps/portal/sentry.server.config.ts` | Sentry server config |
| `apps/portal/sentry.edge.config.ts` | Sentry edge runtime config |
| `apps/portal/next.config.ts` | Security headers, Google avatar domain, redirects |

### DevOps
| File | Purpose |
|---|---|
| `docker-compose.yml` | Full stack: postgres + redis + backend + horizon + portal |
| `.github/workflows/ci.yml` | CI: lint + typecheck portal, PHP syntax check, mobile typecheck |
| `PHASE0_SETUP.md` | This file |

---

## What Phase 0 Fixes

| Problem | Fix |
|---|---|
| AI calls blocking HTTP requests (30s timeouts) | Dispatched to `ai` queue, results cached 6h |
| No welcome email on registration | WelcomeEmail queued on register + OTP verify + Google OAuth |
| No result notification | SendTestResultEmailJob dispatched after completeAttempt |
| OTP delivery fails = complete lockout | SMS failure → email fallback automatically |
| Brute force on login/OTP possible | RateLimiter on all auth routes (5/min login, 3/min OTP) |
| No CORS control = any domain can call API | env-driven ALLOWED_ORIGINS, strict in production |
| File-based cache = slow under load | Redis cache + Redis sessions |
| No queue workers = jobs pile up | Horizon with 3 specialized queues |
| Google can't index the platform | robots.txt, sitemap.xml, full OG/meta tags |
| No error visibility in production | Sentry on both Laravel and Next.js |
| Manual deployments = risk | GitHub Actions CI on every PR + Docker stack |
