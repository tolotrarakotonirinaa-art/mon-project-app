FROM php:8.2-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
    postgresql-dev \
    oniguruma \
    libpng \
    && docker-php-ext-install pdo pdo_pgsql

COPY . .

CMD ["php-fpm"]