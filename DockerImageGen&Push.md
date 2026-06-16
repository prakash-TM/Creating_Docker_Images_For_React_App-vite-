# React Vite App - Docker Image Creation & Push to Docker Hub

## Overview

This project demonstrates how to create a Docker image for a React Vite application using a multi-stage Docker build and publish the image to Docker Hub.

## Files Created

### Dockerfile

```dockerfile
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

CMD ["serve", "-s", "dist", "-l", "5173"]
```

### .dockerignore

```text
node_modules
dist
.git
.gitignore
Dockerfile
README.md
.vscode
.env
.env.*
```

## Build Docker Image

```bash
docker build --no-cache -t day2_react_app .
```

## Run Docker Container

```bash
docker run -p 5173:5173 day2_react_app:latest
```

Application URL:

```text
http://localhost:5173
```

## Push Image to Docker Hub

### Tag the Image

```bash
docker tag day2_react_app:latest prakashtm456/learn-docker:day2_react_app_docker_image_push
```

### Push the Image

```bash
docker push prakashtm456/learn-docker:day2_react_app_docker_image_push
```

## Docker Hub Image

Repository:
`prakashtm456/learn-docker`

Image Tag:
`day2_react_app_docker_image_push`

## Learning Outcomes

- Created a multi-stage Docker build for a React Vite application.
- Reduced image size by separating build and runtime stages.
- Used `.dockerignore` to optimize build context.
- Served static files using the `serve` package.
- Tagged and pushed Docker images to Docker Hub.
- Verified container execution locally using Docker.
