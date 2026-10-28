#!/usr/bin/env bash
# Deploy a new version: back up, pull the code, rebuild, restart.
#   bash deploy/scripts/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose exec -T backup /bin/sh /backup-loop.sh now || true
git pull --ff-only
docker compose build backend portal
docker compose up -d
docker image prune -f >/dev/null
docker compose ps
