FROM nginx:alpine

RUN apk add --update --virtual unzip curl

COPY target/bin/* /usr/local/bin/

RUN chmod a+x /usr/local/bin/*

RUN mkdir -p /tmp/nextcloud-dmssync

COPY ./dmssync /tmp/nextcloud-dmssync/

ENTRYPOINT [ "install-nextcloud-addons.sh" ] 
