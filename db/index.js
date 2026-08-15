import pg from 'pg';

const { Pool } = pg;

// Neon connection strings use "-pooler" hosts and query params such as
// `sslmode=require` / `channel_binding=require`. We parse the URL into explicit
// pg options so driver-unsupported params (e.g. channel_binding) never leak
// into the startup packet, and SSL is configured on our side instead.
function parseDatabaseUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection string.');
  }
  if (!/^postgres(ql)?:$/i.test(url.protocol)) {
    throw new Error('DATABASE_URL must be a postgres:// or postgresql:// connection string.');
  }
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')) || undefined,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

let pool = null;

function buildPool() {
  const rawUrl = (process.env.DATABASE_URL || '').trim();
  if (!rawUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add your Neon connection string to .env ' +
      '(see .env.example) and to your Vercel project environment variables.'
    );
  }
  const base = parseDatabaseUrl(rawUrl);
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(base.host || '');
  const sslEnabled = !isLocal && process.env.DATABASE_SSL !== 'disable';
  const created = new Pool({
    ...base,
    // Neon requires TLS and its certificates chain to a widely trusted root,
    // so keep certificate verification on. Set DATABASE_SSL_STRICT=false only
    // when a local proxy presents a self-signed certificate.
    ssl: sslEnabled
      ? { rejectUnauthorized: process.env.DATABASE_SSL_STRICT !== 'false' }
      : false,
    // Small pools per instance: Neon multiplexes connections on its -pooler
    // endpoint, which is what serverless (Vercel) concurrency relies on.
    max: Number(process.env.DATABASE_POOL_MAX || (process.env.VERCEL ? 2 : 5)),
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30_000),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS || 10_000),
    keepAlive: true,
  });
  created.on('error', (error) => {
    // Idle client errors (network resets, etc.) must not crash the process.
    console.error('[db] Unexpected idle client error:', error.message);
  });
  return created;
}

export function getPool() {
  if (!pool) pool = buildPool();
  return pool;
}

/** Inject a pg-compatible pool (used by the offline test harness). */
export function setPool(customPool) {
  pool = customPool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}

export async function one(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

export async function all(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}

export async function closePool() {
  if (pool) {
    const current = pool;
    pool = null;
    if (typeof current.end === 'function') await current.end();
  }
}
