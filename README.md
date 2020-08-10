# Docker MailCloud

Docker-MailCloud is an all-in-one productivity suite that provides an email services, file storage, office suite, calendar, contact manager and integrated mail client.  

## Minimum Suggest Host Requirements

This project, with the given configuration can be ran on a 1 vcpu, 1Gb RAM server.  Some of the services such as mail-server's clamd anti-virus consume a considerable amount of memory and because of this, a 2Gb swap is suggested but even though it occasionally runs out of memory.  The following services should be installed on the host machine,

    * docker - https://docs.docker.com/engine/install/
    * docker-compose - https://docs.docker.com/compose/install/
    * fail2ban

### Firewall Rules

To ensure the the server doesn't expose any unnecessary ports, it's suggested that a firewall be used like that of ufw with debian.  If using OpenSSH for remote management, ensure that a non-standard port is used such as port 22000 or 22222.  For the services provided by this project the following additional ports on top of your ssh port will need to be opened up,

    * 80/tcp - http
    * 443/tcp - https
    * 25/tcp - smtp
    * 587/tcp - esmtp
    * 110/tcp - pop3*
    * 143/tcp - imap4
    * 993/tcp - imap4 (encrypted)
    * 995/tcp - pop3* (encrypted)
    * 465/tcp - esmtp (encrypted)
    * 4190/tcp - managesieve filters

Note: Pop3 is considered a legacy service and is not enabled by default.  Update env-mailserver to enable this service.

### Setting up DNS Records

Add the following records to the $DOMAINNAME dns to route the various services to the proper containers replacing the ip below with the ip of the vps,

```
"A"     "mail"  "123.123.123.123" "300"
"CNAME" "cloud" "mail.$DOMAINNAME"  "300"
"CNAME" "*.mail" "mail.$DOMAINNAME" "300"
"CNAME" "*.cloud" "mail.$DOMAINNAME" "300"
```

For autodiscovery, add the following dns to the $DOMAINNAME,

```
"SRV"	 "_autodiscover._tcp" "0 443 autodiscover.mail.$DOMAINNAME" "300" "0"
```

Adding the other dns records to help with discovery,

```
"SRV"   "_imaps._tcp" "1 993 mail.$DOMAINNAME." "300" "0"
"SRV"   "_submission._tcp" "1 587 mail.$DOMAINNAME." "300" "0"
"TXT"   "" "mailconf=https://autoconfig.mail.$DOMAINNAME/mail/config-v1.1.xml" "300"
"TXT"   "" "v=spf1 mx ~all" "300"
```

## Setup

1. Copy the distribution env and env-mailserver file,

```
cp .env-dist .env
cp env-mailserver.dist env-mailserver
```

2. Update DOMAINNAME in .env with the main domain it will be under

4. Create, start and configure the docker services

```
./start.sh
```

5. Copy the default postmaster account and api credentials from the logs

```
docker logs -f mailmanager
```

DANGER: These credentials appear only once on first start so ensure these are logged before they're lost.

### Generate DKIM for Domain

Every domain that sends and recieves email across this server should have DKIM keys generated to help ensure the security of messages sent.  Using the mail-server-setup.sh script can trigger the container to generate these DKIM keys for the domains.

```
./mail-server-setup.sh config generate-dkim-domain example.com
```

Once the command finishes executing, navigate to the opendkim keys directory where the keys are stored for the domain

```
cd ./mail-server/config/opendkim/keys/example.com
```

The contents of mail.txt should added to your the domain's dns records.

### Finish Nextcloud Installation

Navigate to cloud.$DOMAINNAME and follow the setup process finalize the installation.  When asked about installing the default set of apps for email, calendar, contancts and collabora online select yes.

Once logged in, navigate to Apps from the user menu in the upper right.  Disable the Email app and enable the dms-sync and RainLoop apps.

Go back to the upper right and select settings from the user menu. Scroll to the button to Additional Settings and for the API domain enter https://api.mail.$DOMAINNAME along with the api credentials recorded from the previous steps, default domain and quota. 

TODO: Add more details  rainloop integration.

## Components

### nginx-proxy

A reverse proxy which routes incoming requests on port 80 (http) and 443 (ssl) to their respective docker containers based on the domain name.  Builds (./proxy)[./proxy] and is based on (jwilder/nginx-proxy:alpine)[https://github.com/nginx-proxy/nginx-proxy], it uses the environmental variables to define the domain routed to a container via the VIRTUAL_HOST and VIRTUAL_PORT.

### letsencrypt-companion

Provides automated generation of LetsEncrypt certificates for secure transfer of data over ssl through the nginx-proxy companion container (jrcs/letsencrypt-nginx-proxy-companion)[https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion].  LetsEncrypt details are confingured via the LETSENCRYPT_HOST and LETSENCRYPT_EMAIL variables.  The LETSENCRYPT_HOST should match the VIRTUAL_HOST for the nginx-proxy.

### mail-server (mail.$DOMAINNAME)

A modified version of (docker-mailserver)[https://github.com/tomav/docker-mailserver] that provides support to pull account and alias configuration details from a sql backend rather than file based configuration.  The env-mailserver contains the environmental variables used to configure the docker-mailserver container.

### mailmanager (api.mail.$DOMAINNAME)

A NodeJS based api service which helps provide an interface to manage the sql based mail-server configuration.  The container provides the migrations on startup to the mail-server sql backend that allow it to be managed through http requests.  It also handles synchronizing the file based configurations used in mail-server by importing changes to the sql backend as they're made.

### autodiscovery (autodiscover.mail.$DOMAINNAME)

A service using image jsmitsnl/docker-email-autodiscover:latest, it provides auto-configuration capalities for email clients. Special headers are added to the mail server's dns records which allow mail clients to request the configuration from the service so much of it is set automatically for IMAP and SMTP. To add the dns records to support this service, add the following SRV record called _autodiscover._tcp,

```
"SRV"	 "_autodiscover._tcp" "0 443 autodiscover.mail.$DOMAINNAME" "300" "0"
```

### nextcloud-web (cloud.$DOMAINNAME)

Provides a cloud storage platform for storage and sharing files provided by (nextcloud:fpm-alpine)[https://hub.docker.com/_/nextcloud/] that integrates a calendar, contacts list and browser based email client.

### nextcloud-manager

A container which handles the customizations to the nextcloud-web container.  It handles the download and installation of (RainLoop)[https://www.rainloop.net/] and the installation of the dms-sync service that allows emails to be managed through the nextcloud service.  The dms-sync service handles the synchronization of the nextcloud user management and the email service. Creating a new user will make a request to mailmanager to create a new email based on the account's username@example.com.  The domain used to create the accounts are defined in Additional Settings > dms-sync.  Also handles synchronizing the passwords between nextcloud and mail-server.

### nextcloud-collabora (office.cloud.${DOMAINNAME})

Provides support for a browser based office suite to handle writing documents, creating spreadsheets and presentations.

## Development

### Setup

Choose a domain to use for your local development.  For the purpose of this example, we'll be using cloudmail.local.  Copy the .env-dev file to .env and update the DOMAINNAME to cloudmail.local.  Then add the following line to your machines host file to route the requests to your local dev machines.

```
127.0.0.1   mail.cloudmail.local api.mail.cloudmail.local cloud.cloudmail.local office.cloud.cloudmail.local
```

### How-To

Remove all volumes associated with the project,

```
./stop.sh -v
```
