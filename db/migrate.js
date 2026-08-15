import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import { getPool } from './index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(HERE, 'migrations');
// Arbitrary constant identifying this app's migration lock across instances.
const ADVISORY_LOCK_KEY = 862_144_221;

/**
 * Splits a .sql file into individual statements. Handles single/double quoted
 * strings, line and block comments, and dollar-quoted bodies so migrations are
 * executed statement-by-statement (works with every pg-compatible adapter and
 * keeps transactional errors pointed at the exact failing statement).
 */
export function splitStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;
  const push = () => {
    const trimmed = current.trim();
    if (trimmed) statements.push(trimmed);
    current = '';
  };
  while (i < sql.length) {
    const char = sql[i];
    const next = sql[i + 1];
    if (char === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') { current += sql[i]; i += 1; }
      continue;
    }
    if (char === '/' && next === '*') {
      current += char + next;
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) { current += sql[i]; i += 1; }
      current += '*/';
      i += 2;
      continue;
    }
    if (char === "'") {
      current += char;
      i += 1;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === "'" && sql[i + 1] === "'") { current += "'"; i += 2; continue; }
        if (sql[i] === "'") { i += 1; break; }
        i += 1;
      }
      continue;
    }
    if (char === '"') {
      current += char;
      i += 1;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === '""') { current += '"'; i += 1; continue; }
        if (sql[i] === '"') { i += 1; break; }
        i += 1;
      }
      continue;
    }
    if (char === '$') {
      const tagMatch = sql.slice(i).match(/^\$[a-zA-Z_0-9]*\$/);
      if (tagMatch) {
        const tag = tagMatch[0];
        const end = sql.indexOf(tag, i + tag.length);
        if (end !== -1) {
          current += sql.slice(i, end + tag.length);
          i = end + tag.length;
          continue;
        }
      }
    }
    if (char === ';') {
      push();
      i += 1;
      continue;
    }
    current += char;
    i += 1;
  }
  push();
  return statements;
}

export async function runMigrations({ log = console.log } = {}) {
  const pool = getPool();
  const client = await pool.connect();
  let locked = false;
  try {
    // Session-level advisory lock prevents two app instances from migrating
    // the same database concurrently. Best effort: simplified adapters used in
    // tests do not implement advisory locks.
    try {
      await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_KEY]);
      locked = true;
    } catch {
      locked = false;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    const { rows } = await client.query('SELECT name FROM schema_migrations ORDER BY name');
    const applied = new Set(rows.map((row) => row.name));

    const files = fs.existsSync(MIGRATIONS_DIR)
      ? fs.readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.sql')).sort()
      : [];
    const pending = files.filter((file) => !applied.has(file));

    if (!pending.length) {
      log('[migrate] Database schema is up to date.');
      return { applied: [] };
    }

    for (const file of pending) {
      const statements = splitStatements(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
      log(`[migrate] Applying ${file} (${statements.length} statements)…`);
      await client.query('BEGIN');
      try {
        for (const statement of statements) await client.query(statement);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        error.message = `[migrate] ${file} failed: ${error.message}`;
        throw error;
      }
      log(`[migrate] ${file} applied.`);
    }
    return { applied: pending };
  } finally {
    if (locked) {
      try { await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]); } catch { /* best effort */ }
    }
    client.release();
  }
}

async function cli() {
  dotenv.config();
  try {
    const { applied } = await runMigrations();
    console.log(`[migrate] Done — ${applied.length} migration(s) applied.`);
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    // The pool may never have been created (e.g. DATABASE_URL missing).
    try {
      const pool = getPool();
      if (typeof pool?.end === 'function') await pool.end();
    } catch {
      /* nothing to close */
    }
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) cli();
