#!/bin/sh

docker-compose -f docker-compose.yml -f mail-server/docker-compose.yml -f nexmail-cloudtcloud/docker-compose.yml down