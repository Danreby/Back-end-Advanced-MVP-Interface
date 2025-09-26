FROM node:20.19.0-bullseye-slim

WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true
ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci --silent

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
