FROM tvial/docker-mailserver:latest

RUN apt-get update && apt-get install -y dovecot-sqlite postfix-sqlite curl

COPY target/bin/* /usr/local/bin/

RUN chmod a+x /usr/local/bin/*

COPY target/cron.d/* /etc/cron.daily/

RUN chmod a+x /etc/cron.daily/*

COPY target/dovecot/* /etc/dovecot/conf.d/

RUN /etc/cron.daily/update-postgrey-whitelist.sh

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]