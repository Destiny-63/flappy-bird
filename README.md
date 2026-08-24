# Flappy Bird (HKUST Red)

Browser Flappy Bird–style game. Play locally or on GitHub Pages.

## Play locally

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

This repo deploys automatically when you push to `main` (see `.github/workflows/deploy-pages.yml`).

Public URL (after first successful deploy):

`https://<your-github-username>.github.io/flappy-bird/`

### One-time setup

1. Create a public GitHub repo named **`flappy-bird`**
2. Push this project to `main`
3. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. Wait for the Actions workflow to finish

No custom domain required.
