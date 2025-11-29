# ims-inventory Dockerfile
FROM php:8.2-fpm

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy Laravel code
COPY . .

# Install PHP dependencies (Cloudinary + Laravel 11)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set proper permissions
RUN mkdir -p storage/framework/{cache,views,sessions} \
    && mkdir -p storage/logs \
    && mkdir -p /var/www/.config/psysh \
    && chown -R www-data:www-data /var/www/html \
    && chown -R www-data:www-data /var/www/.config \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/.config

# Switch to non-root user
USER www-data

EXPOSE 9000
CMD ["php-fpm"]