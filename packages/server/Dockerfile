FROM node:22-alpine

RUN ["ls", "-la"]

COPY ./ /app

COPY /app/node_modules /app/dist

WORKDIR /app

RUN ["ls", "-la"]

CMD ["node", "--max-http-header-size", "163840", "./dist/index.js"]
EXPOSE 3000