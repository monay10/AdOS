import type { QueueCounts } from './mission-queue.js';

/**
 * Runtime Health (Series 3 · Observability · Sprint 1) — answers one question:
 * **"is the system healthy right now?"** on a single screen.
 *
 * The Series 3 rule: **no estimated numbers.** Every field below is a MEASURED
 * value read from a real source at request time — process uptime, the worker's
 * own running flag, queue rows counted in the store, the SQLite file size via
 * PRAGMA, the applied schema version from the `schema_migrations` ledger, the
 * backup catalogue, and the maintenance log. Nothing here is inferred.
 */

export interface RuntimeHealth {
  generatedAt: string;
  system: { status: 'pass' | 'degraded'; uptimeSeconds: number; reasons: string[] };
  worker: { running: boolean };
  queue: QueueCounts;
  database: { durable: boolean; reachable: boolean; sizeBytes: number };
  migration: { version: string | null; applied: number };
  backup: { count: number; lastAt: string | null; lastValidated: boolean | null };
  maintenance: { lastAt: string | null; lastKind: string | null };
}

export interface RuntimeHealthInput {
  now: number;
  uptimeSeconds: number;
  workerRunning: boolean;
  queue: QueueCounts;
  database: { durable: boolean; reachable: boolean; sizeBytes: number };
  migration: { version: string | null; applied: number };
  backup: { count: number; lastAt: string | null; lastValidated: boolean | null };
  maintenance: { lastAt: string | null; lastKind: string | null };
}

/**
 * Roll the measured signals into an explainable status. `degraded` is never a
 * bare flag — it always carries the concrete reason(s), so the operator sees
 * *why*, not just *that*. A durable DB that is unreachable, a stopped worker, or
 * any failed queue job each degrade the system.
 */
export function assembleHealth(i: RuntimeHealthInput): RuntimeHealth {
  const reasons: string[] = [];
  if (i.database.durable && !i.database.reachable) reasons.push('durable database unreachable');
  if (!i.workerRunning) reasons.push('queue worker not running');
  if (i.queue.failed > 0) reasons.push(`${i.queue.failed} failed queue job(s)`);
  return {
    generatedAt: new Date(i.now).toISOString(),
    system: { status: reasons.length === 0 ? 'pass' : 'degraded', uptimeSeconds: i.uptimeSeconds, reasons },
    worker: { running: i.workerRunning },
    queue: i.queue,
    database: i.database,
    migration: i.migration,
    backup: i.backup,
    maintenance: i.maintenance,
  };
}
