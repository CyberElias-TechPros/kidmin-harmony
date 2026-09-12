# KidMin Harmony API (Cloudflare Worker)

This is the Cloudflare Workers backend for KidMin Harmony. It provides a REST
API backed by **D1** (SQLite) for structured data and **R2** for file/image
uploads. Auth uses signed JWT access tokens (HS256 only) and
PBKDF2-SHA256-hashed passwords with per-user salts (no external crypto
dependencies).

Security model (enforced server-side on every route):

- **Fail-closed auth.** If `JWT_SECRET` is missing or shorter than 16
  characters the Worker returns `503 Misconfigured` on auth-dependent routes
  instead of accepting weakly-signed tokens. Token signatures are compared in
  constant time; non-HS256 tokens are rejected before any verification work.
- **Default-deny CORS.** No `Access-Control-Allow-Origin` header is emitted
  for unknown origins (there is no wildcard fallback). Leave CORS unconfigured
  when Vercel proxies same-origin; set `ALLOWED_ORIGINS` only for a separate
  frontend origin.
- **Rate limiting.** 20 login attempts / 15 min and 10 registrations / hour
  per IP (in-memory; resets on Worker restart).
- **Validated uploads.** `/api/upload` accepts only `jpg/jpeg/png/webp/gif`
  (extension-based allowlist) up to 5 MB. The stored `Content-Type` is derived
  from the extension — the client-provided MIME type is never trusted. Objects
  are stored under unguessable keys (`uploads/<timestamp>-<uuid>`) and served
  from `/media/<key>` with immutable caching and strict security headers.
- **Role checks on every route.** Public self-registration can only create
  `parent` accounts. Partners are organizations managed by admins, not a
  data-access role.

The frontend (Vercel) calls `/api/*`. In production Vercel proxies `/api/*`
and `/media/*` to this Worker (see `vercel.json`), so no CORS is required. For
a fully separate origin, set `VITE_API_URL` to the Worker URL and configure
`ALLOWED_ORIGINS`.

## Local development

1. Install dependencies:

   ```bash
   cd worker
   npm install
   ```

2. Create `worker/.dev.vars` (not committed) from the example:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   It contains a local-only `JWT_SECRET` and `SEED_DEMO=true`.

3. Apply the D1 migrations locally:

   ```bash
   npm run db:migrate:local
   ```

4. Start the Worker (serves on http://127.0.0.1:8787):

   ```bash
   npm run dev
   ```

5. Seed the demo accounts (only enabled when `SEED_DEMO=true`):

   ```bash
   curl -X POST http://127.0.0.1:8787/api/auth/seed
   ```

   On a **fresh (empty) database** the seed may be called without
   authentication — that is the first-admin bootstrap. Once any user exists,
   the seed requires an admin token, and in production (where `SEED_DEMO` is
   not set) it is always `403`.

   Demo logins: `admin@church.org / admin123`, `teacher@church.org /
   teacher123`, `parent@church.org / parent123`. **Change these if you ever
   expose the database.**

From the repo root, run the frontend dev server:

```bash
npm run dev   # http://localhost:8080 → proxies /api to the Worker
```

## Testing

Unit tests (auth, helpers, rate limiting):

```bash
cd worker
npm test          # vitest
```

End-to-end smoke suite (62 checks: auth matrix, RBAC scoping, attendance,
events, lessons, upload security, headers, rate limiting). Start the local
Worker and, from the repo root:

```bash
bash scripts/smoke.sh          # targets http://127.0.0.1:8787 by default
```

The suite resets nothing — for a clean run, wipe local state and re-apply
migrations first:

```bash
cd worker
rm -rf .wrangler/state
npm run db:migrate:local
npm run dev &
```

## Deploying to Cloudflare

1. Login and create a D1 database:

   ```bash
   npx wrangler login
   npx wrangler d1 create kidmin-harmony-db
   ```

   Copy the `database_id` it prints into `wrangler.toml` (replace the
   `REPLACE_WITH_YOUR_D1_DATABASE_ID` placeholder).

2. Create an R2 bucket:

   ```bash
   npx wrangler r2 bucket create kidmin-harmony-media
   ```

3. Set the JWT secret (long random string, e.g. `openssl rand -hex 32`):

   ```bash
   npx wrangler secret put JWT_SECRET
   ```

4. Apply migrations to the remote database:

   ```bash
   npm run db:migrate:remote
   ```

5. Deploy:

   ```bash
   npm run deploy
   ```

   The Worker is then live at `https://kidmin-harmony-api.<your-subdomain>.workers.dev`.

## Production notes

- **Do not set `SEED_DEMO` in production.** The seed endpoint returns `403`
  whenever the variable is absent (it is not set in `wrangler.toml`).
- The first account on a production database is created by calling
  `/api/auth/seed` once right after deploying (users table empty), or by
  inserting a user row directly — thereafter the seed requires an admin token
  and registration creates parents only.
- `/api/upload` stores images in R2 under `uploads/...`; media are served from
  `/media/<key>` (public, unguessable keys).
- `ALLOWED_ORIGINS`: only needed if the frontend calls the Worker directly
  (separate origin). Comma-separated exact origins, e.g.
  `https://kidmin.vercel.app`. Wildcard `*` is not supported.
- `APP_TIMEZONE` (optional): IANA timezone for "today" (attendance sessions,
  event status). Defaults to UTC.

## Data model

Tables: `users`, `children`, `child_notes`, `attendance_sessions`,
`attendance_records`, `events`, `event_attendees`, `event_volunteers`,
`lessons`, `lesson_objectives`, `lesson_materials`, `lesson_activities`,
`partners`. See `migrations/0001_init.sql`.

`migrations/0002_unique_sessions.sql` deduplicates any pre-existing
`attendance_sessions` rows and adds a unique `(date, service_type)` index so
each service runs at most one attendance session per day.
