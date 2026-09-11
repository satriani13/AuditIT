// Explicit start entrypoint for process managers (PM2, systemd) that do not
// preserve `process.argv[1]` as the launched script — src/server.js detects
// direct `node src/server.js` execution via `import.meta.url`, which that
// wrapping can break even though the app itself starts fine. This mirrors
// the same startup logic without relying on that check.
import { createApp } from './server.js';

const host = process.env.HOST || '127.0.0.1';
if (
  !['127.0.0.1', 'localhost', '::1'].includes(host) &&
  (!process.env.APP_PASSWORD || process.env.APP_PASSWORD.length < 12)
) {
  throw Error('Set APP_PASSWORD to at least 12 characters before listening on a public interface.');
}
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.APP_PASSWORD || process.env.APP_PASSWORD.length < 12)
) {
  throw Error('Production requires APP_PASSWORD with at least 12 characters.');
}
if (process.env.APP_PASSWORD && process.env.APP_PASSWORD.length < 12) {
  throw Error('APP_PASSWORD must have at least 12 characters.');
}

const { app, db } = createApp();
const server = app.listen(Number(process.env.PORT || 5180), host, () =>
  console.log(
    `Fieldbook: http://${host}:${process.env.PORT || 5180} — ${
      process.env.APP_PASSWORD ? 'password protected' : 'local access only'
    }`,
  ),
);
const stop = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
