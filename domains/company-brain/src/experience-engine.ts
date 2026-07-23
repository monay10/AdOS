import { randomUUID } from 'node:crypto';
import type { Experience, ExperienceEnginePort } from '@ados/contracts';

/**
 * In-memory Experience Engine. Stores what the company has tried and learned,
 * and retrieves the most similar past experiences so the company reuses proven
 * approaches instead of starting from scratch.
 *
 * Similarity = same vertical (hard filter) ranked by Jaccard overlap of the
 * context's key=value pairs. Deliberately simple and deterministic; a
 * production adapter can swap in vector similarity behind the same port.
 */
export class InMemoryExperienceEngine implements ExperienceEnginePort {
  private readonly experiences: Experience[] = [];

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async record(exp: Omit<Experience, 'id'>): Promise<void> {
    this.experiences.push({ ...exp, id: randomUUID(), at: exp.at || this.now() });
  }

  async findSimilar(query: {
    vertical: string;
    context?: Record<string, unknown>;
    k: number;
  }): Promise<Experience[]> {
    const target = pairs(query.context ?? {});
    return this.experiences
      .filter((e) => e.vertical === query.vertical)
      .map((e) => ({ e, score: jaccard(target, pairs(e.context)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.k)
      .map((x) => x.e);
  }
}

function pairs(obj: Record<string, unknown>): Set<string> {
  return new Set(Object.entries(obj).map(([k, v]) => `${k}=${String(v)}`));
}

/** Jaccard index; empty target returns 0 so unrelated experiences don't rank. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
