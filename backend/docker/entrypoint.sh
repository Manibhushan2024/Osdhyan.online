#!/bin/sh
set -e

cd /var/www/osdhyan

# Cache config/routes/views at runtime (not build time) so env vars are available
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run pending migrations automatically
php artisan migrate --force

# Create storage symlink if not present
php artisan storage:link 2>/dev/null || true

exec supervisord -c /etc/supervisor/supervisord.conf
