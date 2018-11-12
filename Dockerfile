FROM node:8.11-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["scripts/mazelike"]