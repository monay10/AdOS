import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { SqlGovernanceDecisionLog, type GateDecision } from './governance-decisions.js';

const dec = (over: Partial<GateDecision> = {}): GateDecision => ({
  gate: 'strategy_and_budget',
  flagged: true,
  acknowledged: false,
  at: '2026-01-01T00:00:00.000Z',
  ...over,
});

async function fresh(): Promise<{ db: SqliteDatabase; log: SqlGovernanceDecisionLog }> {
  const db = new SqliteDatabase(':memory:');
  const log = new SqlGovernanceDecisionLog(db);
  await log.init();
  return { db, log };
}

describe('SqlGovernanceDecisionLog', () => {
  it('records and lists per tenant, newest first, round-tripping optional fields', async () => {
    const { log } = await fresh();
    await log.record('acme', dec({ at: '2026-01-01T00:00:00.000Z', capability: 'brief', reviewMs: 1200 }));
    await log.record('acme', dec({ at: '2026-01-02T00:00:00.000Z', acknowledged: true }));
    await log.record('other', dec({ at: '2026-01-03T00:00:00.000Z' }));

    const acme = await log.list('acme');
    expect(acme.map((d) => d.at)).toEqual(['2026-01-02T00:00:00.000Z', '2026-01-01T00:00:00.000Z']);
    expect(acme[1]!.capability).toBe('brief');
    expect(acme[1]!.reviewMs).toBe(1200);
    expect(acme[0]!.acknowledged).toBe(true);
    expect(acme[0]!.capability).toBeUndefined(); // honestly absent, not null
    expect(await log.list('other')).toHaveLength(1);
  });

  it('reads recent decisions by gate across ALL tenants (the calibration substrate)', async () => {
    const { log } = await fresh();
    await log.record('acme', dec({ gate: 'strategy_and_budget', at: '2026-01-01T00:00:00.000Z' }));
    await log.record('other', dec({ gate: 'strategy_and_budget', at: '2026-01-02T00:00:00.000Z' }));
    await log.record('acme', dec({ gate: 'campaign_launch', at: '2026-01-03T00:00:00.000Z' }));

    const gate = await log.recentByGate('strategy_and_budget', 100);
    expect(gate).toHaveLength(2); // both tenants, that gate only
    expect(gate[0]!.at).toBe('2026-01-02T00:00:00.000Z'); // newest first
    expect(await log.recentByGate('campaign_launch', 100)).toHaveLength(1);
  });

  it('persists across log instances on the same durable store', async () => {
    const { db, log } = await fresh();
    await log.record('acme', dec());
    const log2 = new SqlGovernanceDecisionLog(db);
    expect(await log2.recentByGate('strategy_and_budget', 10)).toHaveLength(1);
  });
});
