FROM node:8.11-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .babelrc .
COPY Frontend/game .
RUN ./node_modules/.bin/rollup game.mjs --format iife --name mazelike --file game.mjs && \
  ./node_modules/.bin/babel game.mjs -o game.js

FROM node:8.11-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
COPY --from=build /app/game.*js Frontend/game/

VOLUME /data
EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["/bin/ash", "scripts/mazelike.sh"]