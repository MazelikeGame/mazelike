FROM node:8.11

COPY package*.json ./
RUN npm install --production

COPY Backend .
COPY Frontend static

EXPOSE 3000

CMD ["npm", "start"]
