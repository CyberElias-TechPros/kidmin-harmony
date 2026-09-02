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

4. Enable seeding for local dev. Either add `SEED_DEMO = "true"` to your
   `.dev.vars` or temporarily change the `[vars]` section in `wrangler.toml`.

5. Start the Worker (serves on http://127.0.0.1:8787):

   ```bash
   npm run dev
   ```

6. Seed the demo accounts:

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

- **Seeding disabled**: `SEED_DEMO` defaults to `"false"` in `wrangler.toml`.
  The `/api/auth/seed` endpoint is only available when explicitly enabled.
- The `/api/upload` route stores images in R2 under `uploads/...`. Media are
  served from `/media/...`.
- **Upload validation**: Only images (JPEG, PNG, GIF, WebP, SVG) and PDF files
  are accepted. Maximum file size is 10 MB.
- **Rate limiting**: Login (10 attempts/15 min/IP), registration (5/15 min/IP),
  and password reset (3/15 min/IP) endpoints are rate-limited.
- **CORS**: If the frontend calls the Worker directly (rather than through Vercel
  rewrites), set the `ALLOWED_ORIGINS` secret to the frontend's origin.
- **Password requirements**: Minimum 8 characters, maximum 128.
- **Audit logging**: All sensitive operations (login, logout, registration,
  user management, child CRUD, etc.) are logged to the `audit_logs` table.

## API Endpoints

### Auth
- `POST /api/auth/register` — Register (parents only)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/me` — Update profile
- `POST /api/auth/change-password` — Change password (authenticated)
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Complete password reset with token
- `POST /api/auth/logout` — Logout
- `POST /api/auth/seed` — Seed demo data (only when `SEED_DEMO=true`)

### Admin (admin role only)
- `GET /api/admin/users` — List all users
- `POST /api/admin/users` — Create a new user (any role)
- `PUT /api/admin/users/:id` — Update user name/role
- `DELETE /api/admin/users/:id` — Delete user
- `GET /api/admin/audit-logs` — View audit logs

### Children
- `GET /api/children` — List children (parents see only their own)
- `GET /api/children/:id` — Get child details
- `POST /api/children` — Register child (admin/teacher)
- `PUT /api/children/:id` — Update child
- `DELETE /api/children/:id` — Delete child (admin only)
- `POST /api/children/:id/notes` — Add note
- `DELETE /api/children/:id/notes/:noteId` — Delete note

### Attendance
- `GET /api/attendance` — List sessions
- `POST /api/attendance/sessions` — Create session
- `POST /api/attendance/checkin` — Check in child
- `GET /api/attendance/:id` — Get session details

### Events
- `GET /api/events` — List events (upcoming/past)
- `GET /api/events/:id` — Get event details
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event
- `POST /api/events/:id/attendees` — Register child for event
- `DELETE /api/events/:id/attendees/:childId` — Remove attendee
- `POST /api/events/:id/volunteers` — Add volunteer
- `DELETE /api/events/:id/volunteers/:volunteerId` — Remove volunteer

### Lessons
- `GET /api/lessons` — List lessons
- `GET /api/lessons/:id` — Get lesson details
- `POST /api/lessons` — Create lesson
- `PUT /api/lessons/:id` — Update lesson
- `DELETE /api/lessons/:id` — Delete lesson

### Partners (admin only)
- `GET /api/partners` — List partners
- `POST /api/partners` — Create partner
- `PUT /api/partners/:id` — Update partner
- `DELETE /api/partners/:id` — Delete partner

### Reports (admin/teacher)
- `GET /api/reports/summary` — Summary statistics
- `GET /api/reports/analytics` — Analytics data

### Files
- `POST /api/upload` — Upload file to R2
- `GET /media/:key` — Serve uploaded file

## Data model

Tables: `users`, `children`, `child_notes`, `attendance_sessions`,
`attendance_records`, `events`, `event_attendees`, `event_volunteers`,
`lessons`, `lesson_objectives`, `lesson_materials`, `lesson_activities`,
`partners`, `audit_logs`, `password_reset_tokens`.

See `migrations/0001_init.sql` and `migrations/0002_audit_and_passwords.sql`.
