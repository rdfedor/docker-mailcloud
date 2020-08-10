#!/bin/sh

docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml -f mail-cloud/docker-compose.yml down $@