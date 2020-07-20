#!/bin/sh

RAINLOOP_VERSION=7.0.1

echo "Installing DMSSync"

mkdir -p /var/www/html/custom_apps/dmssync/

cp -R /tmp/nextcloud-dmssync/* /var/www/html/custom_apps/dmssync/

echo "Downloading Rainloop ${RAINLOOP_VERSION}"

curl https://codeload.github.com/pierre-alain-b/rainloop-nextcloud/zip/${RAINLOOP_VERSION} --output /tmp/rainloop-nextcloud.zip
mkdir -p /var/www/html/custom_apps/rainloop/
unzip -o /tmp/rainloop-nextcloud.zip -d /tmp
echo "Installing Rainloop to Nextcloud"
cp -R /tmp/rainloop-nextcloud-${RAINLOOP_VERSION}/* /var/www/html/custom_apps/rainloop/

echo "Fixing file and folder permissions"
chown -R 82:82 /var/www/html/custom_apps
chmod -R a+rx /var/www/html/custom_apps

echo "Starting Patching Service for Rainloop in Nextcloud"

while [ true ]
do 
    sed -i "s/return \$sAppPath;/return str_replace\('\/apps\/rainloop\/app', '\/custom_apps\/rainloop\/app', \$sAppPath\);/g" /var/www/html/custom_apps/rainloop/app/rainloop/v/1.14.0/app/libraries/RainLoop/Utils.php
    sleep 2
done