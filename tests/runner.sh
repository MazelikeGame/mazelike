#!/bin/sh

if [ "$1" == "backend" ]; then
  ./node_modules/.bin/jasmine
  echo $? > /usr/src/app/runner-result
elif [ "$1" == "browser" ]; then
  node browser-ci
  echo $? > /usr/src/app/runner-result
else
  exec $*
fi