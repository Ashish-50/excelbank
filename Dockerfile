FROM node:18
WORKDIR /api
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3003
CMD [ "npm", "run","dev" ]