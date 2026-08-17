# Kainat Box Makers — KAB Commerce

A customized full-stack packaging website for Kainat Box Makers. The React storefront and Express API share one deployable project, with persistent Neon PostgreSQL accounts, secure sessions, synchronized wishlists and saved customer data — deployable to Vercel as a single project.

## What is included

### Storefront

- Responsive home, catalog, product detail, wishlist, account, quote, services, about, journal, testimonials, contact, legal and checkout pages
- KAB-branded product imagery with three selectable studio views for every product range
- Heart-shaped wishlist controls on product cards and product detail pages
- Search, category/material filters, sorting and MOQ-aware cart quantities
- Persistent guest cart and wishlist with automatic account merge after login
- Three-step custom quote form with optional artwork upload
- Checkout for order capture, bank transfer or cash-on-delivery review
- Dynamic metadata and Product/Article JSON-LD
- Accessible labels, keyboard-friendly controls and responsive navigation

### Account and API

- Signup, login and logout using HTTP-only 30-day session cookies
- Password hashing with salted Node `crypto.scrypt`
- Persistent Neon PostgreSQL users, sessions, wishlists, cart/profile data and submissions
- SQL migrations in `db/migrations` with `npm run migrate` (idempotent, tracked in `schema_migrations`)
- Vercel-ready: same Express app runs as one Serverless Function (`api/index.js`)
- Customer dashboard with editable profile, saved boxes and enquiry/order history
- Authenticated forms are automatically associated with the customer account
- Optional SMTP delivery for quote, order and contact notifications
- Production serving for the compiled Vite SPA

## Requirements

- Node.js 18 or newer
- npm
- A Neon PostgreSQL database (free tier is fine — see [NEON.md](NEON.md) for setup)

## Local development

```bash
npm install
cp .env.example .env
# paste your Neon connection string into DATABASE_URL in .env, then:
npm run migrate
npm run dev
```

This starts:

- Storefront: `http://localhost:5173`
- API: `http://localhost:4000`

Vite proxies relative `/api` requests to the API, so authentication cookies work without exposing a separate browser-facing backend URL.

## Deploying to Vercel

1. Push this repository to GitHub and import it in Vercel (**Add New → Project**).
2. Vercel auto-detects Vite. Leave framework settings as-is; `vercel.json` already
   routes `/api/*` to the `api/index.js` Serverless Function and serves the SPA fallback.
3. Add the environment variable **`DATABASE_URL`** (your Neon *pooled* connection string)
   under **Project → Settings → Environment Variables** for Production, Preview and
   Development. Optionally add the SMTP variables.
4. Apply the schema once per database: `npm run migrate` locally against the same
   `DATABASE_URL` (see [NEON.md](NEON.md)), then redeploy.

## Traditional Node hosting

```bash
npm install
npm run build
NODE_ENV=production npm start
```

`server.js` applies pending migrations on boot, then Express serves both `/api/*`
and the compiled `dist` SPA on `PORT` (default `4000`). Set `SKIP_BOOT_MIGRATIONS=true`
to manage migrations only via `npm run migrate`.

## Environment

Copy `.env.example` to `.env` and configure as needed:

- `PORT` — Express port for `npm start`, default `4000` (Vercel does not use this)
- `DATABASE_URL` — Neon PostgreSQL connection string. Use the pooled (`-pooler`) endpoint on Vercel
- `DATABASE_SSL` / `DATABASE_SSL_STRICT` / `DATABASE_POOL_MAX` — optional overrides for local/self-hosted Postgres
- `SKIP_BOOT_MIGRATIONS` — set `true` to opt out of boot-time migrations in `server.js`
- `COOKIE_SECURE` — set to `true` behind production HTTPS (automatic on Vercel)
- `VITE_API_URL` — optional API origin; leave blank for a same-origin production deployment
- `VITE_FORMS_ENDPOINT` — optional override for form delivery; normally leave blank to use `/api/forms`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` — optional email notification settings

If SMTP is not configured, every form is still persisted in PostgreSQL and available in the authenticated customer's project history.

## API overview

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health and database status |
| `POST` | `/api/auth/signup` | Create an account and session |
| `POST` | `/api/auth/login` | Start a session |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/auth/me` | Restore the current user and wishlist |
| `GET/PUT` | `/api/account/data` | Read/write persisted cart and profile data |
| `POST` | `/api/account/profile` | Update the account name |
| `GET` | `/api/account/submissions` | Read project and order history |
| `PUT` | `/api/wishlist/:productId` | Add/remove a wishlist item |
| `POST` | `/api/forms` | Persist forms and optionally email them |

## Before launch

1. Replace placeholder business details in `BRAND` at the top of `src/main.jsx`.
2. Replace `kainatboxmakers.com` in `index.html`, `src/main.jsx`, `public/robots.txt` and `public/sitemap.xml` with the final domain.
3. Verify product pricing, freight, tax and specifications.
4. Set production `DATABASE_URL` (Neon pooled string) in Vercel, run `npm run migrate`, HTTPS and secure cookies.
5. Configure SMTP and real social-media links.
6. Confirm certification and compliance claims.
7. Add a server-side payment provider before accepting card payments; no secret payment keys belong in frontend code.

Legacy SQLite files and temporary uploads are excluded from Git. On Vercel, artwork
uploads use the function's `/tmp` directory and are forwarded by email only — the
submission record itself always persists in the database.
