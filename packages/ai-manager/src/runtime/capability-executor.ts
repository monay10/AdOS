import type { AITaskRequest, AITaskResult, CapabilityDefinition, CapabilityInvocation } from '@ados/contracts';
import type { CapabilityExecutor } from '../capability-registry.js';
import type { AIManager } from './manager.js';

/**
 * Capability Registry → AI Manager wiring.
 *
 * Produces the executor the InMemoryCapabilityRegistry needs: it maps a business
 * Capability + its invocation into an AITaskRequest and runs it through the AI
 * Manager pipeline. This is how an agent's "invoke capability X" becomes a fully
 * governed inference — the agent never names a model or touches an engine.
 */
export function makeCapabilityExecutor(manager: AIManager): CapabilityExecutor {
  return async (def: CapabilityDefinition, invocation: CapabilityInvocation): Promise<AITaskResult> => {
    const request: AITaskRequest = {
      capability: def.modelCapability,
      submittedBy: invocation.submittedBy,
      ...(def.promptKey ? { promptRef: { key: def.promptKey } } : {}),
      ...(def.outputSchema ? { responseSchema: def.outputSchema } : {}),
      variables: {
        ...invocation.input,
        capabilityId: def.id,
        tools: def.tools,
        ...(invocation.sessionId ? { sessionId: invocation.sessionId } : {}),
      },
      input: invocation.input,
      ...(invocation.timeoutMs !== undefined ? { timeoutMs: invocation.timeoutMs } : {}),
      ...(invocation.sessionId ? { idempotencyKey: invocation.sessionId } : {}),
    };
    return manager.submit(request);
  };
}
