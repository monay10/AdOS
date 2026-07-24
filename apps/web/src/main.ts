import { randomUUID } from 'node:crypto';
import { initLogger } from '@ados/observability';
import { PostgresDatabase, SqlAggregateStore, runMigrations } from '@ados/persistence';
import { App } from './app.js';
import { AuthService } from './auth/auth-service.js';
import { authCredentialsMigration, InMemoryCredentialStore, SqlCredentialStore } from './auth/credential-store.js';
import type { AuthGateway } from './auth/routes.js';
import { sqlRepositories } from './db/repositories.js';
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
 *   DATABASE_URL     — Postgres connection string. When set, persistence is
 *                      durable Postgres (migrations run at startup); otherwise
 *                      the app uses in-memory persistence (dev only).
 *   AUTH_MODE        — "password" for production email/password authentication;
 *                      otherwise the open/dev passwordless login.
 *   AUTH_SECURE_COOKIES — "false" to omit the Secure cookie flag (local HTTP).
 */
async function main(): Promise<void> {
  const port = Number.parseInt(process.env['PORT'] ?? '4000', 10);
  const sessionSecret = process.env['SESSION_SECRET'] ?? randomUUID();
  const logger = initLogger({
    level: process.env['LOG_LEVEL'] ?? 'info',
    service: 'ados-web',
    pretty: process.env['LOG_PRETTY'] === 'true',
  });

  const databaseUrl = process.env['DATABASE_URL'];
  const passwordAuth = process.env['AUTH_MODE'] === 'password';

  let db: PostgresDatabase | undefined;
  let app: App;
  if (databaseUrl) {
    db = await PostgresDatabase.connect(databaseUrl);
    const { applied } = await runMigrations(db, passwordAuth ? [authCredentialsMigration()] : []);
    logger.info({ applied }, 'database migrations applied');
    app = new App(undefined, undefined, sqlRepositories(new SqlAggregateStore(db)));
  } else {
    logger.warn('DATABASE_URL not set — using in-memory persistence (data is NOT durable across restarts)');
    app = new App();
  }

  let auth: AuthGateway | undefined;
  if (passwordAuth) {
    const store = db ? new SqlCredentialStore(db) : new InMemoryCredentialStore();
    auth = { service: new AuthService(store), secureCookies: process.env['AUTH_SECURE_COOKIES'] !== 'false' };
    logger.info({ secureCookies: auth.secureCookies }, 'password authentication enabled');
  } else {
    logger.warn('AUTH_MODE not "password" — using open/dev passwordless login (do NOT use in production)');
  }

  const { server } = buildServer({ sessionSecret, app, ...(auth ? { auth } : {}) });
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
