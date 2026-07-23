import { describe, expect, it } from 'vitest';
import { InMemoryEventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';
import { InMemoryExecutiveReportRepository } from './repository.js';
import { ExecutiveReportService } from './service.js';
import type { DashboardContent, ExecutiveContext } from './executive-report.js';

const context: ExecutiveContext = {
  tenantId: 'acme',
  missionId: 'm1',
  clientId: 'c1',
  clientName: 'Bright Smiles Dental',
  missionBrief: 'Acquire new patients for a dental clinic opening next month',
  objective: 'Generate 120 qualified patient leads in the first month',
  reportId: 'r1',
  kpis: [
    { name: 'roas', value: 3, unit: 'x' },
    { name: 'cpl', value: 66666.67, unit: 'TRY_minor' },
  ],
  reportSummary: 'The campaign delivered a 3x return with strong lead volume.',
  reportRecommendations: ['Scale Meta budget by 20%'],
};

const CONTENT: DashboardContent = {
  headline: 'Mission exceeded target: 3x ROAS, 130 leads',
  executiveSummary: 'The launch campaign beat its lead goal and returned 3x on spend.',
  verdict: 'exceeded',
  keyResults: [
    { metric: 'ROAS', value: 3, unit: 'x', verdict: 'exceeded' },
    { metric: 'Leads', value: 130, unit: 'count', verdict: 'exceeded' },
  ],
  decisions: ['Approve a 20% budget increase for month two'],
  nextActions: ['Brief the Creative Studio on a retention email series'],
};

class StubAIManager implements AIManagerPort {
  public lastRequest?: AITaskRequest;
  constructor(private readonly output: unknown = CONTENT, private readonly fail = false) {}
  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.lastRequest = request;
    if (this.fail) throw new Error('engine unavailable');
    return {
      taskId: 'task-exec-1',
      capability: request.capability,
      model: 'qwen3:32b',
      engine: 'ollama',
      output: this.output as T,
      usage: { promptTokens: 220, completionTokens: 280, totalTokens: 500 },
      latencyMs: 95,
      cached: false,
      attempts: [{ model: 'qwen3:32b', ok: true }],
    };
  }
  async *stream(): AsyncIterable<AIStreamChunk> {}
}

function wire(ai: AIManagerPort) {
  const bus = new InMemoryEventBus();
  const repo = new InMemoryExecutiveReportRepository();
  const service = new ExecutiveReportService(repo, bus, ai);
  return { bus, repo, service };
}

const tctx = { tenantId: 'acme', correlationId: 'c1', actor: 'user', roles: [] };

describe('ExecutiveReportService', () => {
  it('synthesizes a CEO dashboard from the mission and report', async () => {
    await TenantContext.run(tctx, async () => {
      const ai = new StubAIManager();
      const { bus, service } = wire(ai);
      const seen: string[] = [];
      await bus.subscribe('exec.>', async (e) => { seen.push(e.eventName); });

      const r = await service.generate(context);
      expect(r.isOk).toBe(true);
      const report = r.unwrap();

      expect(ai.lastRequest?.capability).toBe('reasoning');
      expect(ai.lastRequest?.promptRef).toEqual({ key: 'executive.dashboard', version: 1 });
      expect(report.verdict).toBe('exceeded');
      expect(report.content.keyResults).toHaveLength(2);
      expect(report.content.decisions).toHaveLength(1);
      expect(report.provenance).toMatchObject({ taskId: 'task-exec-1', model: 'qwen3:32b', engine: 'ollama' });

      expect(await service.list('m1')).toHaveLength(1);
      expect(seen).toEqual(['exec.dashboard.generated.v1']);
    });
  });

  it('fails cleanly when the AI Manager is unavailable', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager(CONTENT, true));
      expect((await service.generate(context)).isErr).toBe(true);
    });
  });

  it('rejects a dashboard with an invalid verdict', async () => {
    await TenantContext.run(tctx, async () => {
      const { service } = wire(new StubAIManager({ ...CONTENT, verdict: 'unknown' }));
      expect((await service.generate(context)).isErr).toBe(true);
    });
  });
});
