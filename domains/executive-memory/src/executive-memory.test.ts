import { describe, expect, it } from 'vitest';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { InMemoryExecutiveMemory, InMemoryDecisionJournal } from './memory.js';
import { BrainEvidenceEngine, HeuristicConfidenceEngine } from './reasoning.js';
import { ConstitutionChecker } from './governance.js';
import { BoardMeetingEngine } from './board.js';

const clock = () => '2026-01-01T00:00:00.000Z';

async function seededBrain(): Promise<InMemoryCompanyBrain> {
  const brain = new InMemoryCompanyBrain(clock);
  await brain.enrich({
    kind: 'marketing',
    insight: { vertical: 'dental', ctr: 5.8, cpa: 60, roas: 5.8, bestHook: 'confidence', bestHeadline: 'Smile more', bestOffer: 'free checkup', bestFunnel: 'lead', sampleSize: 382 },
  });
  return brain;
}

describe('Executive Memory — private per-role recall', () => {
  it('surfaces a role\'s own memories ranked by importance + relevance', async () => {
    const mem = new InMemoryExecutiveMemory(clock);
    await mem.remember({ tenantId: 't', role: 'cmo', category: 'campaign', content: 'Q3 dental ROAS 5.8 winner', importance: 0.9 });
    await mem.remember({ tenantId: 't', role: 'cmo', category: 'trend', content: 'video short-form rising', importance: 0.4 });
    await mem.remember({ tenantId: 't', role: 'ceo', category: 'risk', content: 'competitor outspending', importance: 0.9 });

    const cmo = await mem.recall({ tenantId: 't', role: 'cmo', k: 5 });
    expect(cmo).toHaveLength(2); // CEO memory is NOT visible to CMO
    expect(cmo[0]!.content).toContain('ROAS 5.8');
  });
});

describe('Evidence + Confidence — no "I think", always a % with basis', () => {
  it('grounds a claim and scores confidence from the brain', async () => {
    const brain = await seededBrain();
    const evidence = await new BrainEvidenceEngine(brain).gather({ claim: 'use confidence hook', vertical: 'dental' });
    expect(evidence.some((e) => e.source === 'marketing_brain')).toBe(true);

    const conf = new HeuristicConfidenceEngine().assess({ evidence, priorSuccessRate: 0.91, sampleSize: 382, roas: 5.8 });
    expect(conf.score).toBeGreaterThan(50);
    expect(conf.reason).toContain('382 campaigns');
    expect(conf.basis.roas).toBe(5.8);
  });

  it('returns minimal confidence when there is no evidence', () => {
    const conf = new HeuristicConfidenceEngine().assess({ evidence: [] });
    expect(conf.score).toBeLessThan(20);
  });
});

describe('AI Constitution Checker — gate before any action', () => {
  it('rejects low-confidence, unevidenced output', async () => {
    const brain = await seededBrain();
    const checker = new ConstitutionChecker(brain);
    const verdict = await checker.check({ tenantId: 't', role: 'cmo', action: 'creative.change', evidence: [], confidence: { score: 40, reason: '', basis: { sampleSize: 0 } } });
    expect(verdict.passed).toBe(false);
    expect(verdict.violations).toContain('no_evidence');
    expect(verdict.violations).toContain('insufficient_confidence');
  });

  it('passes evidenced, confident output but flags approval for launches', async () => {
    const brain = await seededBrain();
    const checker = new ConstitutionChecker(brain);
    const verdict = await checker.check({
      tenantId: 't',
      role: 'cmo',
      action: 'campaign.launch',
      evidence: [{ source: 'marketing_brain', ref: 'dental', weight: 0.9 }],
      confidence: { score: 92, reason: 'ok', basis: { sampleSize: 382 } },
    });
    expect(verdict.passed).toBe(true);
    expect(verdict.requiresApproval).toBe(true);
    expect(verdict.approver).toBe('ceo');
  });
});

describe('Board Meeting Engine — minutes + owned action items', () => {
  it('consolidates decisions and routes concerns to owners', async () => {
    const minutes = await new BoardMeetingEngine().convene({
      tenantId: 't',
      heldAt: clock(),
      contributions: [
        { role: 'cmo', summary: 'ROAS up', decisions: ['scale dental'], concerns: ['CTR dropping on meta'] },
        { role: 'finance_director', summary: 'cash ok', decisions: ['scale dental'], concerns: ['budget overrun risk'] },
      ],
    });
    expect(minutes.decisions).toEqual(['scale dental']); // deduped
    const owners = minutes.actionItems.map((a) => a.owner);
    expect(owners).toContain('cmo'); // CTR concern
    expect(owners).toContain('finance_director'); // budget concern
  });

  it('journals a decision with its evidence and confidence', async () => {
    const journal = new InMemoryDecisionJournal();
    const id = await journal.record({
      tenantId: 't', role: 'cmo', subjectId: 'camp-1', decision: 'replace creative',
      evidence: [{ source: 'campaign', ref: 'camp-812', weight: 0.8 }],
      alternatives: ['lower budget', 'new audience'], chosen: 'replace creative', rejected: ['lower budget'],
      confidence: { score: 88, reason: 'hook underperformed', basis: { sampleSize: 120 } }, at: clock(),
    });
    await journal.attachOutcome(id, { ctr: 3.9 });
    const history = await journal.history({ subjectId: 'camp-1', k: 1 });
    expect(history[0]!.outcome).toEqual({ ctr: 3.9 });
  });
});
