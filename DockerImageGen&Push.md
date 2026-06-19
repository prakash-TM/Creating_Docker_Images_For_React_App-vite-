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

## Changes Made to Dockerfile

### What Changed and Why

The original Dockerfile was built with a hardcoded `base` URL (`/Creating_Docker_Images_For_React_App-vite-/`)
in `vite.config.ts`, which was required for GitHub Pages deployment. When the same image was run locally
via Docker, the app failed to load because the browser expected assets at that subpath, but Nginx/serve
was serving from root `/`.

To fix this, the following changes were made:

---

### 1. `vite.config.ts` — Dynamic Base URL

**Before:**

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/Creating_Docker_Images_For_React_App-vite-/",
});
```

**After:**

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || "/",
});
```

**Why:** Instead of hardcoding the base URL, it now reads from an environment variable `VITE_BASE_URL`.

- GitHub Pages build → env var is set to `/Creating_Docker_Images_For_React_App-vite-/`
- Docker build → env var is not set → defaults to `/`

---

### 2. GitHub Pages Workflow — Pass Env Var at Build Time

Added `VITE_BASE_URL` environment variable to the build step:

```yaml
- name: Build React app
  run: npm run build
  env:
    VITE_BASE_URL: "/Creating_Docker_Images_For_React_App-vite-/"
```

**Why:** Vite bakes the base URL into the static files at build time. The GitHub Pages
workflow now explicitly passes the correct subpath during its build.

---

### Updated Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

---

### How to Run the Docker Image Locally

```bash
# Pull the image
docker pull prakashtm456/learn-docker:react-app-latest

# Run the container
docker run -d -p 3000:5173 --name react-app prakashtm456/learn-docker:react-app-latest
# -d          = run in background
# -p 3000:5173 = map host port 5173 → container port 3000
# --name      = assign a name to the container

# Open in browser
http://localhost:3000
```
