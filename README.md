# Daily Planner (frontend)

Next.js application. Backend (FastAPI, database, Ollama) is deployed separately.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Set `BACKEND_URL` in `.env` to the API base URL (default `http://127.0.0.1:8000`).

## Vercel

1. Import this repository; use the repository root as the project root if the repo contains only this app.
2. Environment variables:
   - **`NEXT_PUBLIC_API_URL`** — public HTTPS URL of the API (e.g. Tailscale Funnel to the API port).
   - **`BACKEND_URL`** — optional if all traffic uses `NEXT_PUBLIC_API_URL`.

Long-running requests (briefing, local LLM) should go directly to the API via `NEXT_PUBLIC_API_URL`, not through the Vercel rewrite proxy.

## Production build

```bash
npm run build
npm run start
```

## Push to a new remote

```bash
git remote add origin https://github.com/OWNER/REPO.git
git branch -M main
git push -u origin main
```

The `.env` file is listed in `.gitignore` and is not committed.
