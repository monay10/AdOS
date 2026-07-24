import type { Migration, QueryExecutor } from '@ados/persistence';
import type { Job, JobStatus } from './job.js';

const ALL_STATUSES: JobStatus[] = ['queued', 'running', 'succeeded', 'failed', 'dead', 'cancelled'];

/**
 * JobPersistence — the durable queue. Every state transition a job makes is a
 * method here, so a job is never lost to a crash: it is committed before it runs
 * and its outcome is committed after. Concrete stores (in-memory for dev/tests,
 * SQL for production) implement this contract.
 */
export interface JobStore {
  /** Persist a new job. */
  enqueue(job: Job): Promise<Job>;
  /** An in-flight (queued or running) job with this idempotency key, if any. */
  findActiveByIdempotencyKey(key: string): Promise<Job | null>;
  /** Atomically claim the oldest due job, mark it running with a fresh lease. */
  claimDue(now: number, leaseMs: number): Promise<Job | null>;
  /** Extend a running job's lease (worker heartbeat). */
  heartbeat(id: string, leaseUntil: number): Promise<void>;
  markSucceeded(id: string, now: number): Promise<void>;
  /** Recurring re-queue after success at `runAt`. */
  reschedule(id: string, runAt: number, now: number): Promise<void>;
  /** Re-queue for another attempt at `runAt`, recording the error. */
  markForRetry(id: string, runAt: number, error: string, now: number): Promise<void>;
  /** Send to the dead-letter queue (attempts exhausted). */
  markDead(id: string, error: string, now: number): Promise<void>;
  /** Cancel a job that has not finished; returns true if it was cancellable. */
  cancel(id: string, now: number): Promise<boolean>;
  /** Crash recovery: re-queue jobs whose running lease has expired. */
  recoverStale(now: number): Promise<number>;
  /** Return a dead job to the queue for reprocessing. */
  requeueDead(id: string, now: number): Promise<boolean>;
  findById(id: string): Promise<Job | null>;
  listByStatus(status: JobStatus, tenantId?: string): Promise<Job[]>;
  countByStatus(): Promise<Record<JobStatus, number>>;
}

function emptyCounts(): Record<JobStatus, number> {
  return { queued: 0, running: 0, succeeded: 0, failed: 0, dead: 0, cancelled: 0 };
}

/** In-memory job store — the default (dev/tests). Not durable across restarts. */
export class InMemoryJobStore implements JobStore {
  private readonly jobs = new Map<string, Job>();

  async enqueue(job: Job): Promise<Job> {
    this.jobs.set(job.id, { ...job });
    return job;
  }

  async findActiveByIdempotencyKey(key: string): Promise<Job | null> {
    for (const job of this.jobs.values()) {
      if (job.idempotencyKey === key && (job.status === 'queued' || job.status === 'running')) return { ...job };
    }
    return null;
  }

  async claimDue(now: number, leaseMs: number): Promise<Job | null> {
    const due = [...this.jobs.values()]
      .filter((j) => j.status === 'queued' && j.runAt <= now)
      .sort((a, b) => a.runAt - b.runAt);
    const next = due[0];
    if (!next) return null;
    const claimed: Job = { ...next, status: 'running', attempts: next.attempts + 1, leaseUntil: now + leaseMs, updatedAt: now };
    this.jobs.set(claimed.id, claimed);
    return { ...claimed };
  }

  async heartbeat(id: string, leaseUntil: number): Promise<void> {
    this.patch(id, (j) => ({ ...j, leaseUntil }));
  }

  async markSucceeded(id: string, now: number): Promise<void> {
    this.patch(id, (j) => ({ ...j, status: 'succeeded', leaseUntil: null, lastError: null, updatedAt: now }));
  }

  async reschedule(id: string, runAt: number, now: number): Promise<void> {
    this.patch(id, (j) => ({ ...j, status: 'queued', runAt, leaseUntil: null, lastError: null, updatedAt: now }));
  }

  async markForRetry(id: string, runAt: number, error: string, now: number): Promise<void> {
    this.patch(id, (j) => ({ ...j, status: 'queued', runAt, leaseUntil: null, lastError: error, updatedAt: now }));
  }

  async markDead(id: string, error: string, now: number): Promise<void> {
    this.patch(id, (j) => ({ ...j, status: 'dead', leaseUntil: null, lastError: error, updatedAt: now }));
  }

  async cancel(id: string, now: number): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || (job.status !== 'queued' && job.status !== 'running')) return false;
    this.jobs.set(id, { ...job, status: 'cancelled', leaseUntil: null, updatedAt: now });
    return true;
  }

  async recoverStale(now: number): Promise<number> {
    let recovered = 0;
    for (const job of this.jobs.values()) {
      if (job.status === 'running' && job.leaseUntil !== null && job.leaseUntil < now) {
        this.jobs.set(job.id, { ...job, status: 'queued', leaseUntil: null, updatedAt: now });
        recovered++;
      }
    }
    return recovered;
  }

  async requeueDead(id: string, now: number): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'dead') return false;
    this.jobs.set(id, { ...job, status: 'queued', attempts: 0, leaseUntil: null, lastError: null, runAt: now, updatedAt: now });
    return true;
  }

  async findById(id: string): Promise<Job | null> {
    const job = this.jobs.get(id);
    return job ? { ...job } : null;
  }

  async listByStatus(status: JobStatus, tenantId?: string): Promise<Job[]> {
    return [...this.jobs.values()]
      .filter((j) => j.status === status && (tenantId === undefined || j.tenantId === tenantId))
      .map((j) => ({ ...j }));
  }

  async countByStatus(): Promise<Record<JobStatus, number>> {
    const counts = emptyCounts();
    for (const job of this.jobs.values()) counts[job.status]++;
    return counts;
  }

  private patch(id: string, fn: (job: Job) => Job): void {
    const job = this.jobs.get(id);
    if (job) this.jobs.set(id, fn(job));
  }
}

/** Forward-only migration creating the jobs table (portable DDL). */
export function jobsMigration(): Migration {
  return {
    id: '0004_jobs',
    up: async (exec) => {
      await exec.execute(
        `CREATE TABLE IF NOT EXISTS jobs (
           id text PRIMARY KEY,
           type text NOT NULL,
           tenant_id text NOT NULL,
           correlation_id text NOT NULL,
           actor text,
           payload text NOT NULL,
           status text NOT NULL,
           attempts integer NOT NULL,
           max_attempts integer NOT NULL,
           run_at integer NOT NULL,
           timeout_ms integer NOT NULL,
           idempotency_key text,
           recur_every_ms integer,
           lease_until integer,
           last_error text,
           created_at integer NOT NULL,
           updated_at integer NOT NULL
         )`,
      );
      await exec.execute(`CREATE INDEX IF NOT EXISTS ix_jobs_due ON jobs (status, run_at)`);
      await exec.execute(`CREATE INDEX IF NOT EXISTS ix_jobs_idem ON jobs (idempotency_key)`);
    },
  };
}

interface Row {
  id: string;
  type: string;
  tenant_id: string;
  correlation_id: string;
  actor: string | null;
  payload: string;
  status: string;
  attempts: number;
  max_attempts: number;
  run_at: number;
  timeout_ms: number;
  idempotency_key: string | null;
  recur_every_ms: number | null;
  lease_until: number | null;
  last_error: string | null;
  created_at: number;
  updated_at: number;
}

function toJob(row: Row): Job {
  return {
    id: row.id,
    type: row.type,
    tenantId: row.tenant_id,
    correlationId: row.correlation_id,
    actor: row.actor,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
    status: row.status as JobStatus,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    runAt: Number(row.run_at),
    timeoutMs: Number(row.timeout_ms),
    idempotencyKey: row.idempotency_key,
    recurEveryMs: row.recur_every_ms === null ? null : Number(row.recur_every_ms),
    leaseUntil: row.lease_until === null ? null : Number(row.lease_until),
    lastError: row.last_error,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/**
 * SQL-backed job store (production), over the shared QueryExecutor. Runs the
 * portable SQL both database adapters understand. Claiming is a guarded UPDATE
 * so two workers can never run the same job.
 */
export class SqlJobStore implements JobStore {
  constructor(private readonly exec: QueryExecutor) {}

  async enqueue(job: Job): Promise<Job> {
    await this.exec.execute(
      `INSERT INTO jobs (id, type, tenant_id, correlation_id, actor, payload, status, attempts, max_attempts,
         run_at, timeout_ms, idempotency_key, recur_every_ms, lease_until, last_error, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        job.id, job.type, job.tenantId, job.correlationId, job.actor, JSON.stringify(job.payload), job.status,
        job.attempts, job.maxAttempts, job.runAt, job.timeoutMs, job.idempotencyKey, job.recurEveryMs,
        job.leaseUntil, job.lastError, job.createdAt, job.updatedAt,
      ],
    );
    return job;
  }

  async findActiveByIdempotencyKey(key: string): Promise<Job | null> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM jobs WHERE idempotency_key = $1 AND status IN ('queued','running') ORDER BY created_at ASC LIMIT 1`,
      [key],
    );
    return rows[0] ? toJob(rows[0]) : null;
  }

  async claimDue(now: number, leaseMs: number): Promise<Job | null> {
    // Guarded claim: pick the oldest due job, then flip it to running only if it
    // is still queued. If another worker won the race, try the next candidate.
    for (let i = 0; i < 8; i++) {
      const rows = await this.exec.query<Row>(
        `SELECT * FROM jobs WHERE status = 'queued' AND run_at <= $1 ORDER BY run_at ASC LIMIT 1`,
        [now],
      );
      const candidate = rows[0];
      if (!candidate) return null;
      const { rowCount } = await this.exec.execute(
        `UPDATE jobs SET status = 'running', attempts = attempts + 1, lease_until = $1, updated_at = $2
         WHERE id = $3 AND status = 'queued'`,
        [now + leaseMs, now, candidate.id],
      );
      if (rowCount === 1) return this.findById(candidate.id);
    }
    return null;
  }

  async heartbeat(id: string, leaseUntil: number): Promise<void> {
    await this.exec.execute(`UPDATE jobs SET lease_until = $1 WHERE id = $2 AND status = 'running'`, [leaseUntil, id]);
  }

  async markSucceeded(id: string, now: number): Promise<void> {
    await this.exec.execute(
      `UPDATE jobs SET status = 'succeeded', lease_until = NULL, last_error = NULL, updated_at = $1 WHERE id = $2`,
      [now, id],
    );
  }

  async reschedule(id: string, runAt: number, now: number): Promise<void> {
    await this.exec.execute(
      `UPDATE jobs SET status = 'queued', run_at = $1, lease_until = NULL, last_error = NULL, updated_at = $2 WHERE id = $3`,
      [runAt, now, id],
    );
  }

  async markForRetry(id: string, runAt: number, error: string, now: number): Promise<void> {
    await this.exec.execute(
      `UPDATE jobs SET status = 'queued', run_at = $1, lease_until = NULL, last_error = $2, updated_at = $3 WHERE id = $4`,
      [runAt, error, now, id],
    );
  }

  async markDead(id: string, error: string, now: number): Promise<void> {
    await this.exec.execute(
      `UPDATE jobs SET status = 'dead', lease_until = NULL, last_error = $1, updated_at = $2 WHERE id = $3`,
      [error, now, id],
    );
  }

  async cancel(id: string, now: number): Promise<boolean> {
    const { rowCount } = await this.exec.execute(
      `UPDATE jobs SET status = 'cancelled', lease_until = NULL, updated_at = $1 WHERE id = $2 AND status IN ('queued','running')`,
      [now, id],
    );
    return rowCount > 0;
  }

  async recoverStale(now: number): Promise<number> {
    const { rowCount } = await this.exec.execute(
      `UPDATE jobs SET status = 'queued', lease_until = NULL, updated_at = $1 WHERE status = 'running' AND lease_until IS NOT NULL AND lease_until < $2`,
      [now, now],
    );
    return rowCount;
  }

  async requeueDead(id: string, now: number): Promise<boolean> {
    const { rowCount } = await this.exec.execute(
      `UPDATE jobs SET status = 'queued', attempts = 0, lease_until = NULL, last_error = NULL, run_at = $1, updated_at = $2 WHERE id = $3 AND status = 'dead'`,
      [now, now, id],
    );
    return rowCount > 0;
  }

  async findById(id: string): Promise<Job | null> {
    const rows = await this.exec.query<Row>(`SELECT * FROM jobs WHERE id = $1`, [id]);
    return rows[0] ? toJob(rows[0]) : null;
  }

  async listByStatus(status: JobStatus, tenantId?: string): Promise<Job[]> {
    const rows =
      tenantId === undefined
        ? await this.exec.query<Row>(`SELECT * FROM jobs WHERE status = $1 ORDER BY run_at ASC`, [status])
        : await this.exec.query<Row>(`SELECT * FROM jobs WHERE status = $1 AND tenant_id = $2 ORDER BY run_at ASC`, [status, tenantId]);
    return rows.map(toJob);
  }

  async countByStatus(): Promise<Record<JobStatus, number>> {
    const rows = await this.exec.query<{ status: string; n: number }>(`SELECT status, COUNT(*) AS n FROM jobs GROUP BY status`);
    const counts = emptyCounts();
    for (const row of rows) if (ALL_STATUSES.includes(row.status as JobStatus)) counts[row.status as JobStatus] = Number(row.n);
    return counts;
  }
}
