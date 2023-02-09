# Stage 1 - Angular Build
# as build-step
FROM node:12.16.2 as build-step

RUN mkdir -p /swim-ui

WORKDIR /swim-ui

# COPY package.json /swim-ui

COPY . /swim-ui

# package json for docker setup
# RUN mv /swim-ui/package.json.dc /swim-ui/package.json

# install the angular cli
RUN npm install -g  @angular/cli@~11.2.1

# Optional - To serve in development mode
# EXPOSE 4200

# install package dependencies
RUN npm install

# Optional - To serve in development mode
# CMD ng serve --host 0.0.0.0

# set staging environment settings to production
RUN mv /swim-ui/src/environments/environment.stage.ts /swim-ui/src/environments/environment.prod.ts

# Build the production bundles in english and spanish
RUN npm run build:client-bundles-i18n

# Stage 2 - Host with NGINX
FROM nginx:1.17.1-alpine as serve-step

# Copy the english build of the app to 'en' folder on server
COPY --from=build-step /swim-ui/dist/en/en-us /usr/share/nginx/html/en

# Copy the spanish build of the app to 'es' folder on server
COPY --from=build-step /swim-ui/dist/es/es-mx /usr/share/nginx/html/es

# Multi-language page setup on nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# set port to host
EXPOSE 80

