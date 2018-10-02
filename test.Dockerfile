FROM node:8.11

WORKDIR /app

RUN npm i -g npm

COPY package*.json ./
RUN npm ci

COPY test-inner.sh .
RUN chmod +x test-inner.sh
CMD ["/bin/bash", "/app/test-inner.sh"]
