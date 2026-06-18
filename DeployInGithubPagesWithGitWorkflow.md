# Deploy React App to GitHub Pages

A guide to automatically build and deploy a Vite React app to GitHub Pages using GitHub Actions.

---

## Step 1 — Update `vite.config.ts`

Add the `base` option with your **exact repository name**:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/your-repo-name/", // replace with your actual repo name
});
```

> Without this, CSS and JS assets won't load correctly on GitHub Pages.

---

## Step 2 — Create the GitHub Actions Workflow

Create the file `.github/workflows/deploy-app-to-git-pages.yaml`:

```yaml
name: Deploy React App to GitHub Pages

on:
  push:
    branches:
      - main # auto triggers on every push to main
  workflow_dispatch: # allows manual trigger from Actions tab

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write # required to push to gh-pages branch

    steps:
      - name: Checkout
        uses: actions/checkout@v4.2.2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Install dependencies
        run: npm install

      - name: Build React app
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> `GITHUB_TOKEN` is automatically provided by GitHub — no setup needed.

---

## Step 3 — Push to Main

Commit and push your changes:

```bash
git add .
git commit -m "add github pages deployment workflow"
git push origin main
```

This will trigger the workflow automatically.

---

## Step 4 — Verify the Workflow Ran

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. Check `Deploy React App to GitHub Pages` — all steps should be green ✅
4. A new branch called `gh-pages` will be created automatically

---

## Step 5 — Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Click **Save**

---

## Step 6 — Access Your App

After 1-2 minutes, your app will be live at:

```
https://prakash-tm.github.io/Creating_Docker_Images_For_React_App-vite-/
```

---

## How It Works

```
Push to main
     ↓
GitHub Actions triggers
     ↓
npm install → npm run build → dist/ folder created
     ↓
peaceiris/actions-gh-pages pushes dist/ to gh-pages branch
     ↓
GitHub Pages serves the app from gh-pages branch
     ↓
App is live 🚀
```

---

## Branch Structure

| Branch     | Purpose                                      |
| ---------- | -------------------------------------------- |
| `main`     | Your source code (React, configs, workflows) |
| `gh-pages` | Built static files served by GitHub Pages    |

---

## Notes

- Every push to `main` will automatically redeploy the app
- No need to manually build or upload files
- `GITHUB_TOKEN` is auto-generated per workflow run — no secrets to configure
