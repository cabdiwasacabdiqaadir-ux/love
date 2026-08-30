# HeartReset — Backend API

Node.js / Express / MongoDB backend for the HeartReset emotional recovery app.
Matches the frontend in `HeartReset.jsx` — same data shapes for Heart, Mood, Journal, and Challenges.

## Stack

Express, MongoDB + Mongoose, JWT auth, bcryptjs password hashing.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- **MONGO_URI** — a local MongoDB (`mongodb://127.0.0.1:27017/heartreset`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster URI.
- **JWT_SECRET** — generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- **CLIENT_ORIGIN** — the URL your frontend runs on (e.g. `http://localhost:5173`).

Run it:

```bash
npm run dev     # with nodemon, auto-restarts on changes
npm start        # plain node
```

Server starts on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

## Project structure

```
server/
├── controllers/     business logic for each resource
├── models/          Mongoose schemas (User, Heart, Mood, Journal, Challenge)
├── routes/          Express routers, mounted under /api/*
├── middleware/       JWT auth guard + centralized error handling
├── config/db.js      MongoDB connection
└── server.js         app entry point
```

## Auth flow

1. `POST /api/auth/register` → hashes the password with bcrypt, creates the user, auto-creates a starting `Heart` document (status `BROKEN`), returns a JWT.
2. `POST /api/auth/login` → verifies credentials, returns a JWT.
3. Every other route requires `Authorization: Bearer <token>`. The `protect` middleware verifies the token and attaches `req.user`.
4. Every resource (Heart, Mood, Journal, Challenge) is scoped to `req.user._id` — one user can never read or edit another user's data.

## API reference

### Auth
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password, confirmPassword }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/auth/profile` | ✓ | — |

### Heart status (one per user)
| Method | Route | Body |
|---|---|---|
| POST | `/api/heart` | `{ status, reason, recoveryPercentage }` |
| GET | `/api/heart` | — |
| PUT | `/api/heart` | any of the fields above (upserts if missing) |
| DELETE | `/api/heart` | — |

### Mood
| Method | Route | Body |
|---|---|---|
| POST | `/api/mood` | `{ mood, note, date? }` — mood is one of `happy, good, okay, sad, heartbroken` |
| GET | `/api/mood` | — |
| PUT | `/api/mood/:id` | `{ mood?, note?, date? }` |
| DELETE | `/api/mood/:id` | — |

### Journal
| Method | Route | Body |
|---|---|---|
| POST | `/api/journal` | `{ title, content }` |
| GET | `/api/journal` | — |
| GET | `/api/journal/:id` | — |
| PUT | `/api/journal/:id` | `{ title?, content? }` |
| DELETE | `/api/journal/:id` | — |

### Challenges
`GET /api/challenges` auto-seeds the default 10-day program for a new user the first time it's called.

| Method | Route | Body |
|---|---|---|
| GET | `/api/challenges` | — |
| POST | `/api/challenges` | `{ day, title, description? }` |
| PUT | `/api/challenges/:id` | `{ title?, description?, completed? }` |
| DELETE | `/api/challenges/:id` | — |

All routes above require `Authorization: Bearer <token>`.

## Deploying to Vercel

This project is set up to deploy on Vercel with zero extra config — the root `index.js` re-exports the Express app the way Vercel expects, and `server/config/db.js` caches the MongoDB connection across warm invocations (required for serverless).

### Via CLI

```bash
npm i -g vercel
vercel login
vercel            # first run: link/create the project, deploys a preview
vercel --prod      # promote to production
```

### Via the Vercel dashboard

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. [Import it on Vercel](https://vercel.com/new) — it auto-detects Node.js/Express.
3. Before the first deploy, add these **Environment Variables** (Project Settings → Environment Variables):
   - `MONGO_URI` — your MongoDB Atlas connection string (a real Atlas cluster, not `localhost` — Vercel's servers can't reach your machine).
   - `JWT_SECRET` — a long random string.
   - `JWT_EXPIRES_IN` — e.g. `7d`.
   - `CLIENT_ORIGIN` — your deployed frontend's URL (e.g. `https://heartreset.vercel.app`). Add multiple, comma-separated, if you also want to allow `http://localhost:5173` for local testing.
4. Deploy. Vercel builds your whole Express app into a single [Vercel Function](https://vercel.com/docs/functions).

### Important notes for serverless

- **Use MongoDB Atlas** (or another cloud MongoDB), not a local database — Vercel Functions can't reach `localhost`. Atlas has a free tier.
- In Atlas Network Access, allow access from anywhere (`0.0.0.0/0`), since Vercel Functions run from many different IPs.
- The connection is cached per warm function instance (`global._mongooseConn` in `db.js`), so most requests reuse an existing connection instead of opening a new one — this is the standard pattern for Mongoose on serverless.
- `/api/health` and unmatched routes never touch the database, so they stay fast and don't fail if the DB is briefly unreachable.

After deploying, your API will be live at something like `https://your-project.vercel.app/api/...` — use that as `VITE_API_URL` in the frontend.

## Connecting the React frontend

In `HeartReset.jsx`, replace the mock `useState` data with calls to this API using `axios`, e.g.:

```js
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Note: artifacts can't use localStorage — use real React state or a cookie in production
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

On register/login, store the returned `token` and `user`, then fetch `/heart`, `/mood`, `/journal`, `/challenges` to populate the dashboard.

## Testing notes

This project was verified with a live smoke test (register → login → protected routes → Heart/Mood/Journal/Challenge CRUD → 401/404/409 error paths) against a running MongoDB instance before delivery. Route wiring, validation, and auth middleware all passed.
