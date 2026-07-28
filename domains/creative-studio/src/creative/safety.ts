import type { CreativeContent } from './creative-set.js';

/** The outcome of a brand-safety inspection over generated creative copy. */
export interface CreativeSafetyResult {
  safe: boolean;
  /** Human-readable reasons the copy was blocked; empty when safe. */
  issues: string[];
}

/** Brand-safety inputs drawn from the brand the mission belongs to. */
export interface CreativeSafetyInput {
  brandId?: string | undefined;
  bannedWords?: readonly string[] | undefined;
}

/**
 * A brand-safety gate the Creative Studio consults BEFORE persisting generated
 * copy. It is a domain-local port (dependency inversion): the concrete engine
 * lives in the composition root, so this context never depends on the AI-manager
 * package. When no gate is injected the service generates exactly as before.
 */
export interface CreativeSafetyGate {
  inspect(content: CreativeContent, input: CreativeSafetyInput): Promise<CreativeSafetyResult>;
}
