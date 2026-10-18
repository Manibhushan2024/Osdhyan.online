# ─── Stage 1: PHP dependencies ───────────────────────────────────────────────
FROM composer:2.7 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-interaction \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --classmap-authoritative \
    --ignore-platform-reqs \
    --no-scripts

# ─── Stage 2: Runtime — nginx + php-fpm + queue worker + scheduler ───────────
#
# Replaces `php artisan serve`, which handles ONE request at a time and was
# the main reason the deployed API was slow under any real load.
FROM php:8.2-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx supervisor gettext-base \
        libpq-dev libzip-dev zip unzip curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip pcntl bcmath opcache \
    && pecl install redis apcu && docker-php-ext-enable redis apcu \
    && rm -rf /var/lib/apt/lists/* /tmp/pear \
    && rm -f /etc/nginx/sites-enabled/default

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-osdhyan.ini
COPY docker/php-fpm-pool.conf /usr/local/etc/php-fpm.d/zz-osdhyan.conf
COPY docker/nginx.conf.template /etc/nginx/osdhyan.conf.template
COPY supervisor.conf /etc/supervisor/conf.d/osdhyan.conf
COPY docker/entrypoint.sh /usr/local/bin/osdhyan-entrypoint
RUN chmod +x /usr/local/bin/osdhyan-entrypoint

WORKDIR /var/www/osdhyan

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Render routes traffic to $PORT (10000 by default).
ENV PORT=10000
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s \
    CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" || exit 1

CMD ["osdhyan-entrypoint"]
