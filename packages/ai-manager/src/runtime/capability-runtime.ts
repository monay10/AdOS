import type {
  AITaskResult,
  CapabilityInvocation,
  CapabilityRegistryPort,
} from '@ados/contracts';

/**
 * Capability Runtime — a small result cache keyed by capability + input (or an
 * explicit idempotency key). Idempotent capability calls (e.g. the same analysis
 * within a session) reuse the prior result instead of re-running inference.
 */
export class CapabilityCache {
  private readonly store = new Map<string, AITaskResult>();

  key(invocation: CapabilityInvocation): string {
    return `${invocation.capability}:${stableHash(invocation.input)}`;
  }

  get(invocation: CapabilityInvocation): AITaskResult | undefined {
    return this.store.get(this.key(invocation));
  }

  set(invocation: CapabilityInvocation, result: AITaskResult): void {
    this.store.set(this.key(invocation), result);
  }
}

/**
 * Capability Chain — runs capabilities in sequence, threading each result's
 * output into the next invocation's input under `previous`. Lets the Cognitive
 * Core's plan (Research → Persona → Creative → …) execute as a simple pipeline
 * without any capability knowing about the others.
 */
export class CapabilityChain {
  constructor(private readonly registry: CapabilityRegistryPort) {}

  async run(invocations: CapabilityInvocation[]): Promise<AITaskResult[]> {
    const results: AITaskResult[] = [];
    let previous: unknown;
    for (const invocation of invocations) {
      const input = previous === undefined ? invocation.input : { ...invocation.input, previous };
      const result = await this.registry.invoke({ ...invocation, input });
      results.push(result);
      previous = result.output;
    }
    return results;
  }
}

/** Order-independent, dependency-free hash of a JSON-serializable value. */
export function stableHash(value: unknown): string {
  const json = JSON.stringify(sortKeys(value));
  let h = 5381;
  for (let i = 0; i < json.length; i++) h = ((h << 5) + h + json.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}
