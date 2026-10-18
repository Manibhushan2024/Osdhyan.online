# Hosting OSDHYAN from this laptop

Everything runs on the laptop; the world reaches it through a Cloudflare tunnel.
One public URL serves the portal **and** the API (Next.js proxies `/api` and
`/storage` to Laravel — see `apps/portal/next.config.ts`).

```
Internet ──HTTPS──► Cloudflare tunnel ──► Next.js portal :3000 ──/api──► Apache + PHP :8000 ──► PostgreSQL :5433
                                                                                             └─► Redis :6379
```

| Piece | How it runs | Where |
|---|---|---|
| PostgreSQL 16 | `pg_ctl` on port **5433**, data in `C:\dev\osdhyan-data\pgdata` (local-only, trust auth) | started by `start-all.ps1` |
| Redis | Windows service "Redis" (`C:\Redis`), snapshots disabled (cache/queue only) | service |
| Laravel API | XAMPP Apache + mod_php + OPcache on **127.0.0.1:8000** (`scripts/host/apache-osdhyan.conf`, included from `C:\xampp\apache\conf\httpd.conf`) | `start-all.ps1` |
| Queue worker + scheduler | `php artisan queue:work`, `php artisan schedule:work` | `start-all.ps1` |
| Portal | `next build` → standalone server on **3000** | `start-all.ps1` |
| Public link | `cloudflared` quick tunnel (temporary URL) or named tunnel (permanent) | `start-all.ps1` |

## Daily use

```powershell
# start (or restart) everything — prints the public link at the end
powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\scripts\host\start-all.ps1

# after pulling code changes
powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\scripts\host\start-all.ps1 -Rebuild

# stop
powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\scripts\host\stop-all.ps1
```

Current temporary link is saved in `C:\dev\osdhyan-data\current-link.txt`. Logs are in `C:\dev\osdhyan-data\logs\`.

## Permanent link (one-time)

1. Put **osdhyan.online** on Cloudflare DNS (Cloudflare dashboard → Add site → free plan → change nameservers at your registrar).
2. In a terminal: `cloudflared tunnel login` → the browser opens → choose osdhyan.online.
3. `powershell -ExecutionPolicy Bypass -File scripts\host\setup-permanent-link.ps1 -Hostname app.osdhyan.online`
4. Set `APP_URL` / `FRONTEND_URL` in `backend\.env` and `NEXT_PUBLIC_SITE_URL` in `apps\portal\.env.local` to `https://app.osdhyan.online`, then run `start-all.ps1 -Rebuild`.
5. Auto-start at login: `powershell -ExecutionPolicy Bypass -File scripts\host\install-autostart.ps1`
6. Windows Settings → Power → set *Sleep* to **Never** while plugged in. A sleeping laptop = site down.

## Running the backend tests while hosting

`start-all.ps1` caches the Laravel config. Before `php artisan test`, run `php artisan config:clear`
(the suite refuses to run otherwise — this protects the live database), and `php artisan config:cache`
afterwards.

## Limits of a laptop host (be honest with yourself)

- Fine for: demos, content upload, the first few hundred students, small live classes.
- Not fine for: a scheduled mock with thousands of students, or anything that must stay up when the laptop sleeps, reboots, or the home internet drops. For that, follow Phase 2 in `SCALING_AND_ROADMAP.md` (same code, cloud hosting).
- Keep ≥ 3 GB RAM free: close Chrome/VS Code/Docker while hosting. Today the API crashed with *Out of memory* because the laptop had 0.2 GB free.
- Backups: `pg_dump -h 127.0.0.1 -p 5433 -U postgres test_series_db > backup.sql` (do it before big imports). Uploaded files live in `backend\storage\app\public`.

## Settings that matter in `backend\.env` when public

```
APP_ENV=staging        # local = debug toggles on; production = strict
APP_DEBUG=false        # never true on a public link (stack traces leak)
APP_URL=https://<your link>
FRONTEND_URL=https://<your link>
ALLOWED_ORIGINS=https://<your link>
PAYMENTS_FAKE=true     # test-mode checkout until Razorpay keys are set
```
