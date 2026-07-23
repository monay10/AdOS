import type { PromptRegistryPort } from '@ados/contracts';
import type { LearningEnginePort } from '../ports.js';

/**
 * Learning Runtime — turns outcomes into better future choices. It accumulates a
 * reward signal per (promptKey, model) with an exponential moving average, and
 * suggests the best-performing model/prompt for a key. When wired to the Prompt
 * Registry it also feeds prompt scores so A/B winners emerge from real results.
 */
export class InMemoryLearningEngine implements LearningEnginePort {
  /** promptKey -> model -> EMA reward */
  private readonly modelRewards = new Map<string, Map<string, number>>();
  /** promptKey -> version -> EMA reward */
  private readonly promptRewards = new Map<string, Map<number, number>>();

  constructor(private readonly prompts?: PromptRegistryPort) {}

  async observe(signal: {
    promptKey: string;
    model: string;
    reward: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const models = this.modelRewards.get(signal.promptKey) ?? new Map<string, number>();
    models.set(signal.model, ema(models.get(signal.model), signal.reward));
    this.modelRewards.set(signal.promptKey, models);

    const version = signal.metadata?.['promptVersion'] as number | undefined;
    if (version !== undefined) {
      const versions = this.promptRewards.get(signal.promptKey) ?? new Map<number, number>();
      versions.set(version, ema(versions.get(version), signal.reward));
      this.promptRewards.set(signal.promptKey, versions);
      // Feed the Prompt Registry so its A/B winner selection reflects outcomes.
      await this.prompts?.score(signal.promptKey, version, signal.reward);
    }
  }

  async suggest(promptKey: string): Promise<{ model?: string; promptVersion?: number } | null> {
    const model = best(this.modelRewards.get(promptKey));
    const promptVersion = best(this.promptRewards.get(promptKey));
    if (model === undefined && promptVersion === undefined) return null;
    return {
      ...(model !== undefined ? { model } : {}),
      ...(promptVersion !== undefined ? { promptVersion: Number(promptVersion) } : {}),
    };
  }
}

function ema(prior: number | undefined, reward: number): number {
  return prior === undefined ? reward : prior * 0.8 + reward * 0.2;
}

function best<K>(rewards: Map<K, number> | undefined): K | undefined {
  if (!rewards || rewards.size === 0) return undefined;
  let bestKey: K | undefined;
  let bestVal = -Infinity;
  for (const [k, v] of rewards) {
    if (v > bestVal) {
      bestVal = v;
      bestKey = k;
    }
  }
  return bestKey;
}
