FROM mazelike/backend:devel

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .eslintignore .eslintignore
COPY .eslintrc.js .eslintrc.js
COPY .env .env
COPY Frontend Frontend
COPY Backend Backend
COPY spec spec

CMD npm run eslint && ./node_modules/.bin/jasmine
