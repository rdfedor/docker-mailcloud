#!/bin/sh

./stop-mail.sh
docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml build
./start-mail.sh