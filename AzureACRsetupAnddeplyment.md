# Azure Container Registry Deployment

yaml file - .github/workflows/deploy-app-to-azure-ACR.yaml

App url - http://react-app-docker-practice.azurewebsites.net/

## Architecture

```
BEFORE (Development):                  AFTER (Production):

GitHub push                            GitHub push
  → GitHub Actions                       → GitHub Actions
  → Docker Hub (public)                  → Azure Container Registry (private)
  → Azure Container Instance             → Azure App Service
                                           → Auto HTTPS ✓  Auto-restart ✓
```

---

## Prerequisites

- Azure subscription with an existing Resource Group
- Azure CLI installed and logged in (`az login`)
- GitHub repository with Docker-based React app
- Existing GitHub Actions workflow (ACI-based)

---

## Step 1 — Create Azure Container Registry (ACR)

ACR is your private Docker image registry inside Azure. Images never leave your Azure account.

### 1A — Register the ACR namespace (one-time, new subscriptions only)

```bash
az provider register --namespace Microsoft.ContainerRegistry

# Check status — wait until output shows "Registered"
az provider show --namespace Microsoft.ContainerRegistry --query registrationState
```

### 1B — Create the registry

```bash
# Linux / Mac:
az acr create \
  --resource-group MyResourceGroup \
  --name reactappcontainerregistry \
  --sku Basic \
  --admin-enabled true

# Windows CMD (single line):
az acr create --resource-group MyResourceGroup --name reactappcontainerregistry --sku Basic --admin-enabled true
```

> ⚠️ **ACR name rules:** lowercase only, no hyphens, 5–50 characters, globally unique.

### 1C — Verify ACR was created

```bash
az acr show --name reactappcontainerregistry --query loginServer
# Expected: "reactappcontainerregistry.azurecr.io"
```

### 1D — Get ACR credentials (save for GitHub Secrets)

```bash
az acr credential show --name reactappcontainerregistry

# Output:
# {
#   "username": "reactappcontainerregistry",
#   "passwords": [
#     { "name": "password",  "value": "xxxx" },
#     { "name": "password2", "value": "xxxx" }
#   ]
# }
#
# Copy: username + password (use the first one)
```

---

## Step 2 — Add GitHub Secrets

Go to: **Repository → Settings → Secrets and Variables → Actions → New repository secret**

| Secret Name         | Value                                              |
| ------------------- | -------------------------------------------------- |
| `ACR_LOGIN_SERVER`  | `reactappcontainerregistry.azurecr.io`             |
| `ACR_USERNAME`      | `reactappcontainerregistry` (from credential show) |
| `ACR_PASSWORD`      | password value from credential show                |
| `AZURE_WEBHOOK_URL` | obtained in Step 3D below                          |

> ℹ️ You can delete old Docker Hub secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`) after verifying the new pipeline works.

---

## Step 3 — Create Azure App Service

App Service replaces ACI. It provides automatic HTTPS, health checks, auto-restart, and deployment slots.

### 3A — Create App Service Plan (the underlying VM)

```bash

# Windows CMD:
az appservice plan create --name react-app-docker-practice-plan --resource-group MyResourceGroup --sku B1 --is-linux
```

> ⚠️ **Free tier (F1) does NOT support Docker containers.** Use B1 minimum (~$13/mo).
> ⚠️ **`--is-linux` is required** — without it a Windows plan is created and your Linux image won't run.

### 3B — Create the Web App

```bash

# Windows CMD (single line):
az webapp create --resource-group MyResourceGroup --plan react-app-docker-practice-plan --name react-app-docker-practice-pk --deployment-container-image-name reactappcontainerregistry.azurecr.io/react-app:latest --docker-registry-server-user reactappcontainerregistry --docker-registry-server-password YOUR_ACR_PASSWORD
```

> ℹ️ App name must be **globally unique**. Add your initials or a number (e.g. `-pk`) to ensure uniqueness.

### 3C — Configure container settings (if updating an existing app)

```bash
az webapp config container set \
  --name react-app-docker-practice-pk \
  --resource-group MyResourceGroup \
  --docker-custom-image-name reactappcontainerregistry.azurecr.io/react-app:latest \
  --docker-registry-server-url https://reactappcontainerregistry.azurecr.io \
  --docker-registry-server-user reactappcontainerregistry \
  --docker-registry-server-password YOUR_ACR_PASSWORD
```

```bash
az webapp config container set --name react-app-docker-practice --resource-group MyResourceGroup --docker-custom-image-name reactappcontainerregistory.azurecr.io/react-app:latest --docker-registry-server-url https://reactappcontainerregistory.azurecr.io --docker-registry-server-user reactappcontainerregistory --docker-registry-server-password xxxxxxxxxxxxxxxxxxxxx
```

### 3D — Enable Continuous Deployment & Get Webhook URL

```bash
az webapp deployment container config \
  --name react-app-docker-practice-pk \
  --resource-group MyResourceGroup \
  --enable-cd true

# Expected output:
# {
#   "CI_CD_URL": "https://$appname:TOKEN@react-app-docker-practice-pk.scm.azurewebsites.net/docker/hook",
#   "DOCKER_ENABLE_CI": true
# }
#
# ← Copy the CI_CD_URL → add it as AZURE_WEBHOOK_URL in GitHub Secrets
```

```bash
az webapp deployment container config --name react-app-docker-practice --resource-group MyResourceGroup --enable-cd true
```

> ℹ️ The webhook URL triggers App Service to pull the new `:latest` image from ACR and restart automatically.

---

## Step 4 — GitHub Actions Workflow

Replace your existing `.github/workflows/*.yml` with this:

```yaml
# .github/workflows/deploy.yml

name: Build and Deploy to Azure App Service

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout source code
      - name: Checkout code
        uses: actions/checkout@v3

      # 2. Login to private ACR
      - name: Login to Azure Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      # 3. Build and push image to ACR (two tags: latest + git SHA)
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.ACR_LOGIN_SERVER }}/react-app:latest
            ${{ secrets.ACR_LOGIN_SERVER }}/react-app:${{ github.sha }}

      # 4. Trigger App Service to pull new image and restart
      - name: Deploy to Azure App Service
        run: curl -X POST "${{ secrets.AZURE_WEBHOOK_URL }}"
```

**Why two image tags?**

- `:latest` — App Service always pulls this tag on deployment
- `:${{ github.sha }}` — git commit hash, one snapshot per deploy, enables rollback

---

## Step 5 — HTTPS (Automatic)

Once deployed, your app is live at:

```
https://react-app-docker-practice-pk.azurewebsites.net
```

```http://react-app-docker-practice.azurewebsites.net/

```

No Nginx config, no Certbot, no SSL certificate management — App Service handles everything automatically.

> ℹ️ For a custom domain (e.g. `myapp.com`): Azure Portal → App Service → Custom Domains → Add custom domain. HTTPS auto-provisioned there too.

---

## Verification Commands

```bash
# Check app is running
az webapp show --name react-app-docker-practice-pk --resource-group MyResourceGroup --query state
# Expected: "Running"

# Get your live URL
az webapp show --name react-app-docker-practice-pk --resource-group MyResourceGroup --query defaultHostName

# Stream live container logs
az webapp log tail --name react-app-docker-practice-pk --resource-group MyResourceGroup

# List images in your ACR
az acr repository list --name reactappcontainerregistry --output table

# See image tags (each git SHA = one deploy)
az acr repository show-tags --name reactappcontainerregistry --repository react-app --output table
```

---

## Rollback Strategy

Because every image is tagged with the git SHA, rolling back is simple:

```bash
# 1. Find the SHA of the last good deploy
az acr repository show-tags --name reactappcontainerregistry --repository react-app --output table

# 2. Re-tag the old image as :latest
az acr import \
  --name reactappcontainerregistry \
  --source reactappcontainerregistry.azurecr.io/react-app:GOOD_SHA_HERE \
  --image react-app:latest

# 3. Trigger App Service to pull the rolled-back image
curl -X POST "YOUR_AZURE_WEBHOOK_URL"
```

---

## Common Mistakes

| Mistake                             | Fix                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| ACR name has uppercase or hyphens   | Lowercase letters and numbers only: `reactappcontainerregistry`                              |
| Missing `--is-linux` on plan create | Without this, a Windows plan is created — Linux image won't run                              |
| Using Free tier (F1)                | F1 doesn't support Docker. Use B1 minimum                                                    |
| App container on wrong port         | App Service expects port 80. Nginx default is 80, so standard React Docker images are fine   |
| Multiline commands on Windows CMD   | CMD doesn't support `\` line continuation — run all flags on one line                        |
| ACR namespace not registered        | Run `az provider register --namespace Microsoft.ContainerRegistry` and wait for `Registered` |

---

## Complete GitHub Secrets Reference

| Secret Name         | Where to get it                                                              |
| ------------------- | ---------------------------------------------------------------------------- |
| `ACR_LOGIN_SERVER`  | `reactappcontainerregistry.azurecr.io`                                       |
| `ACR_USERNAME`      | `reactappcontainerregistry`                                                  |
| `ACR_PASSWORD`      | `az acr credential show --name reactappcontainerregistry`                    |
| `AZURE_WEBHOOK_URL` | `az webapp deployment container config --enable-cd true` → `CI_CD_URL` field |

---

## Final Architecture

```
Developer
  │
  │  git push origin main
  ▼
GitHub
  │
  │  triggers GitHub Actions workflow
  ▼
GitHub Actions Runner (ubuntu-latest)
  │  1. docker/login-action        → logs into ACR
  │  2. docker/build-push-action   → builds image, pushes :latest + :SHA
  │  3. curl POST webhook          → tells App Service to redeploy
  ▼
Azure Container Registry (reactappcontainerregistry.azurecr.io)
  │  stores your private Docker images
  │
  │  App Service pulls :latest on webhook trigger
  ▼
Azure App Service (react-app-docker-practice-pk)
  │  runs your React container
  │  auto HTTPS ✓  health checks ✓  auto-restart ✓
  ▼
http://react-app-docker-practice.azurewebsites.net/  ✓ LIVE
```
