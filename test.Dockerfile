FROM node:8.11-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN sed 's/"bcrypt": "^3.0.0",//' -i package.json && npm install

COPY . .

CMD ["/bin/ash", "-c", "./node_modules/.bin/jasmine; echo $? > /app/runner-result"]
