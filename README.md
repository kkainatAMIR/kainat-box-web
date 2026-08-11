# Kainat Box Makers Website

A premium, responsive packaging-manufacturer website built with React and Vite.

## Included

- Responsive home, shop, product detail, quote, services, about, journal, article, testimonials, contact, legal and checkout pages
- Interactive 3D pointer-responsive hero and motion effects with reduced-motion support
- Search, category/material filters and sorting
- Persistent cart with MOQ-aware quantities and a complete order-review flow
- Three-step custom quote form with artwork upload UI
- Contact and newsletter forms
- Floating WhatsApp integration
- Dynamic page titles, descriptions, canonical URLs and Product/Article JSON-LD
- Organization/LocalBusiness JSON-LD, `robots.txt`, and `sitemap.xml`
- Local, optimized WebP product imagery (no runtime image CDN dependency)
- Accessible labels, keyboard-friendly controls and mobile navigation

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Configure before launch

1. Replace the placeholder business details in `BRAND` at the top of `src/main.jsx`.
2. Replace `kainatboxmakers.com` in `index.html`, `src/main.jsx`, `public/robots.txt`, and `public/sitemap.xml` with the final domain.
3. Update product pricing, tax, freight and product specifications in `src/main.jsx`.
4. Copy `.env.example` to `.env` and set `VITE_FORMS_ENDPOINT` to a secure form endpoint (Formspree, Make, Zapier, or your serverless API). In demo mode, submissions are retained in browser localStorage.
5. Replace social-media placeholder links in the footer.
6. Confirm any certifications and compliance claims before publishing.
7. Connect checkout to a server-side payment integration before accepting card payments. The included checkout intentionally supports order capture / bank transfer / COD only; secret payment keys must never be placed in frontend code.

## Deployment note

This is a client-side app using history routing. Configure the host to rewrite all non-file routes to `/index.html` (Netlify/Vercel/Cloudflare Pages can do this with a standard SPA fallback).

For high-volume commerce or editorial teams, the product/post arrays can be replaced with Shopify, WooCommerce, Sanity, Strapi or another CMS without changing the page design.
