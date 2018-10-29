FROM node:8.11

WORKDIR /app

# Chrome dependencies copied from https://hub.docker.com/r/geekykaran/headless-chrome-node-docker/~/dockerfile/
RUN apt-get update -y && \
    apt-get install ca-certificates \
      gconf-service \
      libasound2 \
      libatk1.0-0 \
      libatk1.0-0 \
      libdbus-1-3 \
      libgconf-2-4 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libx11-xcb1 \
      libxss1 \
      libxtst6 \
      fonts-liberation \
      libappindicator1 \
      xdg-utils \
      lsb-release \
      wget \
      curl \
      xz-utils -y --no-install-recommends && \
    apt-get clean autoclean && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install puppeteer@^1.9.0

COPY . .

CMD ["/bin/bash", "-c", "./node_modules/.bin/jasmine; echo $? > /app/runner-result"]
