FROM zenika/alpine-chrome:with-node

WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
COPY package*.json ./
RUN npm install

COPY browser-ci.js .
COPY runner.sh .

ENTRYPOINT []
CMD []