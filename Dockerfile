FROM node:8.11-alpine AS build

WORKDIR /app

RUN apk update && apk add \
  python \
  make \
  gcc \
  g++

RUN npm install bcrypt@^3.0.0 --no-save

FROM node:8.11-alpine

HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1
WORKDIR /app

COPY --from=build /app/node_modules node_modules

COPY package*.json ./
RUN npm install --production

COPY Frontend Frontend
COPY Backend Backend
COPY config config
COPY migrations migrations
COPY seeders seeders
COPY VERSION VERSION

VOLUME /data
EXPOSE 3000


CMD ["npm", "start"]
