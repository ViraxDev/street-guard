FROM php:8.2.8-fpm-alpine

#php installer helper
#see https://github.com/mlocati/docker-php-extension-installer
ADD https://github.com/mlocati/docker-php-extension-installer/releases/download/2.1.26/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

#install composer
RUN install-php-extensions @composer-2.5.7

#install php dependencies
RUN install-php-extensions zip-1.21.1
#install pecl dependencies (php extensions)
#should be incremented at regular interval
RUN install-php-extensions xdebug-3.2.1

#configure .ini settings
# Use the default development configuration
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
#then override the default with the following
COPY ./infrastructure/php/etc/php.ini "$PHP_INI_DIR/conf.d/php-custom.ini"

# Ignoring php-cs-fixer's environment requirements for now
ENV PHP_CS_FIXER_IGNORE_ENV=true

# Chromium and ChromeDriver
ENV PANTHER_NO_SANDBOX 1
# Not mandatory, but recommended
ENV PANTHER_CHROME_ARGUMENTS='--disable-dev-shm-usage'
RUN apk add --no-cache chromium chromium-chromedriver

# Firefox and GeckoDriver (optional)
ARG GECKODRIVER_VERSION=0.28.0
RUN apk add --no-cache firefox libzip-dev; \
    docker-php-ext-install zip pdo_mysql
RUN wget -q https://github.com/mozilla/geckodriver/releases/download/v"$GECKODRIVER_VERSION"/geckodriver-v"$GECKODRIVER_VERSION"-linux64.tar.gz; \
    tar -zxf geckodriver-v"$GECKODRIVER_VERSION"-linux64.tar.gz -C /usr/bin; \
    rm geckodriver-v"$GECKODRIVER_VERSION"-linux64.tar.gz

# Installation de Node.js, npm et npx
RUN apk add --no-cache nodejs npm

RUN apk add --no-cache bash jq

RUN echo "alias sf='bin/console'" >> ~/.bashrc

#the default folder where the app will be
WORKDIR /var/task
