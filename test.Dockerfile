FROM mazelike/backend:devel

WORKDIR /app

RUN npm install

COPY . .

CMD npm run eslint && ./node_modules/.bin/jasmine
