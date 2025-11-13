FROM node:22-alpine
WORKDIR /app

COPY ./ /app
COPY /app/node_modules /app/dist/node_modules

RUN ["ls", "-la"]

CMD ["node", "--max-http-header-size", "163840", "./dist/index.js"]
EXPOSE 3000