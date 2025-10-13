FROM node:22-alpine
RUN yarn config set registry "https://registry.npmmirror.com/" && yarn global add local-web-server
RUN mkdir /app
COPY .vitepress/dist /app/
WORKDIR /app
CMD ws --spa index.html -p 80