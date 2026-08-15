# Neon PostgreSQL Setup Guide

This project uses **Neon** (serverless PostgreSQL) and is configured to deploy on **Vercel**.
Everything the app needs to talk to the database is a single environment variable: `DATABASE_URL`.

---

## What the app needs to connect (checklist)

| # | Thing | Where it comes from |
|---|-------|---------------------|
| 1 | A Neon account + project + database | neon.tech dashboard (free tier is fine) |
| 2 | The **pooled connection string** (`-pooler` host) | Neon dashboard → your project → **Connect** |
| 3 | `DATABASE_URL` environment variable set **locally** in `.env` | paste the pooled string |
| 4 | `DATABASE_URL` set in **Vercel** env vars | Vercel → Project → Settings → Environment Variables |
| 5 | The `pg` Node.js driver | already added to `package.json` (`npm install`) |
| 6 | Schema applied once via migrations | `npm run migrate` (uses `db/migrations/*.sql`, tracked in the `schema_migrations` table) |

No IP allow-listing, SSH tunnels, or extra services are required — Neon accepts secure TLS
connections from anywhere, and the `pg` driver handles `sslmode=require` automatically
(this repo parses `DATABASE_URL` itself so Neon's `channel_binding=require` parameter,
which the Node driver doesn't support, never causes errors).

---

## Step 1 — Create the Neon project

1. Go to **https://neon.tech** and sign up (free, GitHub/Google/email login).
2. Click **Create project** (or **New Project**).
3. Fill in:
   - **Project name:** e.g. `kainat-box`
   - **Postgres version:** keep the default (latest, e.g. 16/17)
   - **Region:** pick the region closest to your Vercel deployment
     (e.g. `AWS US East 1 (N. Virginia)` matches Vercel's default `iad1`)
   - **Database name:** e.g. `kainatdb`
4. Click **Create project**. Neon provisions the database in a few seconds.

## Step 2 — Copy the connection string

On the project dashboard click **Connect** (or the **Connection Details** panel):

1. Toggle **Pooled connection** **ON** ⚠️ *important for Vercel/serverless* — the host
   will contain `-pooler`, e.g.:
   ```
   postgresql://kainatdb_owner:AbCdEf123456@ep-fragrant-sky-a1b2c3d4-pooler.us-east-1.aws.neon.tech/kainatdb?sslmode=require
   ```
2. Copy it. Treat it like a password — **never commit it to Git and never put it in a
   `VITE_` variable** (it must never reach the browser).

> The pooled endpoint multiplexes many short-lived serverless connections over
> PgBouncer. A serverless function that opens a fresh connection per request would
> otherwise exhaust Neon's connection limit. (The non-pooled endpoint also works for
> local development if you prefer.)

## Step 3 — Connect locally and run migrations

```bash
cp .env.example .env
# edit .env and set:
# DATABASE_URL="postgresql://kainatdb_owner:...@...-pooler...neon.tech/kainatdb?sslmode=require"

npm install        # installs the pg driver (already listed in package.json)
npm run migrate    # creates users/sessions/wishlists/account_data/submissions
npm run dev        # storefront on :5173, API on :4000
```

Expected migration output:

```
[migrate] Applying 001_init.sql (7 statements)…
[migrate] 001_init.sql applied.
[migrate] Done — 1 migration(s) applied.
```

Re-running `npm run migrate` is safe — applied files are recorded in the
`schema_migrations` table and skipped.

## Step 4 — Deploy to Vercel

1. Push to GitHub, then in Vercel: **Add New → Project → Import** this repository.
2. Vercel auto-detects **Vite**; `vercel.json` (already in the repo) handles:
   - build: `npm run build` → static SPA in `dist/`
   - all `/api/*` requests → Serverless Function `api/index.js` (the same Express app)
   - all other paths → `index.html` fallback (the app uses history-based routing)
3. **Before the first deploy finishes**, add the env var:
   - **Project → Settings → Environment Variables → Add**
   - Key: `DATABASE_URL` — Value: the pooled Neon string
   - Environments: **Production**, **Preview**, **Development**
   - (Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` for quote/order emails)
4. Click **Deploy** (or **Redeploy** after adding variables).
5. Run the schema migration once against the production database — from your machine
   with the same pooled string in `.env`:
   ```bash
   npm run migrate
   ```
6. Verify: `https://<your-app>.vercel.app/api/health` should return
   `{"ok":true,"service":"kainat-commerce-api","database":"connected"}`.

**Alternative:** Neon's official **Vercel integration** (Neon dashboard → Integrations,
or the Vercel Marketplace) can connect the two accounts and will inject `DATABASE_URL`
automatically — including per-branch databases for preview deploys. The manual env-var
approach above is the simplest and is all that's required.

---

## How it fits together in this repo

```
┌─ browser ─ React SPA (dist/ served by Vercel CDN)
│      │  fetch('/api/...', credentials:'include')   ← same-origin session cookie
├─ /api/* ─ vercel.json rewrite ─ api/index.js ─ Express app (app.js)
│      │  HTTP-only cookie auth, scrypt passwords, wishlists, account data, forms
├─ db/index.js ─ pg Pool from DATABASE_URL (TLS on; small pool - Neon pooler multiplexes)
├─ db/migrate.js ─ applies db/migrations/*.sql once per file (schema_migrations table)
└─ Neon PostgreSQL ─── persistent, serverless, branches, autoscaling
```

* Local dev (`npm run dev`): `server.js` runs the same `app.js` and applies pending
  migrations at boot (disable with `SKIP_BOOT_MIGRATIONS=true` if you prefer manual only).
* Vercel: serverless functions must not run migrations per cold start, so the function
  entry (`api/index.js`) only serves requests — run `npm run migrate` once per change.

## Notes & troubleshooting

- **`DATABASE_URL is not set`** — create `.env` from `.env.example`, paste the pooled string.
- **`ECONNREFUSED`/`ENOTFOUND` locally** — check the host contains `-pooler` and your network allows outbound 5432; Neon works over standard TLS.
- **Free-tier suspension** — Neon suspends idle computes; the first request after sleep can take ~1 s extra (auto-wake). The app uses a 10 s connect timeout, so it tolerates this.
- **Adding tables later** — create `db/migrations/002_your_change.sql`, run `npm run migrate`.
- **Old SQLite data** — the switch creates a fresh schema on Neon; previously registered
  local SQLite accounts don't carry over (export/import manually if you ever need that).
