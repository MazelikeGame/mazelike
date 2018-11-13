ARG BASE="node:8.11-alpine"
FROM ${BASE}

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ARG DATA="/data"
VOLUME ${DATA}
EXPOSE 3000

ENTRYPOINT ["node", "scripts/mazelike.js"]