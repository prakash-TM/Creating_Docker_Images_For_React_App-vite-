FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/Creating_Docker_Images_For_React_App-vite-

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]