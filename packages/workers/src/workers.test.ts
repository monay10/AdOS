import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { SqliteDatabase } from '@ados/persistence';
import { TenantContext } from '@ados/tenancy';
import { ExponentialBackoff, FixedBackoff } from './retry-policy.js';
import { InMemoryJobStore, SqlJobStore, jobsMigration } from './job-store.js';
import { GracefulShutdown } from './graceful-shutdown.js';
import { WorkerEvents, JobEventName } from './worker-events.js';
import { registerStandardWorkers, BackgroundJobType } from './background-jobs.js';
import { WorkerRegistry } from './worker-registry.js';
import { WorkerHost } from './worker-host.js';
import type { JobContext } from './worker-registry.js';

/** A deterministic, advanceable clock. */
function testClock(start = 1_000): { now: () => number; advance: (ms: number) => void } {
  let t = start;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

function host(opts: { registry: WorkerRegistry; clock: { now: () => number }; retry?: FixedBackoff; events?: WorkerEvents; concurrency?: number }): WorkerHost {
  return new WorkerHost({
    store: new InMemoryJobStore(),
    registry: opts.registry,
    clock: opts.clock.now,
    retry: opts.retry ?? new FixedBackoff(500),
    ...(opts.events ? { events: opts.events } : {}),
    concurrency: opts.concurrency ?? 4,
    leaseMs: 1_000,
  });
}

afterEach(() => vi.restoreAllMocks());

describe('ExponentialBackoff', () => {
  it('grows geometrically and caps at maxMs', () => {
    const b = new ExponentialBackoff({ baseMs: 100, factor: 2, maxMs: 1_000 });
    expect(b.nextDelayMs(1)).toBe(100);
    expect(b.nextDelayMs(2)).toBe(200);
    expect(b.nextDelayMs(3)).toBe(400);
    expect(b.nextDelayMs(10)).toBe(1_000); // capped
  });
  it('applies bounded jitter when configured', () => {
    const b = new ExponentialBackoff({ baseMs: 1_000, factor: 1, jitter: 0.5, random: () => 0.5 });
    expect(b.nextDelayMs(1)).toBe(1_000); // random 0.5 → exactly centred
  });
});

describe('WorkerHost — execution + context propagation', () => {
  it('runs an immediate job to success, bound to its tenant + correlation id', async () => {
    const clock = testClock();
    const seen: { tenantId?: string; correlationId?: string } = {};
    const registry = new WorkerRegistry().register({
      type: 'greet',
      handle: async () => { const ctx = TenantContext.current(); seen.tenantId = ctx?.tenantId; seen.correlationId = ctx?.correlationId; },
    });
    const h = host({ registry, clock });
    const job = await h.enqueue({ type: 'greet', tenantId: 'acme', correlationId: 'corr-9', payload: { hi: 1 } });
    expect(await h.tick()).toBe(1);
    expect(seen).toEqual({ tenantId: 'acme', correlationId: 'corr-9' });
    expect((await h.deadLetters.list()).length).toBe(0);
    const final = await h.monitor.report(clock.now());
    expect(final.queue.succeeded).toBe(1);
    expect(job.tenantId).toBe('acme');
  });
});

describe('WorkerHost — retry / backoff / dead-letter', () => {
  it('retries a transient failure with backoff, then succeeds', async () => {
    const clock = testClock();
    let calls = 0;
    const registry = new WorkerRegistry().register({ type: 'flaky', handle: async () => { calls++; if (calls === 1) throw new Error('transient'); } });
    const h = host({ registry, clock, retry: new FixedBackoff(500) });
    const job = await h.enqueue({ type: 'flaky', maxAttempts: 3 });

    await h.tick(); // attempt 1 → fails → re-queued at now+500
    expect((await queueOf(h)).queued).toBe(1);
    clock.advance(500);
    await h.tick(); // attempt 2 → succeeds
    expect(calls).toBe(2);
    const store = await h.deadLetters.list();
    expect(store.length).toBe(0);
    expect((await h.monitor.report(clock.now())).queue.succeeded).toBe(1);
    void job;
  });

  it('routes to the dead-letter queue when attempts are exhausted, and can requeue', async () => {
    const clock = testClock();
    const registry = new WorkerRegistry().register({ type: 'broken', handle: async () => { throw new Error('always fails'); } });
    const h = host({ registry, clock, retry: new FixedBackoff(100) });
    const job = await h.enqueue({ type: 'broken', maxAttempts: 2 });

    await h.tick();          // attempt 1 → retry
    clock.advance(100);
    await h.tick();          // attempt 2 → dead
    const dead = await h.deadLetters.list();
    expect(dead.map((d) => d.id)).toEqual([job.id]);
    expect(dead[0]!.lastError).toContain('always fails');
    expect(await h.deadLetters.size()).toBe(1);

    expect(await h.deadLetters.requeue(job.id)).toBe(true);
    expect((await h.monitor.report(clock.now())).queue.queued).toBe(1);
  });
});

describe('WorkerHost — timeout', () => {
  it('times out a hung handler and dead-letters it (single attempt)', async () => {
    const clock = testClock();
    const registry = new WorkerRegistry().register({ type: 'hang', handle: () => new Promise<void>((r) => setTimeout(r, 5_000).unref()) });
    const h = host({ registry, clock });
    const job = await h.enqueue({ type: 'hang', maxAttempts: 1, timeoutMs: 20 });
    await h.tick();
    const found = await lookup(h, job.id);
    expect(found?.status).toBe('dead');
    expect(found?.lastError).toContain('timeout');
  });
});

describe('WorkerHost — cancellation + idempotency', () => {
  it('cancels a queued job so it never runs', async () => {
    const clock = testClock();
    let ran = 0;
    const registry = new WorkerRegistry().register({ type: 'c', handle: async () => { ran++; } });
    const h = host({ registry, clock });
    const job = await h.enqueue({ type: 'c' });
    expect(await h.cancel(job.id)).toBe(true);
    await h.tick();
    expect(ran).toBe(0);
    expect((await lookup(h, job.id))?.status).toBe('cancelled');
  });

  it('de-duplicates jobs sharing an idempotency key', async () => {
    const clock = testClock();
    const registry = new WorkerRegistry().register({ type: 'once', handle: async () => {} });
    const h = host({ registry, clock });
    const a = await h.enqueue({ type: 'once', idempotencyKey: 'k-1' });
    const b = await h.enqueue({ type: 'once', idempotencyKey: 'k-1' });
    expect(b.id).toBe(a.id);
    expect((await h.monitor.report(clock.now())).queue.queued).toBe(1);
  });
});

describe('WorkerHost — scheduling', () => {
  it('delays a job until its runAt', async () => {
    const clock = testClock();
    let ran = 0;
    const registry = new WorkerRegistry().register({ type: 'later', handle: async () => { ran++; } });
    const h = host({ registry, clock });
    await h.delay({ type: 'later' }, 1_000);
    expect(await h.tick()).toBe(0); // not due yet
    expect(ran).toBe(0);
    clock.advance(1_000);
    expect(await h.tick()).toBe(1);
    expect(ran).toBe(1);
  });

  it('re-queues a recurring job after each success', async () => {
    const clock = testClock();
    let ran = 0;
    const registry = new WorkerRegistry().register({ type: 'cron', handle: async () => { ran++; } });
    const h = host({ registry, clock });
    await h.recurring('cron', 1_000);
    await h.tick();
    expect(ran).toBe(1);
    expect((await queueOf(h)).queued).toBe(1); // scheduled again
    clock.advance(1_000);
    await h.tick();
    expect(ran).toBe(2);
  });
});

describe('WorkerHost — crash recovery', () => {
  it('re-queues jobs whose running lease expired', async () => {
    const clock = testClock();
    let ran = 0;
    const registry = new WorkerRegistry().register({ type: 'r', handle: async () => { ran++; } });
    const store = new InMemoryJobStore();
    const h = new WorkerHost({ store, registry, clock: clock.now, retry: new FixedBackoff(0), leaseMs: 1_000 });
    const job = await h.enqueue({ type: 'r' });
    // Simulate a crash mid-execution: claim it, then never finish.
    const claimed = await store.claimDue(clock.now(), 1_000);
    expect(claimed?.id).toBe(job.id);
    expect((await store.findById(job.id))?.status).toBe('running');

    clock.advance(2_000); // lease expires
    expect(await h.recover()).toBe(1);
    expect((await store.findById(job.id))?.status).toBe('queued');
    await h.tick();
    expect(ran).toBe(1);
  });
});

describe('WorkerHost — health, events, graceful shutdown', () => {
  it('reports health after a heartbeat', async () => {
    const clock = testClock();
    const registry = new WorkerRegistry().register({ type: 'h', handle: async () => {} });
    const h = host({ registry, clock });
    await h.enqueue({ type: 'h' });
    await h.tick();
    const report = await h.health();
    expect(report.healthy).toBe(true);
    expect(report.workers).toHaveLength(1);
    expect(report.workers[0]!.workerId).toBe(h.id);
    expect(report.queue.succeeded).toBe(1);
  });

  it('publishes job lifecycle events onto the EventBus', async () => {
    const clock = testClock();
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    await bus.subscribe('job.>', async (env) => { seen.push(env.eventName); });
    const registry = new WorkerRegistry().register({ type: 'evt', handle: async () => {} });
    const h = host({ registry, clock, events: new WorkerEvents(bus) });
    await h.enqueue({ type: 'evt' });
    await h.tick();
    expect(seen).toContain(JobEventName.Enqueued);
    expect(seen).toContain(JobEventName.Started);
    expect(seen).toContain(JobEventName.Succeeded);
  });

  it('graceful shutdown triggers stop exactly once', async () => {
    const stop = vi.fn(async () => {});
    const gs = new GracefulShutdown(stop);
    await gs.trigger('SIGTERM');
    await gs.trigger('SIGINT');
    expect(stop).toHaveBeenCalledTimes(1);
  });
});

describe('Standard background jobs', () => {
  it('registers every job type and runs an injected handler', async () => {
    const clock = testClock();
    let enriched = false;
    const registry = registerStandardWorkers(new WorkerRegistry(), {
      [BackgroundJobType.CompanyBrainEnrichment]: async (ctx: JobContext) => { enriched = ctx.payload['ok'] === true; },
    });
    expect(registry.types()).toContain(BackgroundJobType.Analytics);
    expect(registry.types()).toHaveLength(9);
    const h = host({ registry, clock });
    await h.enqueue({ type: BackgroundJobType.CompanyBrainEnrichment, payload: { ok: true } });
    await h.tick();
    expect(enriched).toBe(true);
  });
});

describe('SqlJobStore (embedded SQL)', () => {
  it('persists jobs and drives the full harness on the production store', async () => {
    const db = new SqliteDatabase(':memory:');
    await jobsMigration().up(db);
    const store = new SqlJobStore(db);
    const clock = testClock();

    let ran = 0;
    const registry = new WorkerRegistry().register({ type: 'sql', handle: async () => { ran++; } });
    const h = new WorkerHost({ store, registry, clock: clock.now, retry: new FixedBackoff(0), leaseMs: 1_000 });
    const job = await h.enqueue({ type: 'sql', tenantId: 'acme', payload: { n: 1 } });

    expect((await store.findById(job.id))?.status).toBe('queued');
    await h.tick();
    expect(ran).toBe(1);
    expect((await store.findById(job.id))?.status).toBe('succeeded');
    expect((await store.countByStatus()).succeeded).toBe(1);
    await db.close();
  });

  it('guards claims so a job is never handed to two workers', async () => {
    const db = new SqliteDatabase(':memory:');
    await jobsMigration().up(db);
    const store = new SqlJobStore(db);
    const clock = testClock();
    const registry = new WorkerRegistry(); // handlers irrelevant here
    void registry;

    const a = await store.enqueue((await import('./job.js')).newJob({ type: 'x' }, clock.now()));
    const first = await store.claimDue(clock.now(), 1_000);
    const second = await store.claimDue(clock.now(), 1_000);
    expect(first?.id).toBe(a.id);
    expect(second).toBeNull(); // already claimed
    await db.close();
  });

  it('recovers stale running jobs via lease expiry on SQL', async () => {
    const db = new SqliteDatabase(':memory:');
    await jobsMigration().up(db);
    const store = new SqlJobStore(db);
    const clock = testClock();
    const { newJob } = await import('./job.js');
    await store.enqueue(newJob({ type: 'y' }, clock.now()));
    await store.claimDue(clock.now(), 1_000);
    clock.advance(2_000);
    expect(await store.recoverStale(clock.now())).toBe(1);
    expect((await store.countByStatus()).queued).toBe(1);
    await db.close();
  });
});

// --- helpers ---------------------------------------------------------------
async function queueOf(h: WorkerHost): Promise<{ queued: number }> {
  return { queued: (await h.monitor.report(0)).queue.queued };
}
async function lookup(h: WorkerHost, id: string): Promise<{ status: string; lastError: string | null } | null> {
  const job = await (h as unknown as { store: { findById(id: string): Promise<{ status: string; lastError: string | null } | null> } }).store.findById(id);
  return job ? { status: job.status, lastError: job.lastError } : null;
}
