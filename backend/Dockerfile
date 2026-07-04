FROM php:8.2-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    postgresql-dev \
    oniguruma \
    libpng \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p storage/framework/views \
    storage/framework/cache/data \
    storage/framework/sessions \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# FIX: ny sary teo aloha dia "php-fpm" ihany no CMD, nefa php-fpm dia
# mihaino FastCGI amin'ny port 9000 fotsiny — TSY mamaly HTTP request
# mihitsy raha tsy misy nginx/web server eo anoloany manao
# fastcgi_pass. Tsy nisy izany teo amin'ny sary ➜ ny backend dia tsy azo
# antso mihitsy avy any ivelany. Ato dia ampiasaina ny artisan serve
# (ampy ho an'ny démo/déploiement tsotra; raha mila zavatra
# "production-grade" kokoa dia azo soloana amin'ny nginx + php-fpm na
# Laravel Octane).
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]