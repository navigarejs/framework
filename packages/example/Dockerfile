# syntax = docker/dockerfile:experimental

# Default to PHP 8.1, but we attempt to match
# the PHP version from the user (wherever `flyctl launch` is run)
# Valid version values are PHP 7.4+
ARG PHP_VERSION=8.1
ARG NODE_VERSION=14
FROM serversideup/php:${PHP_VERSION}-fpm-nginx-v1.5.0 as base

# PHP_VERSION needs to be repeated here
# See https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG PHP_VERSION

LABEL fly_launch_runtime="laravel"

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -

RUN apt-get update && apt-get install -y \
    git curl zip unzip rsync ca-certificates vim htop cron jq nodejs sqlite3 \
    php${PHP_VERSION}-pgsql php${PHP_VERSION}-bcmath \
    php${PHP_VERSION}-swoole php${PHP_VERSION}-xml php${PHP_VERSION}-mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
# copy application code, skipping files based on .dockerignore
COPY . /var/www/html

RUN jq 'del(.repositories)' composer.json > composer.json.temp && rm composer.json && mv composer.json.temp composer.json

RUN composer update

RUN composer install --optimize-autoloader --no-dev \
    && mkdir -p storage/logs \
    && php artisan optimize:clear \
    && chown -R webuser:webgroup /var/www/html \
    && sed -i 's/protected \$proxies/protected \$proxies = "*"/g' app/Http/Middleware/TrustProxies.php \
    && echo "MAILTO=\"\"\n* * * * * webuser /usr/bin/php /var/www/html/artisan schedule:run" > /etc/cron.d/laravel \
    && rm -rf /etc/cont-init.d/* \
    && cp .fly/nginx-websockets.conf /etc/nginx/conf.d/websockets.conf \
    && cp .fly/entrypoint.sh /entrypoint \
    && chmod +x /entrypoint

# If we're using Octane...
RUN if grep -Fq "laravel/octane" /var/www/html/composer.json; then \
        rm -rf /etc/services.d/php-fpm; \
        if grep -Fq "spiral/roadrunner" /var/www/html/composer.json; then \
            mv .fly/octane-rr /etc/services.d/octane; \
            if [ -f ./vendor/bin/rr ]; then ./vendor/bin/rr get-binary; fi; \
            rm -f .rr.yaml; \
        else \
            mv .fly/octane-swoole /etc/services.d/octane; \
        fi; \
        cp .fly/nginx-default-swoole /etc/nginx/sites-available/default; \
    else \
        cp .fly/nginx-default /etc/nginx/sites-available/default; \
    fi

# Prepare database
RUN php artisan migrate:refresh --force && php artisan db:seed --force

# Build application
RUN npm install --global yarn
RUN yarn install --frozen-lockfile
RUN yarn build

# Extend mime types
RUN touch /etc/nginx/conf.d/custom-mime.conf && echo 'types { text/javascript mjs; }' > /etc/nginx/conf.d/custom-mime.conf;

# From our base container created above, we
# create our final image, adding in static
# assets that we generated above
FROM base

RUN chown -R webuser:webgroup /var/www/html/public

EXPOSE 8080

ENTRYPOINT ["/entrypoint"]
