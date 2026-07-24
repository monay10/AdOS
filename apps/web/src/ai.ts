import type { AIManagerPort, AIStreamChunk, AITaskRequest, AITaskResult } from '@ados/contracts';

/**
 * Offline AI Manager for the web app.
 *
 * The Product Constitution says only the AI Manager talks to models. In
 * production you inject the real @ados/ai-manager (which routes to a local
 * Ollama / vLLM engine). For the pilot to run with no model server attached —
 * and for deterministic tests — this implementation produces a well-formed,
 * schema-valid response from the task variables. It is a drop-in AIManagerPort,
 * so nothing downstream changes when the real manager is swapped in.
 */
export class OfflineAIManager implements AIManagerPort {
  private counter = 0;

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.counter += 1;
    const output = this.respond(request);
    return {
      taskId: `offline-${this.counter}`,
      capability: request.capability,
      model: 'offline-deterministic',
      engine: 'ollama',
      output: output as T,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: 1,
      cached: false,
      attempts: [{ model: 'offline-deterministic', ok: true }],
    };
  }

  async *stream(): AsyncIterable<AIStreamChunk> {
    // streaming is not used by the web app
  }

  private respond(request: AITaskRequest): unknown {
    const v = request.variables ?? {};
    if (request.promptRef?.key === 'marketing.brief') {
      return this.marketingBrief(v);
    }
    return {};
  }

  private marketingBrief(v: Record<string, unknown>): unknown {
    const product = str(v['productName'], 'the product');
    const client = str(v['clientName'], 'the client');
    const voice = str(v['brandVoice'], 'professional');
    const audience = str(v['brandValues'] && Array.isArray(v['brandValues']) ? '' : '', '');
    const objective = str(v['missionBrief'], `Grow demand for ${product}`);
    const values = Array.isArray(v['brandValues']) ? (v['brandValues'] as unknown[]).map(String) : [];

    return {
      objective: `Deliver on: ${objective}`,
      targetAudience: audience || `People who would buy ${product} from ${client}`,
      positioning: `${product} — ${voice} and built on ${values.length ? values.join(', ') : 'trust and quality'}.`,
      keyMessages: [
        `Why ${product} is the right choice`,
        `The ${voice} promise of ${client}`,
        values.length ? `Grounded in ${values[0]}` : 'Proven results',
      ],
      recommendedChannels: ['meta', 'google_ads'],
      budgetAllocation: [
        { channel: 'meta', percentage: 60 },
        { channel: 'google_ads', percentage: 40 },
      ],
      kpis: [
        { name: 'leads', target: 100, unit: 'count' },
        { name: 'cpl', target: 50, unit: 'currency_minor' },
      ],
    };
  }
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
