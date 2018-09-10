FROM mazelike/backend

RUN npm install

CMD ["npm", "test"]
