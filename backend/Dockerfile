FROM php:8.2-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    libpq \
    oniguruma \
    libpng \
    libxml2 \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    libpq-dev \
    oniguruma-dev \
    libpng-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring gd \
    && apk del .build-deps

COPY . .
RUN chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]