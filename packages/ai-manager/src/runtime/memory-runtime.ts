import { randomUUID } from 'node:crypto';
import type { DecisionMemoryPort, DecisionMemoryRecord } from '@ados/contracts';
import type { MemoryRecord, MemoryRegistryPort, MemoryScope } from '../ports.js';

/**
 * Decision Memory — records WHY the company acted (decision + reason + evidence),
 * feeding the Cognitive Core and the COS Decision Log. Distinct from the
 * executive Decision Journal: this is the session-scoped runtime memory the AI
 * Pipeline writes to and the Context Builder reads from.
 */
export class InMemoryDecisionMemory implements DecisionMemoryPort {
  private readonly records: DecisionMemoryRecord[] = [];

  async record(entry: Omit<DecisionMemoryRecord, 'id'>): Promise<void> {
    this.records.push({ ...entry, id: randomUUID() });
  }

  async recall(query: { subjectId?: string; sessionId?: string; k: number }): Promise<DecisionMemoryRecord[]> {
    return this.records
      .filter((r) => (query.subjectId ? r.subjectId === query.subjectId : true))
      .filter((r) => (query.sessionId ? r.sessionId === query.sessionId : true))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, query.k);
  }
}

/**
 * Memory Runtime — Memory Registry. Tenant/owner-scoped memory with keyword
 * recall (swappable for vector recall behind the same port). Short-term entries
 * can be capped so working memory doesn't grow unbounded.
 */
export class InMemoryMemoryRegistry implements MemoryRegistryPort {
  private readonly records: MemoryRecord[] = [];

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async remember(record: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<void> {
    this.records.push({ ...record, id: randomUUID(), createdAt: this.now() });
  }

  async recall(query: { scope: MemoryScope; ownerId: string; query: string; k: number }): Promise<MemoryRecord[]> {
    const terms = query.query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.records
      .filter((r) => r.scope === query.scope && r.ownerId === query.ownerId)
      .map((r) => ({ r, score: relevance(r.content, terms) }))
      .sort((a, b) => b.score - a.score || b.r.createdAt.localeCompare(a.r.createdAt))
      .slice(0, query.k)
      .map((x) => x.r);
  }

  async forget(id: string): Promise<void> {
    const i = this.records.findIndex((r) => r.id === id);
    if (i >= 0) this.records.splice(i, 1);
  }
}

function relevance(content: string, terms: string[]): number {
  if (terms.length === 0) return 1; // no query ⇒ recency-only ranking
  const text = content.toLowerCase();
  return terms.filter((t) => text.includes(t)).length / terms.length;
}

/**
 * Session Working Memory — a per-session scratchpad the AI Pipeline uses to keep
 * a mission's tasks coherent (Sprint 2.1 AISession). Bounded to the most recent
 * N notes so context does not scatter or grow without limit.
 */
export class SessionWorkingMemory {
  private readonly notes = new Map<string, string[]>();

  constructor(private readonly maxPerSession = 50) {}

  note(sessionId: string, entry: string): void {
    const list = this.notes.get(sessionId) ?? [];
    list.push(entry);
    if (list.length > this.maxPerSession) list.shift();
    this.notes.set(sessionId, list);
  }

  read(sessionId: string): string[] {
    return this.notes.get(sessionId) ?? [];
  }

  clear(sessionId: string): void {
    this.notes.delete(sessionId);
  }
}
