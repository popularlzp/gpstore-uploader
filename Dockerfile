FROM node:14

WORKDIR /src

COPY package*.json ./

RUN npm install

RUN npm install googleapis

COPY . .

CMD [ "npm", "start" ]
