import {
  CORE_CAPABILITIES,
  type AITaskResult,
  type CapabilityDefinition,
  type CapabilityId,
  type CapabilityInvocation,
  type CapabilityRegistryPort,
} from '@ados/contracts';
import { ForbiddenError, NotFoundError, UnavailableError } from '@ados/kernel';

/**
 * Executor injected by the AI Manager (Book 2). Given a resolved Capability and
 * its invocation, it runs the full pipeline (route model → build context →
 * render prompt → invoke engine/tools → validate → format) and returns the
 * result. Kept as a dependency so the registry itself stays pure and testable.
 */
export type CapabilityExecutor = (
  def: CapabilityDefinition,
  invocation: CapabilityInvocation,
) => Promise<AITaskResult>;

/**
 * In-memory Capability Registry, seeded with the company's core capabilities.
 * Agents invoke a Capability by id and never name a model — the executor (AI
 * Manager) selects the implementation.
 */
export class InMemoryCapabilityRegistry implements CapabilityRegistryPort {
  private readonly caps = new Map<CapabilityId, CapabilityDefinition>();

  constructor(
    private readonly executor: CapabilityExecutor,
    seed: ReadonlyArray<Omit<CapabilityDefinition, 'enabled'>> = CORE_CAPABILITIES,
  ) {
    for (const c of seed) this.caps.set(c.id, { ...c, enabled: true });
  }

  register(def: CapabilityDefinition): void {
    this.caps.set(def.id, def);
  }

  list(filter: { enabledOnly?: boolean } = {}): CapabilityDefinition[] {
    const all = [...this.caps.values()];
    return filter.enabledOnly ? all.filter((c) => c.enabled) : all;
  }

  get(id: CapabilityId): CapabilityDefinition | undefined {
    return this.caps.get(id);
  }

  setEnabled(id: CapabilityId, enabled: boolean): void {
    const def = this.caps.get(id);
    if (def) this.caps.set(id, { ...def, enabled });
  }

  async invoke<T = unknown>(invocation: CapabilityInvocation): Promise<AITaskResult<T>> {
    const def = this.caps.get(invocation.capability);
    if (!def) {
      throw new NotFoundError(`Capability "${invocation.capability}" is not registered`, {
        details: { capability: invocation.capability },
      });
    }
    if (!def.enabled) {
      throw new UnavailableError(`Capability "${def.id}" is disabled`, { details: { capability: def.id } });
    }
    return (await this.executor(def, invocation)) as AITaskResult<T>;
  }

  /** Guard helper for callers enforcing capability-level permissions. */
  static assertPermitted(def: CapabilityDefinition, held: string[]): void {
    if (def.requiredPermission && !held.includes(def.requiredPermission)) {
      throw new ForbiddenError(`Missing permission "${def.requiredPermission}" for capability "${def.id}"`);
    }
  }
}
