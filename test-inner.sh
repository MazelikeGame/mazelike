#!/bin/bash

npm run eslint && ./node_modules/.bin/jasmine && node browser-ci

echo $? > /app/runner-result