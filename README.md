# KidMin Harmony

A children's ministry management app: register and manage children, track
attendance (QR + manual check-in), plan events, build a curriculum, administer
ministry partners and view reports.

**Stack**

- **Frontend** — React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui +
  TanStack Query + React Router. Deployed to **Vercel**.
- **Backend** — Cloudflare **Workers** + **D1** (SQLite) + **R2** (files).
  Deployed to **Cloudflare**.

## Layout

```
.
├── src/                 # React frontend (Vercel)
│   └── services/api/    # API client + React Query hooks
├── worker/              # Cloudflare Worker backend (D1 + R2)
│   ├── migrations/      # D1 SQL migrations
│   ├── src/index.ts     # Hono API
│   └── tests/           # vitest unit tests
├── scripts/smoke.sh     # 62-check E2E smoke suite (vs local worker)
├── vercel.json          # SPA routing + /api proxy to the Worker
└── .env.example         # example environment variables
```

## Run locally (full stack)

Backend (terminal 1):

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars   # set JWT_SECRET (see worker/README.md)
npm run db:migrate:local
npm run dev                       # http://127.0.0.1:8787
```

Seed demo accounts (once; requires `SEED_DEMO=true` in `worker/.dev.vars`):

```bash
curl -X POST http://127.0.0.1:8787/api/auth/seed
```

On a fresh database the seed works unauthenticated (first-admin bootstrap).
Once any user exists it requires an admin token. In production the endpoint
is disabled entirely unless `SEED_DEMO` is set.

Frontend (terminal 2, from repo root):

```bash
npm install
npm run dev                       # http://localhost:8080 (proxies /api)
```

Demo logins: `admin@church.org / admin123`, `teacher@church.org / teacher123`,
`parent@church.org / parent123`.

Or use the one-click demo buttons on the login page.

## Testing

```bash
# Worker unit tests (auth, helpers, rate limiting)
cd worker && npm test && cd ..

# Frontend
npm run build        # production bundle
npx tsc --noEmit     # typecheck
npm run lint         # eslint (0 errors)

# End-to-end smoke suite — with the local Worker running (see above):
bash scripts/smoke.sh
```

## Deploying

### Backend → Cloudflare

Follow `worker/README.md`: create the D1 database and R2 bucket, set
`JWT_SECRET`, run the migrations, then `npm run deploy`. Disable `SEED_DEMO` in
production.

### Frontend → Vercel

1. Import the repo into Vercel (framework: Vite).
2. Set the `WORKER_URL` environment variable to your deployed Worker's host
   (e.g. `kidmin-harmony-api.your-subdomain.workers.dev`). Vercel rewrites
   `/api/*` and `/media/*` to it, so the frontend needs no other config and
   there are no CORS issues.
   - Alternatively, unset `WORKER_URL` and instead set `VITE_API_URL` to the
     full Worker URL (e.g. `https://...workers.dev`) and add your Vercel origin
     to the Worker's `ALLOWED_ORIGINS`.

## Environment variables

See `.env.example`.

## Roles & access

- **admin** — full access (children, attendance, events, lessons, partners, reports).
- **teacher** — children, attendance, events, lessons, reports.
- **volunteer / cellLeader** — children, attendance (check-in).
- **parent** — sees only their registered children, can view curriculum and
  register their children for events.

> **Security:** Public self-registration is restricted to **parents** only. Staff
> and admin accounts (teacher, volunteer, cell leader, partner) hold access to
> children's sensitive data and must be provisioned by an administrator — they
> cannot be created through the sign-up form or the `/api/auth/register` endpoint.
>
> Additional protections, enforced server-side: role checks on every route,
> PBKDF2-hashed passwords with constant-time verification, HS256-only JWTs
> (fail-closed 503 if the signing secret is missing/weak), per-IP rate
> limiting on login and registration, default-deny CORS, upload type
> allowlisting (stored content type derived from the extension), and strict
> security headers on all responses including `/media/*`.
