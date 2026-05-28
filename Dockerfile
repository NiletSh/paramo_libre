FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql mysqli \
    && a2enmod rewrite

# Permisos para subida de portadas (volumen montado puede requerir chmod en el host)
RUN mkdir -p /var/www/html/uploads/covers \
    && chown -R www-data:www-data /var/www/html/uploads

WORKDIR /var/www/html
