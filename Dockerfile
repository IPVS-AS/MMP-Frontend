FROM nginx:1.13.3-alpine

## Remove default nginx website

RUN rm -rf /usr/share/nginx/html/*
RUN rm -rf /var/www/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder

COPY /dist/mmp-frontend /usr/share/nginx/html
COPY /dist/mmp-frontend /var/www/html
COPY /nginx-conf/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
