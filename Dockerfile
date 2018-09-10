FROM node:8.11

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY Frontend Frontend
COPY Backend Backend

EXPOSE 3000

CMD ["npm", "start"]
