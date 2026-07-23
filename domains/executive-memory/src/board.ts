import { randomUUID } from 'node:crypto';
import type {
  ActionItem,
  BoardContribution,
  BoardMeetingEnginePort,
  BoardMinutes,
  ExecutiveRole,
} from '@ados/contracts';

/**
 * Board Meeting Engine — a real corporate meeting, not agent chat. Executives
 * contribute summaries, decisions and concerns; the engine consolidates them
 * into formal minutes with owned, actionable follow-ups. The "AI discussion"
 * (each executive's contribution) is produced upstream via the AI Manager and
 * fed in here; this engine is the deterministic consolidation + minute-taking.
 */
export class BoardMeetingEngine implements BoardMeetingEnginePort {
  async convene(input: {
    tenantId: string;
    heldAt: string;
    contributions: BoardContribution[];
  }): Promise<BoardMinutes> {
    const decisions = dedupe(input.contributions.flatMap((c) => c.decisions));

    // Every unresolved concern becomes an owned action item routed to the most
    // relevant executive, so no risk raised in the meeting is dropped.
    const actionItems: ActionItem[] = input.contributions.flatMap((c) =>
      c.concerns.map((concern) => ({ owner: ownerForConcern(concern, c.role), task: `Address: ${concern}` })),
    );

    return {
      id: randomUUID(),
      tenantId: input.tenantId,
      heldAt: input.heldAt,
      contributions: input.contributions,
      decisions,
      actionItems,
    };
  }
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()))].filter(Boolean);
}

function ownerForConcern(concern: string, raisedBy: ExecutiveRole): ExecutiveRole {
  const c = concern.toLowerCase();
  if (c.includes('budget') || c.includes('cost') || c.includes('cash')) return 'finance_director';
  if (c.includes('legal') || c.includes('compliance') || c.includes('kvkk') || c.includes('gdpr')) return 'legal_director';
  if (c.includes('creative') || c.includes('brand')) return 'creative_director';
  if (c.includes('roas') || c.includes('campaign') || c.includes('ctr')) return 'cmo';
  return raisedBy;
}
