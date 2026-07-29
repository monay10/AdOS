/**
 * Mission Queue (Recommendation → Apply) — durable, worker-drained.
 *
 * When an operator applies a recommendation, the system creates a mission and
 * enqueues a job here; a background {@link QueueWorker} later claims it, runs the
 * mechanical generation (the brief, through the full governed pipeline) and STOPS
 * at the human approval gate (Book F Law 5: the human gate is first-class, never
 * skipped). Making the queue durable means an applied recommendation is not lost
 * if the process restarts mid-flight — the worker resumes it. Two implementations:
 *
 *   • {@link InMemoryMissionQueue} — dev/tests; evaporates on restart.
 *   • {@link SqlMissionQueue}      — one local SQLite table; survives restarts.
 *
 * Reliability properties the port guarantees:
 *   - **Idempotent enqueue** — keyed on missionId; a repeat enqueue is a no-op.
 *   - **Atomic claim + lease** — a due `pending` job flips to `running` under a
 *     lease exactly once, so no two workers run the same job (no duplicate exec).
 *   - **Retry/backoff** — a retryable failure returns the job to `pending` with a
 *     future `nextAttemptAt`; terminal or exhausted failures go to `failed`.
 *   - **Crash recovery** — `recoverStale` returns `running` jobs whose lease
 *     expired to `pending`, so a job interrupted by a crash is picked up again.
 *
 * 100% local — SQLite (`node:sqlite`, a file), no server, no API.
 */
import type { QueryExecutor } from '@ados/persistence';

export type QueuedStatus = 'pending' | 'running' | 'awaiting_approval' | 'failed';

/** The default retry budget for a queued mission (total run attempts). */
export const DEFAULT_MAX_ATTEMPTS = 3;

export interface QueuedMission {
  missionId: string;
  tenantId: string;
  /** The recommendation that spawned it. */
  vertical: string;
  kind: string;
  objective: string;
  status: QueuedStatus;
  /** Run attempts so far (incremented on each claim). */
  attempts: number;
  maxAttempts: number;
  /** Epoch ms; a `pending` job is due once `nextAttemptAt <= now`. */
  nextAttemptAt: number;
  /** Epoch ms; set while `running`, so a crashed job's lease can expire. */
  leaseExpiresAt?: number;
  lastError?: string;
  enqueuedAt: string;
  updatedAt: string;
}

/** New-job input; the queue defaults every lifecycle field. */
export interface EnqueueInput {
  missionId: string;
  tenantId: string;
  vertical: string;
  kind: string;
  objective: string;
  maxAttempts?: number;
}

/**
 * The queue port the worker + routes depend on. Async so the persistent and
 * in-memory implementations are interchangeable.
 */
export interface MissionQueue {
  /** Create the backing store if needed (persistent impls only). */
  init?(): Promise<void>;
  /** Add a job. Idempotent on missionId — a repeat enqueue is a no-op. */
  enqueue(input: EnqueueInput): Promise<void>;
  /**
   * Atomically claim the oldest due `pending` job across all tenants: flip it to
   * `running`, increment attempts, and set a lease. Returns null when nothing is
   * due. Guarantees at-most-one claim of a job (no duplicate execution).
   */
  claim(now: number, leaseMs: number): Promise<QueuedMission | null>;
  /** A claimed job finished cleanly and now awaits the human gate. */
  succeed(missionId: string): Promise<void>;
  /** Retryable failure: back to `pending`, due at `nextAttemptAt`, error recorded. */
  retry(missionId: string, nextAttemptAt: number, error: string): Promise<void>;
  /** Terminal / exhausted failure: `failed`, error recorded. */
  fail(missionId: string, error: string): Promise<void>;
  /** Return `running` jobs whose lease expired (or is missing) to `pending`. Count reset. */
  recoverStale(now: number): Promise<number>;
  /** A tenant's jobs, newest first (for the UI). */
  list(tenantId: string): Promise<QueuedMission[]>;
  /** Platform-wide job counts by status (measured, for the runtime-health view). */
  counts(): Promise<QueueCounts>;
}

/** Platform-wide queue depth by status — every number measured, none estimated. */
export interface QueueCounts {
  pending: number;
  running: number;
  awaiting_approval: number;
  failed: number;
  total: number;
}

const ZERO_COUNTS = (): QueueCounts => ({ pending: 0, running: 0, awaiting_approval: 0, failed: 0, total: 0 });

// ── In-memory (dev/tests) ─────────────────────────────────────────────────────

export class InMemoryMissionQueue implements MissionQueue {
  /** Keyed by missionId (globally unique), giving idempotent enqueue for free. */
  private readonly jobs = new Map<string, QueuedMission>();

  constructor(private readonly max = 100) {}

  async enqueue(input: EnqueueInput): Promise<void> {
    if (this.jobs.has(input.missionId)) return; // idempotent
    const now = new Date().toISOString();
    this.jobs.set(input.missionId, {
      missionId: input.missionId,
      tenantId: input.tenantId,
      vertical: input.vertical,
      kind: input.kind,
      objective: input.objective,
      status: 'pending',
      attempts: 0,
      maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      nextAttemptAt: 0,
      enqueuedAt: now,
      updatedAt: now,
    });
    this.evict(input.tenantId);
  }

  async claim(now: number, leaseMs: number): Promise<QueuedMission | null> {
    const due = [...this.jobs.values()]
      .filter((j) => j.status === 'pending' && j.nextAttemptAt <= now)
      .sort((a, b) => a.nextAttemptAt - b.nextAttemptAt || a.enqueuedAt.localeCompare(b.enqueuedAt));
    const job = due[0];
    if (!job) return null;
    job.status = 'running';
    job.attempts += 1;
    job.leaseExpiresAt = now + leaseMs;
    job.updatedAt = new Date().toISOString();
    return { ...job };
  }

  async succeed(missionId: string): Promise<void> {
    this.mutate(missionId, (j) => {
      j.status = 'awaiting_approval';
      delete j.leaseExpiresAt;
      delete j.lastError;
    });
  }

  async retry(missionId: string, nextAttemptAt: number, error: string): Promise<void> {
    this.mutate(missionId, (j) => {
      j.status = 'pending';
      j.nextAttemptAt = nextAttemptAt;
      j.lastError = error;
      delete j.leaseExpiresAt;
    });
  }

  async fail(missionId: string, error: string): Promise<void> {
    this.mutate(missionId, (j) => {
      j.status = 'failed';
      j.lastError = error;
      delete j.leaseExpiresAt;
    });
  }

  async recoverStale(now: number): Promise<number> {
    let n = 0;
    for (const j of this.jobs.values()) {
      if (j.status === 'running' && (j.leaseExpiresAt === undefined || j.leaseExpiresAt <= now)) {
        j.status = 'pending';
        delete j.leaseExpiresAt;
        j.updatedAt = new Date().toISOString();
        n += 1;
      }
    }
    return n;
  }

  async list(tenantId: string): Promise<QueuedMission[]> {
    // Map preserves insertion order, so reversing it yields newest-first
    // deterministically (timestamps can collide within a millisecond).
    return [...this.jobs.values()]
      .filter((j) => j.tenantId === tenantId)
      .reverse()
      .map((j) => ({ ...j }));
  }

  async counts(): Promise<QueueCounts> {
    const c = ZERO_COUNTS();
    for (const j of this.jobs.values()) {
      c[j.status] += 1;
      c.total += 1;
    }
    return c;
  }

  private mutate(missionId: string, fn: (job: QueuedMission) => void): void {
    const job = this.jobs.get(missionId);
    if (!job) return; // no-op on unknown id
    fn(job);
    job.updatedAt = new Date().toISOString();
  }

  /** Bound history per tenant, dropping oldest terminal jobs first (never active work). */
  private evict(tenantId: string): void {
    const mine = [...this.jobs.values()].filter((j) => j.tenantId === tenantId);
    let over = mine.length - this.max;
    if (over <= 0) return;
    const removable = mine
      .filter((j) => j.status === 'awaiting_approval' || j.status === 'failed')
      .sort((a, b) => a.enqueuedAt.localeCompare(b.enqueuedAt));
    for (const j of removable) {
      if (over <= 0) break;
      this.jobs.delete(j.missionId);
      over -= 1;
    }
  }
}

// ── SQLite/Postgres-backed (durable) ──────────────────────────────────────────

interface Row {
  mission_id: string;
  tenant_id: string;
  vertical: string;
  kind: string;
  objective: string;
  status: QueuedStatus;
  attempts: number;
  max_attempts: number;
  next_attempt_at: number;
  lease_expires_at: number | null;
  last_error: string | null;
  enqueued_at: string;
  updated_at: string;
}

function toJob(r: Row): QueuedMission {
  return {
    missionId: r.mission_id,
    tenantId: r.tenant_id,
    vertical: r.vertical,
    kind: r.kind,
    objective: r.objective,
    status: r.status,
    attempts: Number(r.attempts),
    maxAttempts: Number(r.max_attempts),
    nextAttemptAt: Number(r.next_attempt_at),
    ...(r.lease_expires_at != null ? { leaseExpiresAt: Number(r.lease_expires_at) } : {}),
    ...(r.last_error != null ? { lastError: r.last_error } : {}),
    enqueuedAt: r.enqueued_at,
    updatedAt: r.updated_at,
  };
}

/** {@link MissionQueue} over the SQLite/Postgres {@link QueryExecutor} port. */
export class SqlMissionQueue implements MissionQueue {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    await this.db.execute(`CREATE TABLE IF NOT EXISTS mission_queue (
      mission_id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      vertical TEXT NOT NULL,
      kind TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL,
      next_attempt_at INTEGER NOT NULL DEFAULT 0,
      lease_expires_at INTEGER,
      last_error TEXT,
      enqueued_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
  }

  async enqueue(input: EnqueueInput): Promise<void> {
    const now = new Date().toISOString();
    // Idempotent on the mission id — a repeat enqueue of the same mission is ignored.
    await this.db.execute(
      `INSERT INTO mission_queue
         (mission_id, tenant_id, vertical, kind, objective, status, attempts, max_attempts, next_attempt_at, enqueued_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', 0, $6, 0, $7, $8)
       ON CONFLICT (mission_id) DO NOTHING`,
      [input.missionId, input.tenantId, input.vertical, input.kind, input.objective, input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS, now, now],
    );
  }

  async claim(now: number, leaseMs: number): Promise<QueuedMission | null> {
    const iso = new Date().toISOString();
    // Optimistic claim: read the oldest due candidate, then flip it to `running`
    // only if it is still `pending`. rowCount === 0 means another worker won the
    // race — try the next candidate. Guarantees at-most-one claim per job.
    for (;;) {
      const candidates = await this.db.query<Row>(
        `SELECT * FROM mission_queue WHERE status = 'pending' AND next_attempt_at <= $1 ORDER BY next_attempt_at ASC, enqueued_at ASC LIMIT 1`,
        [now],
      );
      const row = candidates[0];
      if (!row) return null;
      const res = await this.db.execute(
        `UPDATE mission_queue SET status = 'running', attempts = attempts + 1, lease_expires_at = $1, updated_at = $2 WHERE mission_id = $3 AND status = 'pending'`,
        [now + leaseMs, iso, row.mission_id],
      );
      if (res.rowCount > 0) {
        const claimed = await this.db.query<Row>(`SELECT * FROM mission_queue WHERE mission_id = $1`, [row.mission_id]);
        return claimed[0] ? toJob(claimed[0]) : null;
      }
    }
  }

  async succeed(missionId: string): Promise<void> {
    await this.db.execute(
      `UPDATE mission_queue SET status = 'awaiting_approval', lease_expires_at = NULL, last_error = NULL, updated_at = $1 WHERE mission_id = $2`,
      [new Date().toISOString(), missionId],
    );
  }

  async retry(missionId: string, nextAttemptAt: number, error: string): Promise<void> {
    await this.db.execute(
      `UPDATE mission_queue SET status = 'pending', next_attempt_at = $1, lease_expires_at = NULL, last_error = $2, updated_at = $3 WHERE mission_id = $4`,
      [nextAttemptAt, error, new Date().toISOString(), missionId],
    );
  }

  async fail(missionId: string, error: string): Promise<void> {
    await this.db.execute(
      `UPDATE mission_queue SET status = 'failed', lease_expires_at = NULL, last_error = $1, updated_at = $2 WHERE mission_id = $3`,
      [error, new Date().toISOString(), missionId],
    );
  }

  async recoverStale(now: number): Promise<number> {
    const res = await this.db.execute(
      `UPDATE mission_queue SET status = 'pending', lease_expires_at = NULL, updated_at = $1 WHERE status = 'running' AND (lease_expires_at IS NULL OR lease_expires_at <= $2)`,
      [new Date().toISOString(), now],
    );
    return res.rowCount;
  }

  async list(tenantId: string): Promise<QueuedMission[]> {
    const rows = await this.db.query<Row>(
      `SELECT * FROM mission_queue WHERE tenant_id = $1 ORDER BY enqueued_at DESC LIMIT 100`,
      [tenantId],
    );
    return rows.map(toJob);
  }

  async counts(): Promise<QueueCounts> {
    const rows = await this.db.query<{ status: string; n: number }>(
      'SELECT status, COUNT(*) AS n FROM mission_queue GROUP BY status',
    );
    const c = ZERO_COUNTS();
    for (const r of rows) {
      const n = Number(r.n);
      if (r.status === 'pending' || r.status === 'running' || r.status === 'awaiting_approval' || r.status === 'failed') {
        c[r.status] = n;
      }
      c.total += n;
    }
    return c;
  }
}
