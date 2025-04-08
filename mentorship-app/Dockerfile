FROM node:20-alpine

WORKDIR /front

COPY package*.json ./

RUN npm i --force

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "run", "dev"]
