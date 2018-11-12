FROM node:8.11-alpine AS build

WORKDIR /app

RUN apk update && apk add \
  python \
  make \
  gcc \
  g++

COPY package*.json ./
RUN npm install --production

FROM node:8.11-alpine

WORKDIR /app

COPY --from=build /app/node_modules node_modules

COPY . .

VOLUME /data
EXPOSE 3000

CMD ["/bin/ash", "scripts/init"]
