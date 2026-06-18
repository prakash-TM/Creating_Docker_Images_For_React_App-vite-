FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "dist", "-l", "5173", "--single", "--base", "/Creating_Docker_Images_For_React_App-vite-/"]