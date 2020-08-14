#!/bin/sh

docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml -f mail-cloud/docker-compose.yml pull
docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml -f mail-cloud/docker-compose.yml build
./stop.sh
./start.sh