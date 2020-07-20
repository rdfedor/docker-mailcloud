FROM tvial/docker-mailserver:latest

RUN apt-get update && apt-get install -y dovecot-sqlite postfix-sqlite curl

# RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -

# RUN apt install nodejs

# Update dovecot installation

COPY target/bin/* /usr/local/bin/

RUN chmod a+x /usr/local/bin/*

COPY target/cron.d/* /etc/cron.daily/

RUN chmod a+x /etc/cron.daily/*

COPY target/dovecot/* /etc/dovecot/conf.d/

RUN /etc/cron.daily/update-postgrey-whitelist.sh

# Install mail-manager

# RUN mkdir -p /usr/src/mail-manager

# WORKDIR /usr/src/mail-manager

# COPY ./manager/package*.json .RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -

# RUN apt install nodejs

# RUN npm install

# COPY ./manager/. .

# COPY target/supervisor/conf.d/* /etc/supervisor/conf.d/

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]