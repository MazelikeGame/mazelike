FROM node:8.11-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .babelrc .
COPY Frontend .

WORKDIR /app/game
RUN ../node_modules/.bin/rollup game.mjs --format iife --name mazelike --file game.mjs && \
  ../node_modules/.bin/babel game.mjs -o game.js

WORKDIR /app/scripts
RUN ../node_modules/.bin/babel lobby.js -o lobby.js

FROM node:8.11-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
COPY --from=build /app/game/game.*js Frontend/game/
COPY --from=build /app/scripts/lobby.js Frontend/scripts/
RUN sed -i "s/VERSION-HERE/$(cat VERSION)/" Frontend/sw.js

VOLUME /data
EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["/bin/ash", "scripts/mazelike.sh"]