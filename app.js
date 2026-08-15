import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { query, one, all } from './db/index.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const rootDir = process.cwd();
// Vercel's deployment filesystem is read-only outside /tmp.
const uploadDir = process.env.UPLOAD_DIR
  || (process.env.VERCEL ? path.join(os.tmpdir(), 'kab-uploads') : path.join(rootDir, 'uploads'));
const scryptAsync = promisify(crypto.scrypt);
const SESSION_DAYS = 30;

try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.warn(`[uploads] Could not prepare upload directory ${uploadDir}: ${error.message}`);
}

// Express 4 does not forward async handler rejections on its own — wrap them.
const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 100, parts: 101 },
  fileFilter: (_req, file, callback) => {
    const allowed = /\.(pdf|ai|eps|jpe?g|png)$/i.test(file.originalname || '');
    callback(allowed ? null : new Error('Artwork must be a PDF, AI, EPS, JPG or PNG file.'), allowed);
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    return [key, decodeURIComponent(value)];
  }));
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function passwordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function passwordMatches(password, stored) {
  const [salt, storedHex] = String(stored).split(':');
  if (!salt || !storedHex) return false;
  const hash = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(storedHex, 'hex');
  return expected.length === hash.length && crypto.timingSafeEqual(expected, hash);
}

function publicUser(row) {
  return row ? { id: row.id, name: row.name, email: row.email, createdAt: row.created_at } : null;
}

async function sessionUser(req) {
  const token = parseCookies(req).kab_session;
  if (!token) return null;
  return one(`
    SELECT users.id, users.name, users.email, users.created_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = $1 AND sessions.expires_at > $2
  `, [tokenHash(token), new Date().toISOString()]);
}

const requireUser = asyncRoute(async (req, res, next) => {
  const user = await sessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Please log in to continue.' });
  req.user = user;
  next();
});

async function setSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await query('DELETE FROM sessions WHERE expires_at <= $1', [new Date().toISOString()]);
  await query('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash(token), expires.toISOString()]);
  const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  res.cookie('kab_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: SESSION_DAYS * 86400000,
    path: '/',
  });
}

async function clearSession(req, res) {
  const token = parseCookies(req).kab_session;
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)]);
  res.clearCookie('kab_session', { httpOnly: true, sameSite: 'lax', path: '/' });
}

async function wishlistFor(userId) {
  const rows = await all('SELECT product_id FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(row => row.product_id);
}

// jsonb columns come back parsed from PostgreSQL; accept strings too so the
// helper stays tolerant of plain-text payloads.
function safeJSON(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'kainat-commerce-api', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ ok: false, service: 'kainat-commerce-api', database: 'unavailable' });
  }
}));

app.post('/api/auth/signup', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || name.length > 80) return res.status(400).json({ ok: false, error: 'Enter your full name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
  const hashed = await passwordHash(password);
  let userId;
  try {
    const created = await one(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashed]
    );
    userId = created.id;
  } catch (error) {
    // 23505 = unique_violation (email already registered)
    if (error.code === '23505') return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    console.error('Signup error:', error);
    return res.status(500).json({ ok: false, error: 'Account creation failed. Please try again.' });
  }
  await query('INSERT INTO account_data (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId]);
  await setSession(req, res, userId);
  const user = await one('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
  res.status(201).json({ ok: true, user: publicUser(user), wishlist: [] });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await one('SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1', [email]);
    if (!user || !(await passwordMatches(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Email or password is incorrect.' });
    }
    await setSession(req, res, user.id);
    res.json({ ok: true, user: publicUser(user), wishlist: await wishlistFor(user.id) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
}));

app.post('/api/auth/logout', asyncRoute(async (req, res) => {
  await clearSession(req, res);
  res.json({ ok: true });
}));

app.get('/api/auth/me', asyncRoute(async (req, res) => {
  const user = await sessionUser(req);
  if (!user) return res.status(401).json({ ok: false, user: null });
  res.json({ ok: true, user: publicUser(user), wishlist: await wishlistFor(user.id) });
}));

app.get('/api/account/data', requireUser, asyncRoute(async (req, res) => {
  const row = await one('SELECT cart_json, profile_json, updated_at FROM account_data WHERE user_id = $1', [req.user.id]);
  res.json({
    ok: true,
    cart: safeJSON(row?.cart_json, []),
    profile: safeJSON(row?.profile_json, {}),
    updatedAt: row?.updated_at || null,
  });
}));

app.put('/api/account/data', requireUser, asyncRoute(async (req, res) => {
  const cart = Array.isArray(req.body.cart) ? req.body.cart.slice(0, 100) : [];
  const profile = req.body.profile && typeof req.body.profile === 'object' && !Array.isArray(req.body.profile) ? req.body.profile : {};
  const serialized = JSON.stringify({ cart, profile });
  if (serialized.length > 200000) return res.status(413).json({ ok: false, error: 'Account data is too large.' });
  await query(`
    INSERT INTO account_data (user_id, cart_json, profile_json, updated_at)
    VALUES ($1, $2::jsonb, $3::jsonb, now())
    ON CONFLICT (user_id) DO UPDATE SET cart_json = excluded.cart_json, profile_json = excluded.profile_json, updated_at = now()
  `, [req.user.id, JSON.stringify(cart), JSON.stringify(profile)]);
  res.json({ ok: true, savedAt: new Date().toISOString() });
}));

app.put('/api/wishlist/:productId', requireUser, asyncRoute(async (req, res) => {
  const productId = String(req.params.productId || '');
  if (!/^[a-z0-9-]{1,100}$/.test(productId)) return res.status(400).json({ ok: false, error: 'Invalid product.' });
  const active = req.body.active !== false;
  if (active) {
    await query('INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, productId]);
  } else {
    await query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
  }
  res.json({ ok: true, wishlist: await wishlistFor(req.user.id) });
}));

app.post('/api/account/profile', requireUser, asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80) return res.status(400).json({ ok: false, error: 'Enter your full name.' });
  await query('UPDATE users SET name = $1, updated_at = now() WHERE id = $2', [name, req.user.id]);
  const user = await one('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
  res.json({ ok: true, user: publicUser(user) });
}));

app.get('/api/account/submissions', requireUser, asyncRoute(async (req, res) => {
  const rows = await all(`
    SELECT id, form_type, payload_json, artwork_name, created_at
    FROM submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30
  `, [req.user.id]);
  const submissions = rows.map(row => ({
    id: row.id,
    type: row.form_type,
    payload: safeJSON(row.payload_json, {}),
    artworkName: row.artwork_name,
    createdAt: row.created_at,
  }));
  res.json({ ok: true, submissions });
}));

app.post('/api/forms', upload.single('artwork'), asyncRoute(async (req, res) => {
  try {
    const payload = { ...req.body };
    const formType = String(payload.formType || 'contact').slice(0, 40);
    const createdAt = payload.createdAt || new Date().toISOString();
    const user = await sessionUser(req);

    await query(
      'INSERT INTO submissions (user_id, form_type, payload_json, artwork_name, created_at) VALUES ($1, $2, $3::jsonb, $4, $5)',
      [user?.id || null, formType, JSON.stringify(payload), req.file?.originalname || null, createdAt]
    );

    const rows = Object.entries(payload)
      .filter(([key]) => key !== 'artwork' && key !== 'formType' && key !== 'createdAt')
      .map(([key, value]) => `<tr><th style="text-align:left; padding:8px 10px; border-bottom:1px solid #eee;">${escapeHTML(key)}</th><td style="padding:8px 10px; border-bottom:1px solid #eee;">${escapeHTML(value || '-')}</td></tr>`)
      .join('');

    const attachment = req.file ? [{ filename: req.file.originalname, path: req.file.path }] : [];
    const subject = formType === 'quotes'
      ? 'New packaging quote request'
      : formType === 'contacts'
        ? 'New website enquiry'
        : formType === 'orders'
          ? 'New order from website'
          : 'Website form submission';

    const html = `<div style="font-family:Arial,sans-serif; color:#1f1f1f; line-height:1.6;"><h2 style="margin-bottom:12px;">${subject}</h2><p><strong>Form type:</strong> ${escapeHTML(formType)}</p><p><strong>Received:</strong> ${escapeHTML(createdAt)}</p><table style="width:100%; border-collapse:collapse; margin-top:12px; background:#faf8f5;">${rows}</table></div>`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_TO) {
      await mailTransport.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.MAIL_TO,
        replyTo: payload.email || process.env.SMTP_USER,
        subject,
        html,
        attachments: attachment,
      });
    } else {
      console.log(`[${createdAt}] Saved ${formType} submission #${user?.id ? ` for user ${user.id}` : ''}`);
    }

    res.status(200).json({ ok: true, message: 'Submission received and saved' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ ok: false, error: 'Form submission failed' });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
}));

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError || error?.message?.startsWith('Artwork must be')) {
    return res.status(400).json({ ok: false, error: error.code === 'LIMIT_FILE_SIZE' ? 'Artwork must be 10MB or smaller.' : error.message });
  }
  next(error);
});

const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'API route not found.' }));

// Central async-error fallback: keep the API's JSON error shape everywhere.
app.use('/api', (error, _req, res, _next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ ok: false, error: 'Unexpected server error.' });
});

export default app;
