# Azure Container Instances Deployment

yaml file - .github/workflows/deploy-app-to-azure-ACI.yaml

App url - http://learn-docker-with-prakashtm456.centralindia.azurecontainer.io/

## Overview

```
Docker Hub Image → GitHub Actions → Azure Container Instances → Public URL
```

---

## Step 1 — Create Azure Account

Sign up at https://azure.microsoft.com/free — includes $200 free credit for 30 days.

---

## Step 2 — Install Azure CLI

```bash
# Windows (run PowerShell as Admin)
winget install Microsoft.AzureCLI

# Verify installation
az --version

# Login to your Azure account (opens browser)
az login
```

---

## Step 3 — Create Resource Group

```bash
az group create --name "MyResourceGroup" --location "centralindia"
# --name     = your resource group name
# --location = Azure datacenter region

# Check all available locations
az account list-locations --output table
```

---

## Step 4 — Get Subscription ID

```bash
az account show --query id --output tsv
```

---

## Step 5 — Create Service Principal

GitHub Actions uses this identity to authenticate with Azure.

```bash
az ad sp create-for-rbac \
  --name "MyServicePrincipalsForDockerPractice" \
  --role Contributor \
  --scopes "/subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/MyResourceGroup" \
  --json-auth
# --name   = friendly name for this identity
# --role   = Contributor allows create/update/delete resources
# --scopes = limits access to your resource group only (security best practice)
```

Copy the entire JSON output:

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Step 6 — Add GitHub Secrets

Go to: GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

| Secret Name            | Value                             |
| ---------------------- | --------------------------------- |
| `AZURE_CREDENTIALS`    | The entire JSON block from Step 5 |
| `AZURE_RESOURCE_GROUP` | `MyResourceGroup`                 |

---

## Step 7 — GitHub Actions Workflow

`.github/workflows/deploy-to-azure.yml`

```yaml
name: Deploy to Azure Container Instances

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4.2.2

      - name: Log in to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Container Instances
        uses: azure/aci-deploy@v1
        with:
          resource-group: ${{ secrets.AZURE_RESOURCE_GROUP }}
          dns-name-label: learn-docker-with-prakashtm456
          # Must be globally unique across all Azure users
          image: prakashtm456/learn-docker:react-app-latest
          name: react-app-container
          location: centralindia
          ports: 3000
          protocol: TCP
```

---

## Step 8 — View in Azure Portal

1. Go to https://portal.azure.com
2. Search `react-app-container` in the top search bar
3. Click Container Instances result → **Overview**
4. Find **FQDN** — that is your public URL

> Portal shows the domain without port. Always append `:3000` in the browser manually.

---

## Live URL

```
http://learn-docker-with-prakashtm456.centralindia.azurecontainer.io:3000
```

---

## DNS Label — How to Pick a Unique Name

Azure DNS labels are public and shared globally across all Azure users — must be unique.

```bash
# Check availability by pinging
ping learn-docker-with-prakashtm456.centralindia.azurecontainer.io
# No response = available ✅
# Response    = taken ❌
```

**Naming tip:** Always include your username — it's already unique to you.

```
learn-docker-with-prakashtm456   ✅
learn-docker                     ❌ likely taken
```

# Why We Changed the Azure Deployment Trigger

## Before

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

## The Problem

All 3 workflows triggered simultaneously on `git push`:

```
git push
   ↓
   ├── deploy-github-pages.yml  → starts immediately
   ├── build-docker.yml         → starts immediately (building new image...)
   └── deploy-to-azure.yml      → starts immediately ❌
                                   pulls OLD image from Docker Hub
                                   because build isn't done yet!
```

ACI was deploying the **previous image** from Docker Hub — not the one just built.

---

## After

```yaml
on:
  workflow_dispatch:
  workflow_run:
    workflows:
      - "Build and publish the images to Docker Hub"
    types:
      - completed
```

## How It Works Now

```
git push
   ↓
   ├── deploy-github-pages.yml  → runs independently ✅
   │
   └── build-docker.yml         → runs first
              ↓ on success
         deploy-to-azure.yml    → triggers automatically ✅
                                   pulls the NEW image guaranteed
```

## Why `workflow_dispatch` is Still Kept

`workflow_run` only fires automatically after the Docker build. Without `workflow_dispatch`,
there is no way to manually trigger the Azure deployment from the GitHub Actions UI —
useful when you want to redeploy without pushing new code.

## The `if` Condition Fix

When manually triggered via `workflow_dispatch`, there is no `workflow_run` event — so the
success check must be skipped for manual runs:

```yaml
if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}
# manual trigger → skips the check ✅
# auto trigger   → only deploys if Docker build succeeded ✅
```
