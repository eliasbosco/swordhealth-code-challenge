FROM node:14.17.6-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY package-lock.json ./

#Install NPM packages
RUN npm ci --silent
RUN npm i --save-dev sequelize-cli
RUN npm i --save-dev nyc
RUN npm i -g env-cmd

# Bundle app source
COPY . .

EXPOSE 8080

# Add docker-compose-wait tool -------------------
RUN chmod +x helpers/wait

CMD [ "sh", "-c", "./helpers/wait && npm run test-docker && npm run migrate-docker && npm run start-docker" ]