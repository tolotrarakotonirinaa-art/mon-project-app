FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

RUN apk add --no-cache libpq oniguruma libpng \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql

COPY . .
RUN chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]