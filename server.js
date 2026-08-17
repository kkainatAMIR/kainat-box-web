// Long-running server entry point — used for local development (`npm run dev`)
// and traditional Node hosting (`npm start`). Vercel uses api/index.js instead.
import app from './app.js';
import { runMigrations } from './db/migrate.js';

const PORT = Number(process.env.PORT || 4000);

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn('[boot] DATABASE_URL is not set — database-backed API routes will fail until it is configured.');
  } else if (process.env.SKIP_BOOT_MIGRATIONS !== 'true') {
    try {
      await runMigrations();
    } catch (error) {
      console.error(`[boot] Database migration failed: ${error.message}`);
      console.error('[boot] Fix the migration error or check DATABASE_URL, then restart. (npm run migrate)');
      process.exit(1);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kainat commerce server running on http://0.0.0.0:${PORT}`);
    console.log('Database: Neon PostgreSQL (DATABASE_URL)');
  });
}

main().catch((error) => {
  console.error('[boot] Fatal startup error:', error);
  process.exit(1);
});
