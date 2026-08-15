# Kainat Box Makers — KAB Commerce

A customized full-stack packaging website for Kainat Box Makers. The React storefront and Express API share one deployable project, with persistent SQLite accounts, secure sessions, synchronized wishlists and saved customer data.

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
- Persistent SQLite users, sessions, wishlists, cart/profile data and submissions
- Customer dashboard with editable profile, saved boxes and enquiry/order history
- Authenticated forms are automatically associated with the customer account
- Optional SMTP delivery for quote, order and contact notifications
- Production serving for the compiled Vite SPA

## Requirements

- Node.js 22.5 or newer (the API uses Node's built-in `node:sqlite` module)
- npm

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

This starts:

- Storefront: `http://localhost:5173`
- API: `http://localhost:4000`

Vite proxies relative `/api` requests to the API, so authentication cookies work without exposing a separate browser-facing backend URL.

## Production

```bash
npm install
npm run build
NODE_ENV=production npm start
```

Express serves both `/api/*` and the compiled `dist` SPA on `PORT` (default `4000`). The deployment must provide a persistent writable volume for `DATABASE_PATH` so customer data survives restarts and releases.

## Environment

Copy `.env.example` to `.env` and configure as needed:

- `PORT` — Express port, default `4000`
- `DATABASE_PATH` — SQLite database file, default `data/kainat.db`
- `COOKIE_SECURE` — set to `true` behind production HTTPS
- `VITE_API_URL` — optional API origin; leave blank for a same-origin production deployment
- `VITE_FORMS_ENDPOINT` — optional override for form delivery; normally leave blank to use `/api/forms`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` — optional email notification settings

If SMTP is not configured, every form is still persisted in SQLite and available in the authenticated customer's project history.

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
4. Set a persistent production `DATABASE_PATH`, HTTPS and secure cookies.
5. Configure SMTP and real social-media links.
6. Confirm certification and compliance claims.
7. Add a server-side payment provider before accepting card payments; no secret payment keys belong in frontend code.

SQLite database, WAL/SHM files and temporary uploads are excluded from Git.
