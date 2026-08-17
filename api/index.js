// Vercel Serverless Function entry point for the whole API.
// vercel.json rewrites every /api/* request here; the original request path
// is preserved, so the Express routes behave exactly like the local server.js.
// Schema migrations run via `npm run migrate` (locally or in CI), not per-request.
import app from '../app.js';

export default function handler(req, res) {
  return app(req, res);
}
