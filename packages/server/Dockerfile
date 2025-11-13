FROM node:22-alpine
WORKDIR /app

COPY ./ /app
COPY ./node_modules /dist
COPY ./package.json /dist

RUN ["ls", "-la"]

CMD ["node", "--max-http-header-size", "163840", "./dist/index.js"]
EXPOSE 3000