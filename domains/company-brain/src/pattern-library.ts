import { randomUUID } from 'node:crypto';
import type { Pattern, PatternLibraryPort } from '@ados/contracts';

/**
 * In-memory Pattern Library. Winning structures (e.g. "15s video · first 3s
 * food · CTA reservation" for restaurants) are captured once and reused, ranked
 * by evidence strength and how often they have proven out.
 */
export class InMemoryPatternLibrary implements PatternLibraryPort {
  private readonly patterns = new Map<string, Pattern>();

  async capture(pattern: Omit<Pattern, 'id' | 'reuseCount'>): Promise<string> {
    const id = randomUUID();
    this.patterns.set(id, { ...pattern, id, reuseCount: 0 });
    return id;
  }

  async bestFor(domain: string): Promise<Pattern[]> {
    return [...this.patterns.values()]
      .filter((p) => p.domain === domain)
      .sort((a, b) => rank(b) - rank(a));
  }

  async get(id: string): Promise<Pattern | null> {
    return this.patterns.get(id) ?? null;
  }

  async markReused(id: string): Promise<void> {
    const p = this.patterns.get(id);
    if (p) this.patterns.set(id, { ...p, reuseCount: p.reuseCount + 1 });
  }

  // ── snapshot/restore seams (Sprint 6 persistence) ────────────────────────────
  snapshot(): Pattern[] {
    return [...this.patterns.values()];
  }
  restore(patterns: readonly Pattern[]): void {
    this.patterns.clear();
    for (const p of patterns) this.patterns.set(p.id, p);
  }
}

/** Evidence value weighted by sample size, nudged by proven reuse. */
function rank(p: Pattern): number {
  const confidence = Math.min(1, p.evidence.sampleSize / 100);
  return p.evidence.value * confidence + p.reuseCount * 0.1;
}
