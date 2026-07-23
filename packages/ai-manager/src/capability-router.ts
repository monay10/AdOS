import type { AITaskRequest } from '@ados/contracts';
import { UnavailableError } from '@ados/kernel';
import type { ModelRegistryPort, ModelRouterPort, RoutingDecision } from './ports.js';

/**
 * Capability-based Model Router. Selects the highest-priority enabled local
 * model that satisfies the task capability, honoring an optional `preferModel`
 * hint, and produces an ordered fallback chain so the platform keeps working
 * even if a model fails (resilience mandate).
 */
export class CapabilityRouter implements ModelRouterPort {
  constructor(private readonly registry: ModelRegistryPort) {}

  route(request: AITaskRequest): RoutingDecision {
    const candidates = this.registry.list({ capability: request.capability, enabledOnly: true });
    if (candidates.length === 0) {
      throw new UnavailableError(`No local model available for capability "${request.capability}"`, {
        details: { capability: request.capability },
      });
    }

    const preferred = request.hints?.preferModel;
    const ordered = preferred
      ? [...candidates].sort((a, b) => {
          if (a.id === preferred) return -1;
          if (b.id === preferred) return 1;
          return b.priority - a.priority;
        })
      : candidates;

    const [primary, ...fallbacks] = ordered;
    return { primary: primary!, fallbacks };
  }
}
