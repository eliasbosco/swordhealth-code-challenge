FROM node:14.17.6-alpine as build

WORKDIR /app
RUN apk add g++ make python util-linux

RUN mkdir -p /usr/share/nginx/html

COPY . .
RUN rm -fr node_modules

RUN npm ci --slient
RUN npm i parcel --save-dev
RUN rm -fr .parcel-cache
RUN rm -fr dist
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]