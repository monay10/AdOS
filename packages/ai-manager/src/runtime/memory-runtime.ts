import { randomUUID } from 'node:crypto';
import type { AISession, AISessionPort, DecisionMemoryPort, DecisionMemoryRecord } from '@ados/contracts';
import { NotFoundError } from '@ados/kernel';
import type { MemoryRecord, MemoryRegistryPort, MemoryScope } from '../ports.js';

/**
 * AI Session lifecycle. Every mission runs as one session so a mission's tasks
 * share context and can be traced together (Sprint 2.1 AISession). Sessions move
 * active → completed | aborted.
 */
export class InMemoryAISession implements AISessionPort {
  private readonly sessions = new Map<string, AISession>();

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async start(input: { tenantId: string; missionId?: string; startedBy: string }): Promise<AISession> {
    const id = randomUUID();
    const session: AISession = {
      id,
      tenantId: input.tenantId,
      ...(input.missionId ? { missionId: input.missionId } : {}),
      startedBy: input.startedBy,
      startedAt: this.now(),
      status: 'active',
      contextRef: `session:${id}`,
    };
    this.sessions.set(id, session);
    return session;
  }

  async get(id: string): Promise<AISession | null> {
    return this.sessions.get(id) ?? null;
  }

  async end(id: string, status: 'completed' | 'aborted'): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) throw new NotFoundError(`Session "${id}" not found`, { details: { id } });
    this.sessions.set(id, { ...session, status });
  }
}

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
