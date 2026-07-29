/**
 * Queue Worker — drains the durable {@link MissionQueue} out of band.
 *
 * The Recommendation → Apply flow enqueues a job and returns immediately; this
 * worker claims due jobs one at a time and runs the mechanical generation to the
 * human approval gate. It exists so an applied recommendation is "fire-and-forget"
 * yet reliable:
 *
 *   - **Resumes after restart** — the queue is durable and `recoverStale` returns
 *     jobs interrupted by a crash to `pending`, so a fresh worker picks them up.
 *   - **Retry with backoff** — a *retryable* failure (transient AI unavailability)
 *     is retried with exponential backoff up to the job's attempt budget; a
 *     non-retryable failure fails the job at once (no wasted retries).
 *   - **No duplicate execution** — the queue's atomic claim guarantees at-most-one
 *     worker runs a given job at a time.
 *   - **Graceful shutdown** — `stop()` stops claiming and awaits the in-flight job
 *     so a mission is never left half-generated on shutdown.
 *
 * `tick()` is the single unit of work (recover → claim → run → settle) and is
 * driven directly by tests for determinism; `start()`/`stop()` wrap it in a poll
 * loop for production. The handler runs inside the job's TenantContext, so all
 * data access stays tenant-isolated exactly as an HTTP request would be.
 */
import { TenantContext, type RequestContext } from '@ados/tenancy';
import type { MissionQueue, QueuedMission } from './mission-queue.js';
import { NOOP_RECORDER, type MetricsRecorderPort } from './metrics-recorder.js';

/** The outcome of running one queued job. */
export type JobOutcome = { isErr: false } | { isErr: true; error: { retryable: boolean; message: string } };

/** Runs a single claimed job. Called inside the job's TenantContext. */
export type QueueHandler = (job: QueuedMission) => Promise<JobOutcome>;

export interface WorkerOptions {
  /** Idle poll interval when the queue is empty (ms). */
  pollMs?: number;
  /** How long a claim is leased before it is considered stale (ms). */
  leaseMs?: number;
  /** First retry delay; doubles each attempt up to {@link backoffMaxMs}. */
  backoffBaseMs?: number;
  backoffMaxMs?: number;
  /** Injectable clock (epoch ms) for deterministic tests. */
  clock?: () => number;
  log?: (msg: string, meta?: Record<string, unknown>) => void;
  /** Records queue-wait and worker-execution latencies. No-op by default. */
  metrics?: MetricsRecorderPort;
}

export class QueueWorker {
  private running = false;
  private inFlight: Promise<void> | null = null;
  private loopPromise: Promise<void> | null = null;

  private readonly pollMs: number;
  private readonly leaseMs: number;
  private readonly backoffBaseMs: number;
  private readonly backoffMaxMs: number;
  private readonly clock: () => number;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;
  private readonly metrics: MetricsRecorderPort;

  constructor(
    private readonly queue: MissionQueue,
    private readonly handler: QueueHandler,
    opts: WorkerOptions = {},
  ) {
    this.pollMs = opts.pollMs ?? 250;
    this.leaseMs = opts.leaseMs ?? 30_000;
    this.backoffBaseMs = opts.backoffBaseMs ?? 1_000;
    this.backoffMaxMs = opts.backoffMaxMs ?? 30_000;
    this.clock = opts.clock ?? (() => Date.now());
    this.log = opts.log ?? (() => {});
    this.metrics = opts.metrics ?? NOOP_RECORDER;
  }

  /**
   * Process at most one due job: recover crashed jobs, claim the next due one,
   * run it, and settle its outcome. Returns true when it did work. Tests drive
   * this directly; the poll loop calls it repeatedly.
   */
  async tick(): Promise<boolean> {
    await this.queue.recoverStale(this.clock());
    const job = await this.queue.claim(this.clock(), this.leaseMs);
    if (!job) return false;
    // Queue wait = enqueue → first claim. Only the first attempt, so retry backoff
    // (a deliberate delay, not queue pressure) never inflates the measurement.
    // enqueuedAt is a wall-clock ISO, so measure against wall clock too.
    if (job.attempts === 1) {
      const waited = Date.now() - Date.parse(job.enqueuedAt);
      if (Number.isFinite(waited)) this.metrics.observe('queue_wait', waited);
    }
    const execStart = Date.now();
    this.inFlight = this.run(job);
    try {
      await this.inFlight;
    } finally {
      this.inFlight = null;
      // Worker execution = claim → settle, regardless of success/failure.
      this.metrics.observe('worker_execution', Date.now() - execStart);
    }
    return true;
  }

  /** Whether the background poll loop is currently running (runtime-health). */
  get isRunning(): boolean {
    return this.running;
  }

  /** Start the background poll loop. Idempotent. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.loopPromise = this.loop();
  }

  /** Stop claiming and await the in-flight job (graceful drain). */
  async stop(): Promise<void> {
    this.running = false;
    if (this.inFlight) await this.inFlight.catch(() => {});
    if (this.loopPromise) await this.loopPromise.catch(() => {});
    this.loopPromise = null;
  }

  private async loop(): Promise<void> {
    while (this.running) {
      let did = false;
      try {
        did = await this.tick();
      } catch (err) {
        this.log('queue tick failed', { error: err instanceof Error ? err.message : String(err) });
      }
      if (!this.running) break;
      if (!did) await this.sleep(this.pollMs);
    }
  }

  private async run(job: QueuedMission): Promise<void> {
    const ctx: RequestContext = {
      tenantId: job.tenantId,
      correlationId: `queue-${job.missionId}`,
      actor: 'queue-worker',
      roles: [],
    };
    try {
      const outcome = await TenantContext.run(ctx, () => this.handler(job));
      if (!outcome.isErr) {
        await this.queue.succeed(job.missionId);
        this.log('queue job done', { missionId: job.missionId });
        return;
      }
      await this.settleFailure(job, outcome.error.retryable, outcome.error.message);
    } catch (err) {
      // An unexpected throw is treated as retryable — it is most likely transient.
      await this.settleFailure(job, true, err instanceof Error ? err.message : String(err));
    }
  }

  private async settleFailure(job: QueuedMission, retryable: boolean, message: string): Promise<void> {
    if (retryable && job.attempts < job.maxAttempts) {
      const delay = Math.min(this.backoffMaxMs, this.backoffBaseMs * 2 ** (job.attempts - 1));
      await this.queue.retry(job.missionId, this.clock() + delay, message);
      this.log('queue job retry', { missionId: job.missionId, attempt: job.attempts, delay });
    } else {
      await this.queue.fail(job.missionId, message);
      this.log('queue job failed', { missionId: job.missionId, attempts: job.attempts, message });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      timer.unref?.();
    });
  }
}
