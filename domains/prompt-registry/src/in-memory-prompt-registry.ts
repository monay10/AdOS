import {
  type AIMessage,
  type PromptRegistryPort,
  type PromptTemplate,
} from '@ados/contracts';
import { NotFoundError } from '@ados/kernel';

/**
 * In-memory Prompt Registry adapter.
 *
 * Prompts are versioned and scored. `get` without a version returns the ACTIVE
 * version, chosen as the highest-scoring one (A/B winner), falling back to the
 * latest version when nothing has been scored yet. `score` accumulates rewards
 * so the winning version emerges from real outcomes, not a guess.
 *
 * `now` is injected for deterministic tests (no ambient Date dependency).
 */
export class InMemoryPromptRegistry implements PromptRegistryPort {
  /** key -> version -> template */
  private readonly store = new Map<string, Map<number, PromptTemplate>>();

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async publish(template: Omit<PromptTemplate, 'active' | 'createdAt'>): Promise<void> {
    const versions = this.store.get(template.key) ?? new Map<number, PromptTemplate>();
    versions.set(template.version, {
      ...template,
      active: true,
      createdAt: this.now(),
    });
    this.store.set(template.key, versions);
  }

  async list(key: string): Promise<PromptTemplate[]> {
    const versions = this.store.get(key);
    if (!versions) return [];
    return [...versions.values()].sort((a, b) => b.version - a.version);
  }

  async get(key: string, version?: number): Promise<PromptTemplate> {
    const versions = this.store.get(key);
    if (!versions || versions.size === 0) {
      throw new NotFoundError(`Prompt "${key}" not found`, { details: { key } });
    }
    if (version !== undefined) {
      const exact = versions.get(version);
      if (!exact) {
        throw new NotFoundError(`Prompt "${key}" v${version} not found`, { details: { key, version } });
      }
      return exact;
    }
    return selectActive([...versions.values()]);
  }

  async render(key: string, variables: Record<string, unknown>, version?: number): Promise<AIMessage[]> {
    const template = await this.get(key, version);
    const content = interpolate(template.content, variables);
    // A prompt template renders to a system message by convention; callers append
    // user/assistant turns. Multi-role templates can use "---" separators.
    return content.split('\n---\n').map((part, i) => ({
      role: i === 0 ? 'system' : 'user',
      content: part.trim(),
    }));
  }

  async score(key: string, version: number, reward: number): Promise<void> {
    const template = (await this.list(key)).find((t) => t.version === version);
    if (!template) {
      throw new NotFoundError(`Prompt "${key}" v${version} not found`, { details: { key, version } });
    }
    const prior = template.score ?? 0;
    // Exponential moving average keeps the score responsive to recent outcomes.
    const updated: PromptTemplate = { ...template, score: prior * 0.8 + reward * 0.2 };
    this.store.get(key)!.set(version, updated);
  }
}

/** Highest score wins; ties and unscored fall back to the latest version. */
export function selectActive(versions: PromptTemplate[]): PromptTemplate {
  return [...versions].sort((a, b) => {
    const s = (b.score ?? -1) - (a.score ?? -1);
    return s !== 0 ? s : b.version - a.version;
  })[0]!;
}

/** Replace {{var}} placeholders; leaves unknown placeholders untouched. */
export function interpolate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name: string) => {
    const value = variables[name];
    return value === undefined ? match : String(value);
  });
}
