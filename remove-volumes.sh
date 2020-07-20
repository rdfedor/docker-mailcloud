#!/bin/sh

docker volume rm $(docker volume ls | grep 'cloudserver')