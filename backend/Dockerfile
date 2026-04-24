# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM composer:2.7 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-interaction \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --no-scripts

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM php:8.2-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        pcntl \
        bcmath \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/osdhyan

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan storage:link 2>/dev/null; php artisan admin:create --email=${ADMIN_EMAIL:-admin@osdhyan.com} --password=${ADMIN_PASSWORD:-Admin@1234} --name='Super Admin' --phone=9999999999 --admin-role=root 2>/dev/null || true; php artisan serve --host=0.0.0.0 --port=10000"]
