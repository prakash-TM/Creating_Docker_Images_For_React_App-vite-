# Docker Image & Container - Quick Reference

This guide explains the basic Docker commands to download an image, create a container, start, stop, and remove containers.

---

## 1. Pull the Image

Download the image from Docker Hub.

```bash
docker pull prakashtm456/learn-docker:day2_react_app_docker_image_push
```

Check downloaded images:

```bash
docker images
```

---

## 2. Create and Run a Container

Create a container from the image and run it in the background.

```bash
docker run -d -p 3000:5173 --name react-app prakashtm456/learn-docker:day2_react_app_docker_image_push
```

### Command Breakdown

| Option             | Description                               |
| ------------------ | ----------------------------------------- |
| `docker run`       | Create and start a container              |
| `-d`               | Run in background (detached mode)         |
| `-p 3000:5173`     | Map host port 3000 to container port 5173 |
| `--name react-app` | Give the container a custom name          |

Open the application:

```text
http://localhost:3000
```

---

## 3. Check Running Containers

Show running containers:

```bash
docker ps
```

Show all containers (running and stopped):

```bash
docker ps -a
```

---

## 4. View Container Logs

View logs:

```bash
docker logs react-app
```

View logs continuously:

```bash
docker logs -f react-app
```

---

## 5. Stop a Container

Stop a running container:

```bash
docker stop react-app
```

---

## 6. Start a Stopped Container

Start the container again:

```bash
docker start react-app
```

---

## 7. Restart a Container

Restart the container:

```bash
docker restart react-app
```

---

## 8. Remove a Container

First stop the container:

```bash
docker stop react-app
```

Then remove it:

```bash
docker rm react-app
```

Force remove:

```bash
docker rm -f react-app
```

---

## 9. Remove an Image

Remove an image:

```bash
docker rmi prakashtm456/learn-docker:day2_react_app_docker_image_push
```

List images:

```bash
docker images
```

---

## Docker Workflow

```text
Docker Hub
    ↓
docker pull
    ↓
Image
    ↓
docker run
    ↓
Container
    ↓
localhost:3000
```

---

## Most Used Commands

```bash
# Pull image
docker pull IMAGE_NAME

# Run container
docker run -d -p 3000:3000 --name CONTAINER_NAME IMAGE_NAME

# Check running containers
docker ps

# Check all containers
docker ps -a

# View logs
docker logs CONTAINER_NAME

# Stop container
docker stop CONTAINER_NAME

# Start container
docker start CONTAINER_NAME

# Restart container
docker restart CONTAINER_NAME

# Remove container
docker rm CONTAINER_NAME

# Remove image
docker rmi IMAGE_NAME
```

## Example

```bash
docker pull prakashtm456/learn-docker:day2_react_app_docker_image_push

docker run -d -p 3000:3000 --name react-app \
prakashtm456/learn-docker:day2_react_app_docker_image_push

docker ps

docker stop react-app

docker start react-app

docker rm -f react-app
```
