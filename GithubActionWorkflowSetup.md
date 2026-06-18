# GitHub Actions Workflow - Build & Push Docker Image to Docker Hub

This guide explains how to automatically build and push a Docker image to Docker Hub using GitHub Actions.

## Reference

Video Tutorial:
https://youtu.be/x7f9x30W_dI?si=McffLNKBcyj85yqY

---

# Overview

Instead of manually running:

```bash
docker build -t image-name .
docker push image-name
```

GitHub Actions can automatically:

1. Checkout the source code
2. Build the Docker image
3. Login to Docker Hub
4. Push the image to Docker Hub

Workflow:

```text
GitHub Repository
       ↓
GitHub Actions Workflow
       ↓
Build Docker Image
       ↓
Login to Docker Hub
       ↓
Push Image to Docker Hub
```

---

# Step 1 - Create Workflow File

Create the following file:

```text
.github/workflows/build-docker.yaml
```

---

# Step 2 - Add Workflow Configuration

Add the following content to `build-docker.yaml`:

```yaml
name: Build and Publish Image to Docker Hub

on:
  workflow_dispatch:

jobs:
  publish_images:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4.2.2

      - name: Login to Docker Hub
        uses: docker/login-action@v3.4.0
        with:
          username: prakashtm456
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Build Docker Image
        run: docker build -t prakashtm456/learn-docker:react-app-latest .

      - name: Push Docker Image
        run: docker push prakashtm456/learn-docker:react-app-latest
```

---

# Step 3 - Create Docker Hub Access Token

1. Login to Docker Hub.
2. Go to:

```text
Account Settings
    → Personal Access Tokens
    → Generate New Token
```

3. Generate a new token.
4. Copy and save the token securely.

---

# Step 4 - Add Secret to GitHub

Open your GitHub repository:

```text
Repository
    → Settings
    → Secrets and Variables
    → Actions
    → New Repository Secret
```

Create the following secret:

| Secret Name      | Value                   |
| ---------------- | ----------------------- |
| DOCKER_HUB_TOKEN | Docker Hub Access Token |

Save the secret.

---

# Step 5 - Push Changes to GitHub

```bash
git add .
git commit -m "Added GitHub Actions workflow"
git push origin main
```

---

# Step 6 - Run the Workflow

1. Open your GitHub repository.
2. Click **Actions**.
3. Select **Build and Publish Image to Docker Hub**.
4. Click **Run Workflow**.
5. Select the branch.
6. Click **Run Workflow**.

GitHub Actions will:

- Checkout the repository
- Login to Docker Hub
- Build the Docker image
- Push the image to Docker Hub

---

# Workflow Explanation

## 1. Workflow Name

```yaml
name: Build and Publish Image to Docker Hub
```

This is the name displayed in the GitHub Actions tab.

---

## 2. Triggers

### Manual Trigger

```yaml
on: [workflow_dispatch]
```

This allows the workflow to be started manually from GitHub Actions.

Without clicking **Run Workflow**, nothing will happen.

---

### Auto Trigger — Any change pushed to `main`

```yaml
on:
  push:
    branches:
      - main
```

Automatically runs the workflow whenever code is pushed or merged into the `main` branch.

---

### Auto Trigger — Specific files or folders only

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "src/**" # triggers if anything inside src/ changes
      - "Dockerfile" # triggers if Dockerfile changes
```

Only runs the workflow when the specified files or folders are modified.
Pushes that only change `README.md`, docs, or other unrelated files will be **ignored**.

---

### Combined — Manual + Auto

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "src/**"
      - "Dockerfile"
  workflow_dispatch:
```

Runs automatically on relevant changes **and** can still be triggered manually anytime.

---

## 3. Job Definition

```yaml
jobs:
  publish_images:
```

A job is a collection of steps executed together.

---

## 4. Runner

```yaml
runs-on: ubuntu-latest
```

GitHub creates a temporary Ubuntu machine and runs all commands on it.

---

## 5. Checkout Repository

```yaml
uses: actions/checkout@v4.2.2
```

Downloads the repository source code into the runner.

Equivalent concept:

```bash
git clone <repository-url>
```

---

## 6. Login to Docker Hub

```yaml
uses: docker/login-action@v3.4.0
```

Authenticates GitHub Actions with Docker Hub.

```yaml
with:
  username: prakashtm456
  password: ${{ secrets.DOCKER_HUB_TOKEN }}
```

The password is securely read from GitHub Secrets.

---

## 7. Build Docker Image

```yaml
docker build -t prakashtm456/learn-docker:react-app-latest .
```

### Command Breakdown

```bash
docker build
```

Builds a Docker image.

```bash
-t
```

Assigns a tag to the image.

```bash
prakashtm456/learn-docker
```

Docker Hub repository name.

```bash
react-app-latest
```

Image tag/version.

```bash
.
```

Current directory containing the Dockerfile.

---

## 8. Push Docker Image

```yaml
docker push prakashtm456/learn-docker:react-app-latest
```

Uploads the image to Docker Hub.

Anyone can now pull the image using:

```bash
docker pull prakashtm456/learn-docker:react-app-latest
```

---

# Current Limitation

Current workflow:

```yaml
on:
  workflow_dispatch:
```

The workflow only runs when manually triggered.

---

# Recommended Improvement

Automatically build and push whenever code is merged into the `main` branch.

```yaml
on:
  push:
    branches:
      - main
```

New flow:

```text
Developer Pushes Code
          ↓
GitHub Actions Triggered
          ↓
Build Docker Image
          ↓
Push to Docker Hub
```

No manual action required.

---

# Useful Docker Commands

## Pull Image

```bash
docker pull prakashtm456/learn-docker:react-app-latest
```

## Create and Run Container

```bash
docker run -d -p 3000:3000 --name react-app prakashtm456/learn-docker:react-app-latest
```

## View Running Containers

```bash
docker ps
```

## View All Containers

```bash
docker ps -a
```

## Stop Container

```bash
docker stop react-app
```

## Start Container

```bash
docker start react-app
```

## Remove Container

```bash
docker rm react-app
```

---

# Summary

Successfully implemented a GitHub Actions CI/CD pipeline that:

- Checks out source code
- Logs into Docker Hub securely
- Builds a Docker image
- Pushes the image to Docker Hub
- Supports manual execution from GitHub Actions

## Next Learning Steps

1. Trigger workflow automatically on every push to `main`.
2. Add image versioning using Git commit SHA or release tags.
3. Deploy automatically to:
   - AWS EC2
   - Azure VM
   - DigitalOcean Droplet
   - Ubuntu VPS

4. Add automated tests before building the Docker image.
5. Learn complete CI/CD pipelines for production deployments.
