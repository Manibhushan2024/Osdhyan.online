# ─── Stage 1: Install PHP dependencies ───────────────────────────────────────
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

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM php:8.2-fpm-bookworm AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
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
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/log/supervisor /run/nginx

COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY supervisor.conf /etc/supervisor/conf.d/osdhyan.conf

WORKDIR /var/www/osdhyan

# Copy vendor from composer stage (not from git — vendor is gitignored)
COPY --from=vendor /app/vendor ./vendor

# Copy application source
COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker/entrypoint.sh"]
