FROM nextcloud:fpm-alpine

RUN apk add --update --virtual unzip

COPY target/bin/* /usr/local/bin/

RUN chmod a+x /usr/local/bin/*

ENTRYPOINT [ "docker-entrypoint.sh" ]

CMD ["php-fpm"]