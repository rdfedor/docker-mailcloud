#!/bin/sh

docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml build
./stop-mail.sh
./start-mail.sh