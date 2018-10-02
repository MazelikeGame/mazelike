FROM node:8.11

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY test-inner.sh .
RUN chmod +x test-inner.sh
CMD ["/bin/bash", "/app/test-inner.sh"]
