#!/bin/bash

npm run eslint && ./node_modules/.bin/jasmine

echo $? > /app/runner-result