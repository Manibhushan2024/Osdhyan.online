#!/bin/sh

cd /var/www/osdhyan

# Ensure writable dirs exist
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Run migrations (non-fatal — DB might not be ready on very first cold boot)
php artisan migrate --force || echo "[entrypoint] migrate failed, continuing..."

# Cache at runtime so all env vars are available
php artisan config:cache  || echo "[entrypoint] config:cache failed"
php artisan route:cache   || echo "[entrypoint] route:cache failed"
php artisan view:cache    || echo "[entrypoint] view:cache failed"
php artisan event:cache   || echo "[entrypoint] event:cache failed"

# Storage symlink
php artisan storage:link 2>/dev/null || true

exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
