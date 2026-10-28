# OSDHYAN on the company cloud — setup guide

This folder runs the whole of OSDHYAN on **one Linux server** with Docker:
the website, the API, the database, Redis, the queue worker, the scheduler,
automatic HTTPS and nightly backups. It works the same on AWS, Azure, Google
Cloud or any VPS, so moving later to your own cloud is the same steps on a new
server plus one data copy (step 7).

```
Internet ──► Caddy (80/443, HTTPS) ──┬─ /api, /storage, /up ─► backend (Laravel + nginx + php-fpm,
                                     │                          queue worker, scheduler)
                                     └─ everything else ──────► portal (Next.js website)
             backend ─► postgres 16 (data volume)   backend ─► redis 7
             backup  ─► deploy/backups/ every night (database 30 days, files 7 days)
```

Only ports 80 and 443 are open to the internet. The database and Redis are
never reachable from outside.

---

## 1. Ask the company IT team for this (copy and send)

> I need one Linux virtual machine for an education web app (OSDHYAN), with written
> permission to host it on the company account.
> - **OS:** Ubuntu Server 24.04 LTS (22.04 is fine), 64-bit x86.
> - **Size:** 2 vCPU and **8 GB RAM** (4 GB works for a soft launch), **60 GB SSD**.
>   AWS `t3.large` · Azure `B2ms` · Google Cloud `e2-standard-2`, or similar.
> - **Region:** Mumbai (AWS ap-south-1 · Azure Central India · GCP asia-south1).
> - **Static public IP** (AWS Elastic IP / Azure static IP / GCP reserved address).
> - **Inbound firewall:** TCP 80 and 443 from anywhere, UDP 443 from anywhere,
>   TCP 22 (SSH) only from our office/home IPs.
> - **Outbound:** internet allowed (Docker Hub, npm, Packagist, Let's Encrypt,
>   Gmail/Brevo SMTP on port 587, Google/Firebase).
> - **Access:** a user with sudo for me, logging in with my SSH public key.
> - **Disk snapshots:** a daily snapshot of the VM disk kept 7 days, if your policy allows.
> - **Optional:** a private storage bucket (S3 / Azure Blob / GCS) for off-site backups.

Rough running cost on any of the three: ₹2,500–5,000 a month for the VM,
plus a little for snapshots and the bucket.

**Keep in your own name, not the company's:** the domain `osdhyan.online`, the
Firebase project, the Razorpay account, the e-mail sender and the Google Play
account. Then moving off the company cloud later changes only the server.

**Student data:** the database holds students' names, phone numbers and
e-mails. Ask for the permission in writing, and agree that the data and its
backups belong to OSDHYAN and will be handed over or deleted when you move.

## 2. Make your SSH key (on the laptop, once)

```powershell
ssh-keygen -t ed25519 -C "osdhyan-server"
type $env:USERPROFILE\.ssh\id_ed25519.pub
```
Send the printed line (the **public** key) to IT. Never send the file without `.pub`.

## 3. Prepare the server (once)

```bash
ssh <user>@<SERVER_IP>
git clone https://github.com/<you>/test-series-platform.git
cd test-series-platform
git checkout fix/exam-scale-bulk-import    # or main, once merged
sudo bash deploy/scripts/server-setup.sh
exit                                       # log out and back in so docker works without sudo
```
This installs Docker from Docker's own repository, opens only SSH/80/443 in the
server firewall, adds 4 GB swap and turns on automatic security updates.

## 4. Fill in the settings

```bash
ssh <user>@<SERVER_IP>
cd test-series-platform
bash deploy/scripts/first-deploy.sh        # creates deploy/.env and stops
nano deploy/.env
```
Fill in at least:

| Setting | Value |
|---|---|
| `SITE_ADDRESS` | `osdhyan.online, www.osdhyan.online` (for a first test before DNS: `:80`) |
| `APP_URL`, `FRONTEND_URL` | `https://osdhyan.online` (first test: `http://<SERVER_IP>`) |
| `ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS` | the same address(es) |
| `ACME_EMAIL` | your e-mail, for certificate notices |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the root admin login (first boot only) |
| `MAIL_*` | Gmail App Password or Brevo SMTP key — **needed before students can sign in by code**, because production never shows codes on screen |

`APP_KEY` and `POSTGRES_PASSWORD` are generated for you. `deploy/.env` stays on
the server only; it is ignored by git.

## 5. Start it

```bash
bash deploy/scripts/first-deploy.sh
```
The first build takes 5–10 minutes. It ends by printing the running services;
all should say `running` or `healthy`.

## 6. Point the domain at the server

At the place where `osdhyan.online` is managed, add:

| Type | Name | Value |
|---|---|---|
| A | `@` | `<SERVER_IP>` |
| A | `www` | `<SERVER_IP>` |
| A | `api` | `<SERVER_IP>` (optional, for the Android app later) |

If the domain is on Cloudflare, keep the records **DNS only (grey cloud)** until
the site opens on https, then you may switch the proxy on with SSL mode
**Full (strict)**. Caddy gets the certificate within a minute of DNS working.

## 7. Copy the laptop data to the server

On the laptop (PostgreSQL must be running):
```powershell
powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\deploy\scripts\export-laptop-data.ps1
scp C:\dev\osdhyan-data\migration\* <user>@<SERVER_IP>:~/test-series-platform/deploy/restore/
```
On the server:
```bash
bash deploy/scripts/restore-from-laptop.sh      # asks you to type YES
```
It first backs up whatever the server already has, then loads the laptop
database and every uploaded PDF, runs any new migrations and prints the counts
of users, questions and tests. Your existing logins keep working.

Then check every course and test pack from the laptop:
```powershell
$env:OSDHYAN_CHECK_LOGIN="<admin e-mail>"; $env:OSDHYAN_CHECK_PASSWORD="<admin password>"
python -I C:\dev\test-series-platform\scripts\smoke_pack.py "General Awareness" --api https://osdhyan.online/api
```

## 8. After the first admin sign-in

Blank `ADMIN_PASSWORD=` in `deploy/.env`, then `docker compose -f deploy/docker-compose.yml up -d backend`.
(While it is set, the admin password is reset to it on every restart.)

## 9. Backups

- Every night after 02:00 IST the `backup` service writes
  `deploy/backups/db/osdhyan_<date>.dump` (kept 30 days) and
  `deploy/backups/files/storage_<date>.tar.gz` (kept 7 days).
- Make one now: `docker compose -f deploy/docker-compose.yml exec backup /bin/sh /backup-loop.sh now`
- **Off-site copy** (do this, the server disk is a single point of failure):
  install `rclone`, connect it to the company bucket (`rclone config`), and add
  to `crontab -e`:
  `30 4 * * * rclone sync ~/test-series-platform/deploy/backups osdhyan-bucket:osdhyan-backups`
- **Restore test once a month:** copy the newest dump to `deploy/restore/osdhyan_db.dump`
  on a spare server and run `restore-from-laptop.sh` there.

## 10. Everyday commands (run in `deploy/`)

| What | Command |
|---|---|
| See what is running | `docker compose ps` |
| Live logs of the API | `docker compose logs -f --tail 100 backend` |
| Deploy a new version | `bash scripts/update.sh` (backs up first) |
| Restart everything | `docker compose restart` |
| Laravel command | `docker compose exec backend php artisan <command>` |
| Import a question pack | `docker compose exec backend php artisan osdhyan:import-question-sets database/data/dsssb/<pack>/question_sets.json` |
| Test e-mail sending | `docker compose exec backend php artisan osdhyan:mail-test you@example.com` |
| Database shell | `docker compose exec postgres psql -U osdhyan` |

## 11. Uptime alerts (free)

Create a free UptimeRobot (or Better Stack) account and add an HTTP monitor
for `https://osdhyan.online/api/health` every 5 minutes, with alerts to your
phone and e-mail.

## 12. Later: moving to your own cloud

Do steps 3–5 on the new server, then on the OLD server run
`docker compose exec backup /bin/sh /backup-loop.sh now`, copy the newest
`backups/db/*.dump` and `backups/files/*.tar.gz` to the new server's
`deploy/restore/` as `osdhyan_db.dump` and `storage_app.tar.gz`, run
`restore-from-laptop.sh`, then change the two DNS records. Downtime is a few minutes.
