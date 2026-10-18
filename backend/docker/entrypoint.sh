#!/bin/sh
set -e

cd /var/www/osdhyan

: "${PORT:=10000}"
: "${FPM_MAX_CHILDREN:=20}"
: "${FPM_START_SERVERS:=6}"
: "${FPM_MIN_SPARE:=4}"
: "${FPM_MAX_SPARE:=10}"
export PORT FPM_MAX_CHILDREN FPM_START_SERVERS FPM_MIN_SPARE FPM_MAX_SPARE

# Render config files from env
envsubst '${PORT}' < /etc/nginx/osdhyan.conf.template > /etc/nginx/nginx.conf
envsubst '${FPM_MAX_CHILDREN} ${FPM_START_SERVERS} ${FPM_MIN_SPARE} ${FPM_MAX_SPARE}' \
    < /usr/local/etc/php-fpm.d/zz-osdhyan.conf > /tmp/zz-osdhyan.conf \
    && mv /tmp/zz-osdhyan.conf /usr/local/etc/php-fpm.d/zz-osdhyan.conf

mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# --isolated takes a cache lock so several instances booting together
# don't run migrations concurrently. Set RUN_MIGRATIONS=0 on extra instances.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    php artisan migrate --force --isolated || echo "[entrypoint] migrate failed, continuing..."
fi

# Cache at runtime so all env vars are baked in
php artisan config:cache
php artisan route:cache
php artisan view:cache  || true
php artisan event:cache || true
php artisan storage:link 2>/dev/null || true

# Only provision the root admin when a password is explicitly supplied —
# never reset it to a default on every boot.
if [ -n "${ADMIN_PASSWORD}" ] && [ -n "${ADMIN_EMAIL}" ]; then
    php artisan admin:create --email="${ADMIN_EMAIL}" --password="${ADMIN_PASSWORD}" \
        --name="${ADMIN_NAME:-Super Admin}" --phone="${ADMIN_PHONE:-9999999999}" --admin-role=root \
        || echo "[entrypoint] admin:create failed, continuing..."
fi

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
