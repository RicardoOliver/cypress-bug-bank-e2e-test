FROM node:24-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY app ./app
EXPOSE 3000
CMD ["node", "app/index.js"]
