import { randomUUID } from 'node:crypto';
import { initLogger } from '@ados/observability';
import { buildServer } from './server.js';

/**
 * Entry point. Starts the AdOS onboarding web app.
 *
 * Env:
 *   PORT             — listen port (default 4000)
 *   SESSION_SECRET   — HMAC secret for session cookies (a random one is used if
 *                      unset — fine for local dev, set it in production so
 *                      sessions survive a restart)
 *   LOG_PRETTY       — "true" for human-readable logs
 */
async function main(): Promise<void> {
  const port = Number.parseInt(process.env['PORT'] ?? '4000', 10);
  const sessionSecret = process.env['SESSION_SECRET'] ?? randomUUID();
  const logger = initLogger({
    level: process.env['LOG_LEVEL'] ?? 'info',
    service: 'ados-web',
    pretty: process.env['LOG_PRETTY'] === 'true',
  });

  const { app, server } = buildServer({ sessionSecret });
  await app.start();

  server.listen(port, () => {
    logger.info({ port }, 'AdOS web app listening');
    // eslint-disable-next-line no-console
    console.log(`\n  AdOS is running → http://localhost:${port}\n`);
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutting down');
    server.close(() => process.exit(0));
    // Force-exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void main();
