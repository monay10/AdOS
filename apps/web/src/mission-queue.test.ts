import { describe, expect, it } from 'vitest';
import { InMemoryMissionQueue, type EnqueueInput } from './mission-queue.js';

const input = (over: Partial<EnqueueInput> = {}): EnqueueInput => ({
  missionId: 'm1',
  tenantId: 'a',
  vertical: 'dental',
  kind: 'scale',
  objective: 'Scale dental',
  ...over,
});

describe('InMemoryMissionQueue', () => {
  it('enqueues as pending, idempotent on missionId', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1' }));
    await q.enqueue(input({ missionId: 'm1', objective: 'changed' })); // idempotent no-op
    const list = await q.list('a');
    expect(list).toHaveLength(1);
    expect(list[0]!.status).toBe('pending');
    expect(list[0]!.objective).toBe('Scale dental'); // unchanged
    expect(list[0]!.attempts).toBe(0);
  });

  it('lists newest-first and is tenant-scoped', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1', tenantId: 'a' }));
    await q.enqueue(input({ missionId: 'm2', tenantId: 'a' }));
    await q.enqueue(input({ missionId: 'other', tenantId: 'b' }));
    const a = await q.list('a');
    expect(a.map((j) => j.missionId)).toEqual(['m2', 'm1']); // newest first
    expect(await q.list('b')).toHaveLength(1);
    expect(await q.list('c')).toEqual([]);
  });

  it('claims the oldest due pending job exactly once and increments attempts', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1' }));
    const first = await q.claim(1_000, 30_000);
    expect(first?.missionId).toBe('m1');
    expect(first?.status).toBe('running');
    expect(first?.attempts).toBe(1);
    expect(first?.leaseExpiresAt).toBe(31_000);
    // No more due pending jobs — the claimed one is now running.
    expect(await q.claim(1_000, 30_000)).toBeNull();
  });

  it('does not claim a job whose nextAttemptAt is in the future (backoff)', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1' }));
    const claimed = await q.claim(0, 1_000);
    expect(claimed?.missionId).toBe('m1');
    await q.retry('m1', 5_000, 'transient'); // due again at t=5000
    expect(await q.claim(4_999, 1_000)).toBeNull(); // not yet due
    expect((await q.claim(5_000, 1_000))?.missionId).toBe('m1'); // due
  });

  it('succeed → awaiting_approval; fail → failed; both clear the lease', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1' }));
    await q.enqueue(input({ missionId: 'm2' }));
    await q.claim(0, 1_000);
    await q.succeed('m1');
    await q.claim(0, 1_000);
    await q.fail('m2', 'boom');
    const list = await q.list('a');
    const byId = Object.fromEntries(list.map((j) => [j.missionId, j]));
    expect(byId['m1']!.status).toBe('awaiting_approval');
    expect(byId['m1']!.leaseExpiresAt).toBeUndefined();
    expect(byId['m2']!.status).toBe('failed');
    expect(byId['m2']!.lastError).toBe('boom');
  });

  it('recoverStale returns running jobs with an expired lease to pending', async () => {
    const q = new InMemoryMissionQueue();
    await q.enqueue(input({ missionId: 'm1' }));
    await q.claim(0, 1_000); // leaseExpiresAt = 1000
    // Not yet expired.
    expect(await q.recoverStale(999)).toBe(0);
    // Expired → recovered.
    expect(await q.recoverStale(1_000)).toBe(1);
    const claimedAgain = await q.claim(2_000, 1_000);
    expect(claimedAgain?.missionId).toBe('m1');
    expect(claimedAgain?.attempts).toBe(2); // a second run
  });

  it('updates on unknown mission id are a no-op (never throw)', async () => {
    const q = new InMemoryMissionQueue();
    await q.succeed('missing');
    await q.fail('missing', 'x');
    await q.retry('missing', 1, 'x');
    expect(await q.list('a')).toEqual([]);
  });

  it('evicts oldest terminal jobs beyond the bound, never active work', async () => {
    const q = new InMemoryMissionQueue(2);
    await q.enqueue(input({ missionId: 'm1' }));
    await q.claim(0, 1_000);
    await q.fail('m1', 'old'); // terminal
    await q.enqueue(input({ missionId: 'm2' }));
    await q.enqueue(input({ missionId: 'm3' })); // over the bound of 2 → evict m1 (terminal)
    const ids = (await q.list('a')).map((j) => j.missionId);
    expect(ids).not.toContain('m1');
    expect(ids).toContain('m2');
    expect(ids).toContain('m3');
  });
});
