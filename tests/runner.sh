#!/bin/sh

if [ "$1" == "backend" ]; then
  ls
  exec /usr/src/app/node_modules/.bin/jasmine tests/spec
elif [ "$1" == "browser" ]; then
  exec node browser-ci
else
  echo "Unknown command $1"
fi