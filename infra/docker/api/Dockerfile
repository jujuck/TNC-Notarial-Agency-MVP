# syntax=docker/dockerfile:1

# Dependances de production.
FROM composer:2 AS vendor
WORKDIR /app
COPY api/ ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

# Dependances de developpement (tests, PHPStan, PHP-CS-Fixer).
FROM composer:2 AS vendor-dev
WORKDIR /app
COPY api/ ./
RUN composer install \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts

FROM php:8.4-fpm-alpine AS runtime

# fileinfo est deja compile et active dans l'image officielle.
RUN apk add --no-cache oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS oniguruma-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring opcache \
    && apk del .build-deps

COPY infra/docker/api/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY infra/docker/api/www.conf /usr/local/etc/php-fpm.d/zz-app.conf

WORKDIR /srv/api

COPY --chown=www-data:www-data api/ /srv/api/
COPY --from=vendor --chown=www-data:www-data /app/vendor /srv/api/vendor

EXPOSE 9000

CMD ["php-fpm", "-F"]

# Cible de developpement : dependances de test incluses.
FROM runtime AS dev

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY infra/docker/api/php-dev.ini /usr/local/etc/php/conf.d/zz-dev.ini
COPY --from=vendor-dev --chown=www-data:www-data /app/vendor /srv/api/vendor
