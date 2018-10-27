#!/bin/bash

touch /app/runner-result/runner-result
npm run eslint && ./node_modules/.bin/jasmine && node scripts/browser-ci

echo $? > /app/runner-result/runner-result