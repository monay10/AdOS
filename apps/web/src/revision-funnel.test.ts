import { describe, expect, it } from 'vitest';
import { revisionFunnel, type MissionSummary } from './revision-funnel.js';

const m = (revisionCount: number, status: string): MissionSummary => ({ revisionCount, status });

describe('revisionFunnel', () => {
  it('returns zeros for no missions', () => {
    expect(revisionFunnel([])).toEqual({
      created: 0,
      withRevisions: 0,
      totalRevisions: 0,
      completed: 0,
      revisionRatePct: 0,
    });
  });

  it('counts created, revised, total revisions, completed, and the revision rate', () => {
    const f = revisionFunnel([
      m(0, 'completed'),
      m(2, 'completed'),
      m(1, 'awaiting_approval'),
      m(0, 'planning'),
    ]);
    expect(f.created).toBe(4);
    expect(f.withRevisions).toBe(2); // two missions needed ≥1 revision
    expect(f.totalRevisions).toBe(3); // 2 + 1
    expect(f.completed).toBe(2);
    expect(f.revisionRatePct).toBe(50); // 2 of 4
  });

  it('rounds the revision rate to one decimal', () => {
    const f = revisionFunnel([m(1, 'completed'), m(0, 'completed'), m(0, 'completed')]);
    expect(f.revisionRatePct).toBe(33.3); // 1 of 3
  });
});
