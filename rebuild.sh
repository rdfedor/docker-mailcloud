#!/bin/sh

./compose.sh pull
./compose.sh build $@
./restart.sh