#!/usr/bin/env bash
# First start of OSDHYAN on the server. Run from anywhere:
#   bash deploy/scripts/first-deploy.sh
# Creates deploy/.env from the template if missing, fills APP_KEY and
# POSTGRES_PASSWORD, builds the images and starts everything.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
    cp .env.example .env
    chmod 600 .env
    echo "Created deploy/.env from the template. Fill in SITE_ADDRESS, APP_URL,"
    echo "ACME_EMAIL, ADMIN_EMAIL/ADMIN_PASSWORD and the MAIL_* lines, then run me again."
    exit 1
fi

set_if_empty() {  # set_if_empty KEY VALUE
    if grep -q "^$1=$" .env; then
        sed -i "s|^$1=$|$1=$2|" .env
        echo "  generated $1"
    fi
}
set_if_empty POSTGRES_PASSWORD "$(openssl rand -hex 24)"
set_if_empty APP_KEY "base64:$(openssl rand -base64 32)"
chmod 600 .env

grep -q '^SITE_ADDRESS=.' .env || { echo "SITE_ADDRESS is empty in deploy/.env"; exit 1; }
grep -q '^APP_URL=.' .env || { echo "APP_URL is empty in deploy/.env"; exit 1; }
grep -q '^ACME_EMAIL=.' .env || { echo "ACME_EMAIL is empty in deploy/.env (your e-mail, for HTTPS certificate notices)"; exit 1; }

mkdir -p backups restore
echo "== Building images (the first time takes 5-10 minutes)"
docker compose build
echo "== Starting"
docker compose up -d

echo "== Waiting for the API"
for _ in $(seq 1 60); do
    if docker compose exec -T backend curl -fsS http://127.0.0.1:10000/api/health >/dev/null 2>&1; then
        echo "API is up."
        break
    fi
    sleep 5
done
docker compose ps
echo
echo "Next: load the laptop data with scripts/restore-from-laptop.sh, then open APP_URL."
echo "After the first admin sign-in, blank ADMIN_PASSWORD in deploy/.env and run:"
echo "  docker compose up -d backend"
