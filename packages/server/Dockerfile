FROM node:22-alpine
WORKDIR /app

COPY ./packages/server /app

CMD ["node", "--max-http-header-size", "163840", "./dist/index.js"]
EXPOSE 3000