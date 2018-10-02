FROM mazelike/backend:devel

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x test-inner.sh
CMD ["/bin/bash", "/app/test-inner.sh"]
