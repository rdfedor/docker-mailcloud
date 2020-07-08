#!/bin/sh

RAINLOOP_VERSION=7.0.1

echo "Installing Rainloop ${RAINLOOP_VERSION}"

curl https://github.com/pierre-alain-b/rainloop-nextcloud/archive/${RAINLOOP_VERSION}.zip --output /tmp/rainloop-nextcloud.zip

echo "Extracting zip..."
mkdir -p /var/www/html/custom_apps/rainloop/
unzip -o /tmp/rainloop-nextcloud.zip -d /var/www/html/custom_apps/rainloop/

sed -i "s/return \$sAppPath;/return str_replace\('\/apps\/rainloop\/app', '\/custom_apps\/rainloop\/app', \$sAppPath\);/g" /var/www/html/custom_apps/rainloop/app/rainloop/v/1.14.0/app/libraries/RainLoop/Utils.php

php-fpm