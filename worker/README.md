# KidMin Harmony API (Cloudflare Worker)

This is the Cloudflare Workers backend for KidMin Harmony. It provides a REST
API backed by **D1** (SQLite) for structured data and **R2** for file/image
uploads. Auth uses signed JWT access tokens (HS256) and PBKDF2-hashed passwords
(no external crypto dependencies).

The frontend (Vercel) calls `/api/*`. In production Vercel proxies `/api/*` and
`/media/*` to this Worker (see `vercel.json`), so no CORS is required. For a
fully separate origin you can instead set `VITE_API_URL` to the Worker URL and
configure `ALLOWED_ORIGINS`.

## Local development

1. Install dependencies:

   ```bash
   cd worker
   npm install
   ```

2. Create `worker/.dev.vars` with a JWT secret (not committed):

   ```
   JWT_SECRET=local-dev-secret-change-me
   ```

3. Apply the D1 migrations locally:

   ```bash
   npm run db:migrate:local
   ```

4. Start the Worker (serves on http://127.0.0.1:8787):

   ```bash
   npm run dev
   ```

5. Seed the demo accounts (only enabled when `SEED_DEMO=true`, which the
   local `wrangler.toml` sets):

   ```bash
   curl -X POST http://127.0.0.1:8787/api/auth/seed
   ```

   Demo logins: `admin@church.org / admin123`, `teacher@church.org / teacher123`,
   `parent@church.org / parent123`.

From the repo root, run the frontend dev server:

```bash
npm run dev   # http://localhost:8080 → proxies /api to the Worker
```

## Deploying to Cloudflare

1. Login and create a D1 database:

   ```bash
   npx wrangler login
   npx wrangler d1 create kidmin-harmony-db
   ```

   Copy the `database_id` it prints into `wrangler.toml`.

2. Create an R2 bucket:

   ```bash
   npx wrangler r2 bucket create kidmin-harmony-media
   ```

3. Set the JWT secret:

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

- Disable seeding in production: remove/override `SEED_DEMO` in `wrangler.toml`
  (the `[vars]` block) or set it to `false` via your Wrangler settings.
- The `/api/upload` route stores images in R2 under `uploads/...`. Media are
  served from `/media/...`.
- `CORS`: if the frontend calls the Worker directly (rather than through Vercel
  rewrites), set the `ALLOWED_ORIGINS` secret to the frontend's origin.

## Data model

Tables: `users`, `children`, `child_notes`, `attendance_sessions`,
`attendance_records`, `events`, `event_attendees`, `event_volunteers`,
`lessons`, `lesson_objectives`, `lesson_materials`, `lesson_activities`,
`partners`. See `migrations/0001_init.sql`.
