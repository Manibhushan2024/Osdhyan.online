#!/bin/sh
# Runs inside the "backup" container. Once a day, after BACKUP_HOUR (IST):
#   /backups/db/osdhyan_<date>.dump        pg_dump custom format, kept BACKUP_KEEP_DAYS
#   /backups/files/storage_<date>.tar.gz   uploaded PDFs/images, kept 7 days
# "backup-loop.sh now" makes one backup immediately and exits.
set -u
KEEP="${BACKUP_KEEP_DAYS:-30}"
HOUR="${BACKUP_HOUR:-2}"
mkdir -p /backups/db /backups/files

run_backup() {
    ts=$(date +%Y-%m-%d_%H%M)
    echo "[backup] $ts starting"
    if pg_dump -Fc -f "/backups/db/osdhyan_$ts.dump.part"; then
        mv "/backups/db/osdhyan_$ts.dump.part" "/backups/db/osdhyan_$ts.dump"
    else
        echo "[backup] database dump FAILED"
        rm -f "/backups/db/osdhyan_$ts.dump.part"
        return 1
    fi
    if tar -czf "/backups/files/storage_$ts.tar.gz.part" -C /storage_app .; then
        mv "/backups/files/storage_$ts.tar.gz.part" "/backups/files/storage_$ts.tar.gz"
    else
        echo "[backup] files archive FAILED"
        rm -f "/backups/files/storage_$ts.tar.gz.part"
        return 1
    fi
    find /backups/db -name '*.dump' -mtime +"$KEEP" -delete
    find /backups/files -name '*.tar.gz' -mtime +7 -delete
    echo "[backup] $ts done: $(ls -1 /backups/db | wc -l) database dumps kept"
}

if [ "${1:-}" = "now" ]; then
    run_backup
    exit $?
fi

while true; do
    today=$(date +%F)
    hour=$(date +%H)
    hour=${hour#0}
    if [ "$(cat /backups/.last 2>/dev/null)" != "$today" ] && [ "$hour" -ge "$HOUR" ]; then
        run_backup && echo "$today" > /backups/.last
    fi
    sleep 300
done
