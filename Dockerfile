FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM node:latest as production-stage
WORKDIR /app
COPY --from=build-stage /app ./
CMD ["npm", "run", "start"]