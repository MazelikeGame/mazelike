FROM node:8.11-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN ./node_modules/.bin/rollup Frontend/game/game.mjs --format iife --name mazelike --file Frontend/game/game.mjs && \
  ./node_modules/.bin/babel Frontend/game/game.mjs -o Frontend/game/game.js && \
  ./node_modules/.bin/babel Frontend/scripts/lobby.js -o Frontend/scripts/lobby.js

FROM node:8.11-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
COPY --from=build /app/Frontend Frontend
RUN sed -i "s/VERSION-HERE/$(cat VERSION)/" Frontend/sw.js

VOLUME /data
EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["/bin/ash", "scripts/mazelike.sh"]
