#!/usr/bin/env bash
# Load the laptop's database and uploaded files into the server.
#   1. On the laptop:  powershell -File deploy\scripts\export-laptop-data.ps1
#   2. Copy the two files it makes into deploy/restore/ on the server:
#        osdhyan_db.dump   storage_app.tar.gz
#   3. bash deploy/scripts/restore-from-laptop.sh
# THIS REPLACES the server's database and uploads with the laptop's copy
# (a safety backup of the server's current data is made first).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f restore/osdhyan_db.dump ] || { echo "Missing deploy/restore/osdhyan_db.dump"; exit 1; }

if [ "${1:-}" != "--yes" ]; then
    read -r -p "Replace the server database and uploads with the laptop copy? Type YES: " ok
    [ "$ok" = "YES" ] || { echo "Cancelled."; exit 1; }
fi

echo "== Safety backup of the current server data"
docker compose exec -T backup /bin/sh /backup-loop.sh now || true

echo "== Stopping the website and API while data is replaced"
docker compose stop backend portal

echo "== Restoring the database"
docker compose exec -T postgres psql -U osdhyan -d postgres -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS osdhyan WITH (FORCE);" \
    -c "CREATE DATABASE osdhyan OWNER osdhyan;"
docker compose exec -T postgres pg_restore -U osdhyan -d osdhyan --no-owner --no-privileges \
    --role=osdhyan /restore/osdhyan_db.dump \
    || echo "(pg_restore printed warnings; they are usually harmless — check the counts below)"

if [ -f restore/storage_app.tar.gz ]; then
    echo "== Restoring uploaded files"
    docker compose run --rm --no-deps --entrypoint sh backend -c \
        "tar -xzf /restore/storage_app.tar.gz -C /var/www/osdhyan/storage/app && chown -R www-data:www-data /var/www/osdhyan/storage/app"
fi

echo "== Starting (migrations for anything newer run automatically)"
docker compose up -d backend portal
for _ in $(seq 1 60); do
    if docker compose exec -T backend curl -fsS http://127.0.0.1:10000/api/health >/dev/null 2>&1; then break; fi
    sleep 5
done
docker compose exec -T backend php artisan cache:clear
docker compose exec -T postgres psql -U osdhyan -d osdhyan -t -c \
    "SELECT 'users=' || (SELECT count(*) FROM users) || '  questions=' || (SELECT count(*) FROM questions) || '  tests=' || (SELECT count(*) FROM tests);"
echo "Done. Open APP_URL and sign in."
