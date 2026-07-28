import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { SqlMissionQueue, type EnqueueInput } from './mission-queue.js';

const input = (over: Partial<EnqueueInput> = {}): EnqueueInput => ({
  missionId: 'm1',
  tenantId: 'acme',
  vertical: 'dental',
  kind: 'scale',
  objective: 'Scale dental',
  ...over,
});

async function fresh(): Promise<{ db: SqliteDatabase; q: SqlMissionQueue }> {
  const db = new SqliteDatabase(':memory:');
  const q = new SqlMissionQueue(db);
  await q.init();
  return { db, q };
}

describe('SqlMissionQueue', () => {
  it('enqueues as pending and is idempotent on missionId', async () => {
    const { q } = await fresh();
    await q.enqueue(input());
    await q.enqueue(input({ objective: 'changed' })); // ON CONFLICT DO NOTHING
    const list = await q.list('acme');
    expect(list).toHaveLength(1);
    expect(list[0]!.status).toBe('pending');
    expect(list[0]!.objective).toBe('Scale dental');
    expect(list[0]!.attempts).toBe(0);
  });

  it('claims a due job exactly once (atomic), incrementing attempts + setting the lease', async () => {
    const { q } = await fresh();
    await q.enqueue(input());
    const claimed = await q.claim(1000, 30_000);
    expect(claimed?.missionId).toBe('m1');
    expect(claimed?.status).toBe('running');
    expect(claimed?.attempts).toBe(1);
    expect(claimed?.leaseExpiresAt).toBe(31_000);
    expect(await q.claim(1000, 30_000)).toBeNull(); // already running
  });

  it('honors backoff: a retried job is not due until nextAttemptAt', async () => {
    const { q } = await fresh();
    await q.enqueue(input());
    await q.claim(0, 1000);
    await q.retry('m1', 5000, 'transient');
    expect(await q.claim(4999, 1000)).toBeNull();
    expect((await q.claim(5000, 1000))?.missionId).toBe('m1');
  });

  it('succeed / fail record terminal state and clear the lease', async () => {
    const { q } = await fresh();
    await q.enqueue(input({ missionId: 'ok' }));
    await q.enqueue(input({ missionId: 'bad' }));
    await q.claim(0, 1000);
    await q.succeed('ok');
    await q.claim(0, 1000);
    await q.fail('bad', 'boom');
    const byId = Object.fromEntries((await q.list('acme')).map((j) => [j.missionId, j]));
    expect(byId['ok']!.status).toBe('awaiting_approval');
    expect(byId['ok']!.leaseExpiresAt).toBeUndefined();
    expect(byId['bad']!.status).toBe('failed');
    expect(byId['bad']!.lastError).toBe('boom');
  });

  it('recoverStale returns only lease-expired running jobs to pending', async () => {
    const { q } = await fresh();
    await q.enqueue(input());
    await q.claim(0, 1000); // lease expires at 1000
    expect(await q.recoverStale(999)).toBe(0);
    expect(await q.recoverStale(1000)).toBe(1);
    const again = await q.claim(2000, 1000);
    expect(again?.attempts).toBe(2); // a second run
  });

  it('is tenant-scoped in list and persists across queue instances on the same db', async () => {
    const { db, q } = await fresh();
    await q.enqueue(input({ missionId: 'a1', tenantId: 'acme' }));
    await q.enqueue(input({ missionId: 'b1', tenantId: 'other' }));

    // A brand-new queue object over the SAME durable store sees the jobs — the
    // state lives in SQLite, not in the object (the restart-survival property).
    const q2 = new SqlMissionQueue(db);
    expect((await q2.list('acme')).map((j) => j.missionId)).toEqual(['a1']);
    expect((await q2.list('other')).map((j) => j.missionId)).toEqual(['b1']);
  });
});
