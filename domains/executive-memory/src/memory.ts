import { randomUUID } from 'node:crypto';
import type {
  DecisionJournalEntry,
  DecisionJournalPort,
  ExecutiveMemoryEntry,
  ExecutiveMemoryPort,
} from '@ados/contracts';
import { NotFoundError } from '@ados/kernel';

/**
 * In-memory Executive Memory. Each executive has a private memory; recall ranks
 * by a blend of importance and keyword relevance so the CEO surfaces strategy
 * and risks while the Creative Director surfaces winning hooks — never mixed.
 */
export class InMemoryExecutiveMemory implements ExecutiveMemoryPort {
  private readonly entries: ExecutiveMemoryEntry[] = [];

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async remember(entry: Omit<ExecutiveMemoryEntry, 'id' | 'createdAt'>): Promise<void> {
    this.entries.push({ ...entry, id: randomUUID(), createdAt: this.now() });
  }

  async recall(query: {
    tenantId: string;
    role: ExecutiveMemoryEntry['role'];
    category?: string;
    query?: string;
    k: number;
  }): Promise<ExecutiveMemoryEntry[]> {
    const terms = (query.query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    return this.entries
      .filter((e) => e.tenantId === query.tenantId && e.role === query.role)
      .filter((e) => (query.category ? e.category === query.category : true))
      .map((e) => ({ e, score: e.importance + relevance(e.content, terms) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.k)
      .map((x) => x.e);
  }

  // ── snapshot/hydrate seams (Sprint 6 persistence) ────────────────────────────
  // Named `hydrate` (not `restore`) so it never collides with a persistence
  // decorator's parameterless `restore()` under a duck-typed capability check.
  snapshot(): ExecutiveMemoryEntry[] {
    return [...this.entries];
  }
  hydrate(entries: readonly ExecutiveMemoryEntry[]): void {
    this.entries.splice(0, this.entries.length, ...entries);
  }
}

function relevance(content: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const text = content.toLowerCase();
  const hits = terms.filter((t) => text.includes(t)).length;
  return hits / terms.length;
}

/**
 * In-memory Decision Journal. Records why each executive decided what they did,
 * with evidence, alternatives, and confidence — feeding the Learning Engine and
 * making the whole company auditable.
 */
export class InMemoryDecisionJournal implements DecisionJournalPort {
  private readonly journal = new Map<string, DecisionJournalEntry>();

  async record(entry: Omit<DecisionJournalEntry, 'id'>): Promise<string> {
    const id = randomUUID();
    this.journal.set(id, { ...entry, id });
    return id;
  }

  async history(query: {
    role?: DecisionJournalEntry['role'];
    subjectId?: string;
    k: number;
  }): Promise<DecisionJournalEntry[]> {
    return [...this.journal.values()]
      .filter((e) => (query.role ? e.role === query.role : true))
      .filter((e) => (query.subjectId ? e.subjectId === query.subjectId : true))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, query.k);
  }

  async attachOutcome(id: string, outcome: Record<string, unknown>): Promise<void> {
    const entry = this.journal.get(id);
    if (!entry) throw new NotFoundError(`Decision "${id}" not found`, { details: { id } });
    this.journal.set(id, { ...entry, outcome });
  }

  // ── snapshot/hydrate seams (Sprint 6 persistence) ────────────────────────────
  snapshot(): DecisionJournalEntry[] {
    return [...this.journal.values()];
  }
  hydrate(entries: readonly DecisionJournalEntry[]): void {
    this.journal.clear();
    for (const e of entries) this.journal.set(e.id, e);
  }
}
