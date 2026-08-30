# HeartReset — Frontend

React + Vite + Tailwind frontend for HeartReset. Talks to the `heartreset-backend` API.

## Setup

```bash
npm install
cp .env.example .env
```

By default it points at `http://localhost:5000/api` — edit `.env` if your backend runs elsewhere.
You can also change the API URL live from the app: click the ⚙️ gear icon on the home page.

## Run

Make sure `heartreset-backend` is running first (`npm run dev` in that project, with MongoDB connected), then:

```bash
npm run dev
```

Opens on `http://localhost:5173`. Make sure the backend's `.env` has:

```
CLIENT_ORIGIN=http://localhost:5173
```

so CORS allows requests from here.

## Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploying to Vercel

Vite apps deploy to Vercel with zero configuration.

### Via CLI

```bash
npm i -g vercel
vercel login
vercel            # preview deploy
vercel --prod      # production deploy
```

### Via the dashboard

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. [Import it on Vercel](https://vercel.com/new) — it auto-detects Vite.
3. Add an **Environment Variable**: `VITE_API_URL` = your deployed backend URL + `/api` (e.g. `https://heartreset-backend.vercel.app/api`).
   - Environment variables are only baked in at *build* time for Vite, so set this before deploying — not after.
4. Deploy.

Once live, go back to your **backend's** Vercel project and set its `CLIENT_ORIGIN` env var to this frontend's URL (e.g. `https://heartreset.vercel.app`), then redeploy the backend so CORS allows it.

You can also skip the env var and just use the ⚙️ gear icon on the deployed app's home page to point it at any API URL at runtime.

## Notes

- Auth tokens are kept in React state only (no `localStorage`/`sessionStorage`), so refreshing the page logs you out. For a persistent session, add a small server-side session or a secure httpOnly cookie flow on the backend.
- Register creates a real user in MongoDB via the backend, auto-creates a starting Heart Status, and seeds the 10-day challenge program on first visit to Challenges.
