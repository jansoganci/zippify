# backend/Dockerfile
FROM node:18

WORKDIR /app

WORKDIR /app

COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json
RUN npm install

COPY backend/. .

CMD ["npm", "run", "dev:backend"]