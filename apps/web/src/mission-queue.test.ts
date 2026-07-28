import { describe, expect, it } from 'vitest';
import { InMemoryMissionQueue, type QueuedMission } from './mission-queue.js';

const item = (over: Partial<QueuedMission> = {}): QueuedMission => ({
  missionId: 'm1',
  vertical: 'dental',
  kind: 'scale',
  objective: 'Scale dental',
  status: 'generating',
  at: 't',
  ...over,
});

describe('InMemoryMissionQueue', () => {
  it('enqueues newest-first, tenant-scoped, bounded', () => {
    const q = new InMemoryMissionQueue(2);
    q.enqueue('a', item({ missionId: 'm1' }));
    q.enqueue('a', item({ missionId: 'm2' }));
    q.enqueue('a', item({ missionId: 'm3' }));
    q.enqueue('b', item({ missionId: 'other' }));
    const a = q.list('a');
    expect(a).toHaveLength(2); // bounded
    expect(a[0]!.missionId).toBe('m3'); // newest first
    expect(q.list('b')).toHaveLength(1);
    expect(q.list('c')).toEqual([]);
  });

  it('updates a queued mission’s status', () => {
    const q = new InMemoryMissionQueue();
    q.enqueue('a', item({ missionId: 'm1', status: 'generating' }));
    q.updateStatus('a', 'm1', 'awaiting_approval');
    expect(q.list('a')[0]!.status).toBe('awaiting_approval');
    q.updateStatus('a', 'missing', 'failed'); // no-op, no throw
    expect(q.list('a')).toHaveLength(1);
  });
});
