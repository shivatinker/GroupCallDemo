FROM node:16-alpine as frontend
WORKDIR /app/

ENV PATH /app/node_modules/.bin:$PATH

COPY ./ ./

RUN yarn install

RUN yarn build

FROM nginx:stable-alpine
COPY --from=frontend /app/build /usr/share/nginx/html
COPY config/nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
