# OSDHYAN on Google Cloud — the live server

Set up on 28 Oct 2026 from the `deploy/` bundle (see CLOUD_SETUP.md for how the
bundle works). Everything runs on one VM with Docker Compose.

| Item | Value |
|---|---|
| Site | https://8-234-95-50.sslip.io (until osdhyan.online points here) |
| Admin sign-in | https://8-234-95-50.sslip.io/admin/login — credentials in `C:\dev\osdhyan-data\cloud-admin.txt` on the owner's laptop |
| Google account | ops@weldots.com (organisation weldots.com) |
| Project | `osdhyan-live` (own project, separate from Weldots CRM; billing account "My Billing Account") |
| VM | `osdhyan-server`, zone asia-south1-a (Mumbai), e2-standard-2 (2 vCPU, 8 GB), 50 GB SSD, Ubuntu 24.04, Shielded VM |
| Fixed IP | 8.234.95.50 (`osdhyan-ip`) |
| Firewall | `osdhyan-allow-web` (80, 443) + default SSH; remote-desktop rule removed |
| Code on the server | `/home/dell/osdhyan` (copied as an archive, no git) |
| Settings | `/home/dell/osdhyan/deploy/.env` (server only) |
| Backups | `/home/dell/osdhyan/deploy/backups/` nightly after 02:00 IST |
| Rough cost | VM about US$55/month + disk about US$5/month |

## Deploy a new version from the laptop

Commit the change, then:
```powershell
powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\deploy\scripts\push-to-gcp.ps1
```
It backs up, sends the committed code, rebuilds and restarts. 5–10 minutes.

## Open a shell on the server
```powershell
gcloud compute ssh osdhyan-server --project=osdhyan-live --zone=asia-south1-a
cd ~/osdhyan/deploy
docker compose ps
docker compose logs -f --tail 100 backend
```

## Import a new question pack
After `push-to-gcp.ps1` has sent the pack files:
```bash
docker compose exec backend php artisan osdhyan:import-question-sets database/data/dsssb/<pack>/question_sets.json
```
Course PDFs are uploaded through the admin panel, or from the laptop with
`OSDHYAN_ADMIN_EMAIL` / `OSDHYAN_ADMIN_PASSWORD` set to the admin login and
`python -I scripts/content/publish-subject-course.py <pack> --api https://8-234-95-50.sslip.io/api`.

## Point osdhyan.online here
1. DNS: `A @ 8.234.95.50` and `A www 8.234.95.50` (Cloudflare: DNS only first).
2. In `deploy/.env` on the server set
   `SITE_ADDRESS=osdhyan.online, www.osdhyan.online, 8-234-95-50.sslip.io`,
   `APP_URL=https://osdhyan.online`, `FRONTEND_URL=https://osdhyan.online`,
   `ALLOWED_ORIGINS=https://osdhyan.online,https://www.osdhyan.online,https://8-234-95-50.sslip.io`,
   `SANCTUM_STATEFUL_DOMAINS=osdhyan.online,www.osdhyan.online,8-234-95-50.sslip.io`.
3. `docker compose build portal && docker compose up -d` (the website bakes its address in at build time).

## Turn on e-mail sign-in codes
Fill `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` (and `MAIL_HOST` for Brevo) in
`deploy/.env`, then `docker compose up -d backend` and
`docker compose exec backend php artisan osdhyan:mail-test you@example.com`.
Until then students cannot sign in by code on this server (production never shows codes).

## Android app (APK)

- Download link (also on the home page): https://8-234-95-50.sslip.io/storage/downloads/osdhyan.apk
- Signing key: `C:\dev\osdhyan-data\android\osdhyan-release.jks`, password in
  `C:\dev\osdhyan-data\android\keystore.txt`. **Back both up.** Android only installs
  updates signed with the same key. SHA-256 fingerprint:
  `B2:14:88:DA:CA:05:86:C3:04:E1:C5:6F:53:5D:80:8C:F2:FF:0E:E4:69:6A:84:F4:7B:63:8D:D5:21:42:2E:20`
  (needed later for Firebase and Google sign-in).

Publish a new version:
1. Raise `version` in `mobile/osdhyan/package.json` and set a higher `OSDHYAN_ANDROID_VERSION_CODE`.
2. `bash mobile/osdhyan/scripts/build-apk.sh` (20–40 minutes; needs about 5 GB free disk).
3. Upload, replacing the old file:
```powershell
gcloud compute scp mobile\osdhyan\dist\osdhyan-<version>-<code>.apk osdhyan-server:/home/dell/osdhyan.apk --project=osdhyan-live --zone=asia-south1-a
gcloud compute ssh osdhyan-server --project=osdhyan-live --zone=asia-south1-a --command="cd ~/osdhyan/deploy && docker compose cp /home/dell/osdhyan.apk backend:/var/www/osdhyan/storage/app/public/downloads/osdhyan.apk"
```
