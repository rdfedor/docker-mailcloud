FROM node:14-alpine

RUN apk add --update --virtual build-base libc-dev g++ make python-dev python3 sqlite sqlite-dev

RUN mkdir -p /usr/src/mail-manager

WORKDIR /usr/src/mail-manager

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "migrate-start"]
