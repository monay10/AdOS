import type { AIMessage } from './ai-task.js';

/**
 * Prompt Registry contract — a first-class bounded context (not baked into the
 * AI Manager). Prompts are versioned and scored so versions can be A/B tested,
 * e.g. "creative.image v14 → score 91" vs "v27". Prompts are NEVER hardcoded in
 * business logic; agents/capabilities reference them by key.
 */
export interface PromptTemplate {
  key: string; // "ceo.system", "creative.image"
  version: number;
  content: string; // template with {{variables}}
  /** A/B performance score accumulated by the Learning Engine (0..100). */
  score?: number;
  /** Free-form tags for routing/experiments (e.g. { experiment: "hooks-A" }). */
  metadata?: Record<string, unknown>;
  active: boolean;
  createdAt: string;
}

export interface PromptRegistryPort {
  get(key: string, version?: number): Promise<PromptTemplate>;
  list(key: string): Promise<PromptTemplate[]>;
  render(key: string, variables: Record<string, unknown>, version?: number): Promise<AIMessage[]>;
  publish(template: Omit<PromptTemplate, 'active' | 'createdAt'>): Promise<void>;
  /** Record an A/B outcome to steer which version becomes active. */
  score(key: string, version: number, reward: number): Promise<void>;
}

export const PROMPT_REGISTRY = Symbol.for('ados.PromptRegistry');
