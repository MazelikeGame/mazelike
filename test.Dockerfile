FROM node:8.11

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["/bin/bash", "-c", "./node_modules/.bin/jasmine; echo $? > /app/runner-result"]
