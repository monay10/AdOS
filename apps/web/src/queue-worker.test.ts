import { describe, expect, it } from 'vitest';
import { TenantContext } from '@ados/tenancy';
import { InMemoryMissionQueue } from './mission-queue.js';
import { QueueWorker, type JobOutcome } from './queue-worker.js';

/** A controllable clock the worker reads for due/backoff decisions. */
function fakeClock(start = 0) {
  let now = start;
  return { now: () => now, advance: (ms: number) => (now += ms) };
}

async function seed(q: InMemoryMissionQueue, id = 'm1'): Promise<void> {
  await q.enqueue({ missionId: id, tenantId: 'acme', vertical: 'dental', kind: 'scale', objective: 'Scale dental', maxAttempts: 3 });
}

describe('QueueWorker', () => {
  it('runs a claimed job and marks it awaiting_approval on success', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q);
    const clock = fakeClock(1000);
    let ranTenant = '';
    const worker = new QueueWorker(
      q,
      async () => {
        ranTenant = TenantContext.current()?.tenantId ?? '';
        return { isErr: false } as JobOutcome;
      },
      { clock: clock.now },
    );
    expect(await worker.tick()).toBe(true);
    expect(ranTenant).toBe('acme'); // handler ran inside the job's TenantContext
    expect((await q.list('acme'))[0]!.status).toBe('awaiting_approval');
    expect(await worker.tick()).toBe(false); // nothing left
  });

  it('retries a retryable failure with exponential backoff, then fails after the budget', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q); // maxAttempts = 3
    const clock = fakeClock(0);
    const worker = new QueueWorker(
      q,
      async () => ({ isErr: true, error: { retryable: true, message: 'AI unavailable' } }),
      { clock: clock.now, backoffBaseMs: 1000, backoffMaxMs: 10_000 },
    );

    // Attempt 1 → retry scheduled at now + 1000.
    await worker.tick();
    let job = (await q.list('acme'))[0]!;
    expect(job.status).toBe('pending');
    expect(job.attempts).toBe(1);
    expect(job.nextAttemptAt).toBe(1000);
    expect(job.lastError).toBe('AI unavailable');

    // Not due yet.
    expect(await worker.tick()).toBe(false);

    // Attempt 2 at t=1000 → retry at now + 2000 (backoff doubled).
    clock.advance(1000);
    await worker.tick();
    job = (await q.list('acme'))[0]!;
    expect(job.status).toBe('pending');
    expect(job.attempts).toBe(2);
    expect(job.nextAttemptAt).toBe(3000);

    // Attempt 3 at t=3000 → budget exhausted → failed.
    clock.advance(2000);
    await worker.tick();
    job = (await q.list('acme'))[0]!;
    expect(job.status).toBe('failed');
    expect(job.attempts).toBe(3);
  });

  it('fails a non-retryable error immediately without consuming the retry budget', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q);
    const worker = new QueueWorker(
      q,
      async () => ({ isErr: true, error: { retryable: false, message: 'no brand + product' } }),
      { clock: () => 0 },
    );
    await worker.tick();
    const job = (await q.list('acme'))[0]!;
    expect(job.status).toBe('failed');
    expect(job.attempts).toBe(1); // one attempt, no retries
    expect(job.lastError).toBe('no brand + product');
  });

  it('treats an unexpected throw as retryable', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q);
    const worker = new QueueWorker(
      q,
      async () => {
        throw new Error('kaboom');
      },
      { clock: () => 0, backoffBaseMs: 500 },
    );
    await worker.tick();
    const job = (await q.list('acme'))[0]!;
    expect(job.status).toBe('pending'); // scheduled for retry, not failed
    expect(job.lastError).toBe('kaboom');
  });

  it('stop() awaits the in-flight job (graceful drain)', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q);
    let resolveHandler!: () => void;
    let finished = false;
    const worker = new QueueWorker(
      q,
      () =>
        new Promise<JobOutcome>((resolve) => {
          resolveHandler = () => {
            finished = true;
            resolve({ isErr: false });
          };
        }),
      { clock: () => 0, pollMs: 5 },
    );
    worker.start();
    // Give the loop a moment to claim + enter the handler.
    await new Promise((r) => setTimeout(r, 20));
    const stopping = worker.stop();
    expect(finished).toBe(false); // still in-flight
    resolveHandler();
    await stopping;
    expect(finished).toBe(true); // stop() waited for it
    expect((await q.list('acme'))[0]!.status).toBe('awaiting_approval');
  });

  it('records queue_wait (first claim only) and worker_execution latencies', async () => {
    const q = new InMemoryMissionQueue();
    await seed(q);
    const observed: string[] = [];
    const worker = new QueueWorker(q, async () => ({ isErr: false }), {
      metrics: { observe: (m) => observed.push(m) },
    });
    await worker.tick();
    // Both latencies are folded exactly once for the run.
    expect(observed.filter((m) => m === 'queue_wait')).toHaveLength(1);
    expect(observed.filter((m) => m === 'worker_execution')).toHaveLength(1);
  });
});
