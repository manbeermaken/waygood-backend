FROM node:24-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run seed

RUN npm run build

EXPOSE 4000

CMD sh -c "npm run seed && node ./dist/server.js"



