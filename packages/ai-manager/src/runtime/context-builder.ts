import type {
  AIMessage,
  AITaskRequest,
  ExecutiveContextBuilderPort,
  ExecutiveContextRequest,
  ExecutiveRole,
} from '@ados/contracts';
import { TenantContext } from '@ados/tenancy';
import type { ContextBuilderPort } from '../ports.js';

/**
 * Context Runtime — the AI Manager's ContextBuilderPort. It does NOT re-implement
 * context assembly; it delegates to the Executive Context Builder (which merges
 * Prompt → Mission → Company Brain → Executive Memory → Decision Memory →
 * Experience → Prompt Registry), then appends the task's own messages. Reusing
 * that builder keeps a single source of truth for context assembly.
 */
export class DelegatingContextBuilder implements ContextBuilderPort {
  constructor(
    private readonly executive: ExecutiveContextBuilderPort,
    private readonly defaultRole: ExecutiveRole = 'ceo',
  ) {}

  async build(request: AITaskRequest): Promise<AIMessage[]> {
    const v = { ...(request.variables ?? {}), ...(request.input ?? {}) };
    const tenantId = TenantContext.current()?.tenantId ?? (v['tenantId'] as string | undefined) ?? 'public';

    const execRequest: ExecutiveContextRequest = {
      tenantId,
      role: (v['role'] as ExecutiveRole | undefined) ?? this.defaultRole,
      ...(request.promptRef?.key ? { promptKey: request.promptRef.key } : {}),
      ...(request.variables ? { variables: request.variables } : {}),
      ...(v['missionId'] ? { missionId: String(v['missionId']) } : {}),
      ...(v['vertical'] ? { vertical: String(v['vertical']) } : {}),
      ...(v['brandId'] ? { brandId: String(v['brandId']) } : {}),
    };

    const context = await this.executive.build(execRequest);
    // Context blocks first, then the explicit task messages the caller supplied.
    return [...context, ...(request.messages ?? [])];
  }
}
