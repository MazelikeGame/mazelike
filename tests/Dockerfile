FROM node:8.11-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["/bin/ash", "/usr/src/app/runner.sh"]
CMD ["backend"]