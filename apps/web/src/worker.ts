import { createServer } from 'node:http';
import { initLogger } from '@ados/observability';
import { PostgresDatabase, runMigrations } from '@ados/persistence';
import {
  InMemoryJobStore,
  SqlJobStore,
  WorkerHost,
  WorkerRegistry,
  jobsMigration,
  registerStandardWorkers,
  type JobStore,
} from '@ados/workers';
import { HealthAggregator } from '@ados/deploy';
import { makeRes, parseRequest } from './http.js';
import { handleOps } from './ops.js';

/**
 * Worker container entrypoint. Boots a {@link WorkerHost} on the persistent job
 * queue and exposes health/metrics so the orchestrator can gate and scrape it.
 * Standard job types are registered with no-op handlers here; real business
 * handlers are injected at the application boundary (the AI/domain services),
 * never inside this infrastructure process.
 */
async function main(): Promise<void> {
  const logger = initLogger({
    level: process.env['LOG_LEVEL'] ?? 'info',
    service: 'ados-worker',
    pretty: process.env['LOG_PRETTY'] === 'true',
  });
  const metricsPort = Number.parseInt(process.env['METRICS_PORT'] ?? '9465', 10);
  const databaseUrl = process.env['DATABASE_URL'];

  let db: PostgresDatabase | undefined;
  let store: JobStore;
  if (databaseUrl) {
    db = await PostgresDatabase.connect(databaseUrl);
    const { applied } = await runMigrations(db, [jobsMigration()]);
    logger.info({ applied }, 'worker migrations applied');
    store = new SqlJobStore(db);
  } else {
    logger.warn('DATABASE_URL not set — using in-memory job queue (NOT durable)');
    store = new InMemoryJobStore();
  }

  const registry = registerStandardWorkers(new WorkerRegistry());
  const host = new WorkerHost({ store, registry, workerId: `worker-${process.pid}` });

  // Readiness = database reachable; liveness = the host is running.
  const health = new HealthAggregator()
    .add({ name: 'worker', kind: 'liveness', check: () => ({ state: 'pass' }) })
    .add({ name: 'database', kind: 'readiness', check: async () => (db ? ((await db.ping()) ? { state: 'pass' } : { state: 'fail' }) : { state: 'warn', detail: 'in-memory' }) });

  const healthServer = createServer((rawReq, rawRes) => {
    const res = makeRes(rawRes);
    void (async () => {
      const req = await parseRequest(rawReq);
      if (!(await handleOps(req, res, { health, service: 'ados-worker' }))) res.json({ error: 'not found' }, 404);
    })().catch(() => rawRes.end());
  });

  host.start();
  healthServer.listen(metricsPort, () => logger.info({ metricsPort }, 'AdOS worker running'));

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'worker shutting down');
    await host.stop(); // drains in-flight jobs; queued jobs resume on next start
    healthServer.close();
    if (db) await db.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void main();
