#!/bin/bash

# check we have a postgrey_whitelist_clients file and that it is not older than 28 days
if [ ! -f /etc/postgrey/whitelist_clients.local ] || find /etc/postgrey/whitelist_clients.local -mtime +28 | grep -q '.' ; then
    # ok we need to update the file, so lets try to fetch it
    if curl https://postgrey.schweikert.ch/pub/postgrey_whitelist_clients --output /tmp/postgrey_whitelist_clients -sS --fail > /dev/null 2>&1 ; then
        # if fetching hasn't failed yet then check it is a plain text file
        # curl manual states that --fail sometimes still produces output
        # this final check will at least check the output is not html
        # before moving it into place
        if [ "\$(file -b --mime-type /tmp/postgrey_whitelist_clients)" == "text/plain" ]; then
            mv /tmp/postgrey_whitelist_clients /etc/postgrey/whitelist_clients.local
            cat /tmp/docker-mailserver/whitelist_clients.local >> /etc/postgrey/whitelist_clients.local

            service postgrey restart
	else
            rm /tmp/postgrey_whitelist_clients
        fi
    fi
fi