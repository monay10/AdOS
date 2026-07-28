import { randomUUID } from 'node:crypto';
import { initLogger } from '@ados/observability';
import { PostgresDatabase, SqlAggregateStore, SqliteDatabase, runMigrations } from '@ados/persistence';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import { App } from './app.js';
import { PersistentCompanyBrain, SqlBrainStore } from './brain-persistence.js';
import { PersistentDecisionJournal, PersistentExecutiveMemory, SqlExecutiveStore } from './executive-persistence.js';
import { SqlMissionQueue, type MissionQueue } from './mission-queue.js';
import { policyFromEnv } from './governance-policy.js';
import { createAIManager } from './ai-factory.js';
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
 *   BRAIN_DB         — local SQLite file path for durable learned state
 *                      (Sprint 6): the whole Company Brain + Executive Memory +
 *                      Decision Journal. When set, learned state survives restarts
 *                      (100% local, no server); unset → in-memory.
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

  // AI Manager — 100% local. Offline deterministic stub by default; a local
  // inference engine (Ollama / vLLM / LM Studio …) when AI_ENGINE is set. Never a
  // cloud API. See ai-factory.ts.
  const ai = createAIManager((msg) => logger.info(msg));

  // Durable Company Brain (Sprint 6). BRAIN_DB is a local SQLite file path — the
  // compounding marketing memory survives restarts, 100% local, no server/API.
  // Unset → in-memory (the brain is wiped on restart; fine for dev/tests).
  const brainDbPath = process.env['BRAIN_DB'];
  let brain;
  let execMemory;
  let journal;
  // The applied-recommendation queue is durable on the same local file, so an
  // applied recommendation survives a restart and the worker resumes it. Unset
  // BRAIN_DB → in-memory (App's default).
  let queue: MissionQueue | undefined;
  if (brainDbPath) {
    // One SQLite connection shared by every durable learned-state store.
    const knowledgeDb = new SqliteDatabase(brainDbPath);
    brain = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(knowledgeDb));
    const execStore = new SqlExecutiveStore(knowledgeDb);
    execMemory = new PersistentExecutiveMemory(new InMemoryExecutiveMemory(), execStore);
    journal = new PersistentDecisionJournal(new InMemoryDecisionJournal(), execStore);
    queue = new SqlMissionQueue(knowledgeDb);
    logger.info({ brainDbPath }, 'durable learned state enabled (Company Brain + Executive Memory + Decision Journal + Mission Queue, SQLite)');
  } else {
    logger.warn('BRAIN_DB not set — Company Brain / Executive Memory / Decision Journal / Mission Queue are in-memory (NOT durable across restarts)');
  }

  // Governance enforcement (Sprint 8). Off by default — GOVERNANCE_ENFORCED_GATES
  // is an explicit per-gate operator opt-in (e.g. "campaign_launch").
  const { policy: governance, ignored } = policyFromEnv();
  if (governance.enforcedGates.size > 0) logger.info({ enforcedGates: [...governance.enforcedGates] }, 'governance HARD-ENFORCED on gates (no override)');
  if (ignored.length > 0) logger.warn({ ignored }, 'GOVERNANCE_ENFORCED_GATES: ignored unknown gate name(s)');

  let db: PostgresDatabase | undefined;
  let app: App;
  if (databaseUrl) {
    const maxConnections = process.env['DATABASE_MAX_CONNECTIONS'];
    db = await PostgresDatabase.connect(databaseUrl, maxConnections ? { maxConnections: Number.parseInt(maxConnections, 10) } : {});
    const { applied } = await runMigrations(db, passwordAuth ? [authCredentialsMigration()] : []);
    logger.info({ applied }, 'database migrations applied');
    app = new App(undefined, ai, sqlRepositories(new SqlAggregateStore(db)), brain, execMemory, journal, governance, queue);
  } else {
    logger.warn('DATABASE_URL not set — using in-memory persistence (data is NOT durable across restarts)');
    app = new App(undefined, ai, undefined, brain, execMemory, journal, governance, queue);
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
  // Drain applied-recommendation jobs out of band (Async Queue Worker).
  app.startWorker();

  server.listen(port, () => {
    logger.info({ port }, 'AdOS web app listening');
    // eslint-disable-next-line no-console
    console.log(`\n  AdOS is running → http://localhost:${port}\n`);
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutting down');
    // Stop accepting HTTP, then drain the in-flight queue job before exiting so a
    // mission is never left half-generated (graceful shutdown).
    server.close(() => {
      void app.stop().then(() => process.exit(0));
    });
    // Force-exit if connections/worker do not drain in time.
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void main();
