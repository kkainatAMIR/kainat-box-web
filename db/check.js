// One-command verification that the app can reach Neon and the schema exists:
//   npm run db:check
import dotenv from 'dotenv';
import { getPool } from './index.js';

dotenv.config();

const REQUIRED_TABLES = ['users', 'sessions', 'wishlists', 'account_data', 'submissions', 'schema_migrations'];

let failures = 0;
const ok = (msg) => console.log(`  ✅ ${msg}`);
const bad = (msg) => { failures += 1; console.log(`  ❌ ${msg}`); };

console.log('\nKainat Box Makers — database check\n');

if (!process.env.DATABASE_URL) {
  bad('DATABASE_URL is not set (check your .env file)');
  process.exit(1);
}
const host = new URL(process.env.DATABASE_URL).hostname;
console.log(`  Connecting to: ${host}${host.includes('-pooler') ? ' (pooled)' : ''}`);
if (!host.includes('-pooler')) console.log('  ⚠️  Not a pooled (-pooler) endpoint — fine locally, prefer pooled on Vercel.');

const pool = getPool();
const started = Date.now();
try {
  const { rows } = await pool.query('SELECT version() AS v, now() AS ts');
  ok(`Connected in ${Date.now() - started}ms — ${rows[0].v.split(' ').slice(0, 2).join(' ')}`);
} catch (error) {
  bad(`Connection failed: ${error.message}`);
  await pool.end();
  process.exit(1);
}

const { rows: tables } = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
);
const present = new Set(tables.map((row) => row.table_name));
for (const table of REQUIRED_TABLES) {
  if (present.has(table)) ok(`table "${table}" exists`);
  else bad(`table "${table}" is MISSING — run: npm run migrate`);
}

if (!failures) {
  const { rows: counts } = await pool.query(
    'SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM sessions)::int AS sessions, (SELECT count(*) FROM wishlists)::int AS wishlists, (SELECT count(*) FROM submissions)::int AS submissions'
  );
  ok(`data: ${counts[0].users} users, ${counts[0].sessions} sessions, ${counts[0].wishlists} wishlist items, ${counts[0].submissions} submissions`);
}

await pool.end();
console.log(failures ? '\nRESULT: FAILED — fix the items above.\n' : '\nRESULT: ALL GOOD — database is connected and the schema is ready.\n');
process.exit(failures ? 1 : 0);
