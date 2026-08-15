import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { DatabaseSync } from 'node:sqlite';

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
const PORT = Number(process.env.PORT || 4000);
const rootDir = process.cwd();
const uploadDir = path.join(rootDir, 'uploads');
const dataDir = path.join(rootDir, 'data');
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'kainat.db');
const scryptAsync = promisify(crypto.scrypt);
const SESSION_DAYS = 30;

for (const dir of [uploadDir, dataDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS wishlists (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
  );
  CREATE TABLE IF NOT EXISTS account_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    cart_json TEXT NOT NULL DEFAULT '[]',
    profile_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    form_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    artwork_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
  CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id, created_at DESC);
`);

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

function sessionUser(req) {
  const token = parseCookies(req).kab_session;
  if (!token) return null;
  const row = db.prepare(`
    SELECT users.id, users.name, users.email, users.created_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString());
  return row || null;
}

function requireUser(req, res, next) {
  const user = sessionUser(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Please log in to continue.' });
  req.user = user;
  next();
}

function setSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .run(userId, tokenHash(token), expires.toISOString());
  const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  res.cookie('kab_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: SESSION_DAYS * 86400000,
    path: '/',
  });
}

function clearSession(req, res) {
  const token = parseCookies(req).kab_session;
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token));
  res.clearCookie('kab_session', { httpOnly: true, sameSite: 'lax', path: '/' });
}

function wishlistFor(userId) {
  return db.prepare('SELECT product_id FROM wishlists WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId).map(row => row.product_id);
}

function safeJSON(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kainat-commerce-api', database: 'connected' });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 80) return res.status(400).json({ ok: false, error: 'Enter your full name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
    const hashed = await passwordHash(password);
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hashed);
    const userId = Number(result.lastInsertRowid);
    db.prepare('INSERT INTO account_data (user_id) VALUES (?)').run(userId);
    setSession(req, res, userId);
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userId);
    res.status(201).json({ ok: true, user: publicUser(user), wishlist: [] });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    console.error('Signup error:', error);
    res.status(500).json({ ok: false, error: 'Account creation failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = db.prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?').get(email);
    if (!user || !(await passwordMatches(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Email or password is incorrect.' });
    }
    setSession(req, res, user.id);
    res.json({ ok: true, user: publicUser(user), wishlist: wishlistFor(user.id) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = sessionUser(req);
  if (!user) return res.status(401).json({ ok: false, user: null });
  res.json({ ok: true, user: publicUser(user), wishlist: wishlistFor(user.id) });
});

app.get('/api/account/data', requireUser, (req, res) => {
  const row = db.prepare('SELECT cart_json, profile_json, updated_at FROM account_data WHERE user_id = ?').get(req.user.id);
  res.json({
    ok: true,
    cart: safeJSON(row?.cart_json, []),
    profile: safeJSON(row?.profile_json, {}),
    updatedAt: row?.updated_at || null,
  });
});

app.put('/api/account/data', requireUser, (req, res) => {
  const cart = Array.isArray(req.body.cart) ? req.body.cart.slice(0, 100) : [];
  const profile = req.body.profile && typeof req.body.profile === 'object' && !Array.isArray(req.body.profile) ? req.body.profile : {};
  const serialized = JSON.stringify({ cart, profile });
  if (serialized.length > 200000) return res.status(413).json({ ok: false, error: 'Account data is too large.' });
  db.prepare(`
    INSERT INTO account_data (user_id, cart_json, profile_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET cart_json = excluded.cart_json, profile_json = excluded.profile_json, updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, JSON.stringify(cart), JSON.stringify(profile));
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.put('/api/wishlist/:productId', requireUser, (req, res) => {
  const productId = String(req.params.productId || '');
  if (!/^[a-z0-9-]{1,100}$/.test(productId)) return res.status(400).json({ ok: false, error: 'Invalid product.' });
  const active = req.body.active !== false;
  if (active) db.prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
  else db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
  res.json({ ok: true, wishlist: wishlistFor(req.user.id) });
});

app.post('/api/account/profile', requireUser, (req, res) => {
  const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80) return res.status(400).json({ ok: false, error: 'Enter your full name.' });
  db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, req.user.id);
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ ok: true, user: publicUser(user) });
});

app.get('/api/account/submissions', requireUser, (req, res) => {
  const submissions = db.prepare(`
    SELECT id, form_type, payload_json, artwork_name, created_at
    FROM submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30
  `).all(req.user.id).map(row => ({
    id: row.id,
    type: row.form_type,
    payload: safeJSON(row.payload_json, {}),
    artworkName: row.artwork_name,
    createdAt: row.created_at,
  }));
  res.json({ ok: true, submissions });
});

app.post('/api/forms', upload.single('artwork'), async (req, res) => {
  try {
    const payload = { ...req.body };
    const formType = String(payload.formType || 'contact').slice(0, 40);
    const createdAt = payload.createdAt || new Date().toISOString();
    const user = sessionUser(req);

    db.prepare('INSERT INTO submissions (user_id, form_type, payload_json, artwork_name, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(user?.id || null, formType, JSON.stringify(payload), req.file?.originalname || null, createdAt);

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
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kainat commerce server running on http://0.0.0.0:${PORT}`);
  console.log(`Persistent data: ${dbPath}`);
});
