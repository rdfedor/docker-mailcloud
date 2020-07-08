#!/bin/sh

./stop-cloud.sh
docker-compose -f docker-compose.yml -f mail-cloud/docker-compose.yml build
./start-cloud.sh