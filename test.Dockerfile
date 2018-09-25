FROM node:8.11

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .eslintignore .eslintignore
COPY .eslintrc.js .eslintrc.js
COPY .env .env
COPY Frontend Frontend
COPY Backend Backend
COPY spec spec

CMD ["./node_modules/.bin/jasmine"]
