import { performance } from 'node:perf_hooks';
import type {
  AIManagerPort,
  AIMessage,
  AIStreamChunk,
  AITaskRequest,
  AITaskResult,
} from '@ados/contracts';
import type { InferenceEnginePort } from '@ados/ai-manager';

/**
 * Live AI Manager for the web app — the real, 100% local path.
 *
 * Everything runs on the operator's own machine: it drives a local inference
 * engine (Ollama on localhost by default; any OpenAI-compatible local server —
 * vLLM, LM Studio, llama.cpp — via the same {@link InferenceEnginePort}). There
 * is NO cloud call, NO API key, NO network beyond the local engine.
 *
 * It honours the same {@link AIManagerPort} contract as {@link OfflineAIManager}
 * so nothing downstream changes: the business services keep submitting an
 * AITaskRequest (capability + promptRef + variables + responseSchema) and get a
 * schema-shaped `output` back. This adapter turns that request into a real
 * chat prompt, calls the model, extracts the JSON object it returns, and (once)
 * asks the model to repair its output if it is not valid JSON.
 */
export class LiveAIManager implements AIManagerPort {
  private counter = 0;

  constructor(
    private readonly engine: InferenceEnginePort,
    private readonly config: LiveAIConfig,
  ) {}

  async submit<T = unknown>(request: AITaskRequest): Promise<AITaskResult<T>> {
    this.counter += 1;
    const model = this.modelFor(request);
    const messages = buildMessages(request, this.config.resolveLanguage?.());
    const attempts: Array<{ model: string; ok: boolean; error?: string }> = [];
    const started = performance.now();

    let promptTokens = 0;
    let completionTokens = 0;
    let output: unknown;
    let lastError = '';
    const temperature = request.hints?.temperature ?? this.config.temperature;

    // First attempt + a single self-repair attempt if the model returns
    // something that is not a JSON object matching the request.
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.engine.complete({
        model,
        messages: attempt === 0 ? messages : [...messages, ...repairTurn(lastError)],
        ...(temperature !== undefined ? { temperature } : {}),
        ...(request.hints?.maxTokens ? { maxTokens: request.hints.maxTokens } : {}),
        ...(request.timeoutMs ? { signal: AbortSignal.timeout(request.timeoutMs) } : {}),
      });
      promptTokens += res.promptTokens;
      completionTokens += res.completionTokens;
      const parsed = extractJson(res.text);
      if (parsed.ok) {
        output = parsed.value;
        attempts.push({ model, ok: true });
        break;
      }
      lastError = parsed.error;
      attempts.push({ model, ok: false, error: parsed.error });
    }

    if (output === undefined) {
      // Every attempt failed to yield JSON. Surface it as an engine failure so
      // the calling service returns its own UnavailableError (unchanged behaviour).
      throw new Error(`local model did not return a valid JSON object: ${lastError}`);
    }

    return {
      taskId: `local-${this.engine.id}-${this.counter}`,
      capability: request.capability,
      model,
      engine: this.engine.id,
      output: output as T,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      latencyMs: Math.round(performance.now() - started),
      cached: false,
      attempts,
    };
  }

  async *stream(request: AITaskRequest): AsyncIterable<AIStreamChunk> {
    const temperature = request.hints?.temperature ?? this.config.temperature;
    yield* this.engine.stream({
      model: this.modelFor(request),
      messages: buildMessages(request, this.config.resolveLanguage?.()),
      ...(temperature !== undefined ? { temperature } : {}),
      ...(request.hints?.maxTokens ? { maxTokens: request.hints.maxTokens } : {}),
    });
  }

  private modelFor(request: AITaskRequest): string {
    return (
      request.hints?.preferModel ??
      this.config.models?.[request.capability] ??
      this.config.defaultModel
    );
  }
}

/**
 * Operator-tunable resilience thresholds for the governed InferencePipeline. All
 * optional — each falls back to the pipeline's default when unset. Numbers only
 * (the pipeline's `sleep`/`now` seams stay internal, for tests).
 */
export interface ResilienceConfig {
  /** Retries per model on retryable failures (default 2). */
  maxRetries?: number;
  /** Per-inference timeout in ms (default 60000). */
  timeoutMs?: number;
  /** Consecutive failures before a model's circuit opens (default 3). */
  breakerThreshold?: number;
  /** How long a tripped circuit stays open, in ms (default 30000). */
  breakerCooldownMs?: number;
}

export interface LiveAIConfig {
  /** Model used when a capability has no specific mapping (e.g. "qwen2.5:7b"). */
  defaultModel: string;
  /** Optional per-capability model overrides. */
  models?: Partial<Record<AITaskRequest['capability'], string>>;
  /** Sampling temperature; low by default for structured, deterministic output. */
  temperature?: number;
  /** Operator-tunable pipeline resilience thresholds; pipeline defaults when omitted. */
  resilience?: ResilienceConfig;
  /**
   * Returns the human-readable language the model should answer in (e.g.
   * "Turkish" / "English"), evaluated per request. Wired to the request locale
   * by the factory so AI output matches the UI language. Omit for no constraint.
   */
  resolveLanguage?: () => string;
}

/** System instructions per prompt, keyed by the versioned promptRef the services submit. */
const ROLES: Record<string, string> = {
  'marketing.brief':
    'You are a senior marketing strategist. Produce a concise, actionable marketing brief.',
  'creative.set':
    'You are a senior advertising creative director. Produce a set of ad creatives.',
  'campaign.draft':
    'You are a paid-media campaign planner. Produce a channel-by-channel campaign draft with budget allocation.',
  'analytics.report':
    'You are a performance-marketing analyst. Turn the campaign metrics into an insights report.',
  'executive.dashboard':
    'You are a chief marketing officer. Produce an executive summary of the campaign for leadership.',
};

/**
 * Build the chat prompt the local model sees, from the service's structured
 * request. Exported so the governed live runtime (Sprint 4.4b) reuses the exact
 * same prompt via its context builder — keeping the live prompt identical
 * whether generation runs through LiveAIManager or the governed pipeline.
 */
export function buildMessages(request: AITaskRequest, language?: string): AIMessage[] {
  const role = (request.promptRef && ROLES[request.promptRef.key]) ?? 'You are a helpful assistant.';
  const lang = language
    ? `\n\nWrite ALL natural-language text values in ${language}. Keep JSON keys in English.`
    : '';
  const schema = request.responseSchema
    ? `\n\nReturn ONLY a single JSON object that satisfies this JSON Schema (no prose, no markdown fences):\n${JSON.stringify(request.responseSchema)}`
    : '\n\nReturn ONLY a single JSON object (no prose, no markdown fences).';

  const system: AIMessage = { role: 'system', content: `${role}${lang}${schema}` };
  const context = request.variables ? formatVariables(request.variables) : '';
  const user: AIMessage = {
    role: 'user',
    content: context ? `Here is the context:\n${context}\n\nRespond with the JSON object.` : 'Respond with the JSON object.',
  };
  // Any explicit messages the caller supplied are appended after the built turn.
  return [system, user, ...(request.messages ?? [])];
}

/** Render request variables as a readable key/value block for the prompt. */
function formatVariables(vars: Record<string, unknown>): string {
  return Object.entries(vars)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n');
}

/** The follow-up turn that asks the model to repair non-JSON output. */
function repairTurn(error: string): AIMessage[] {
  return [
    {
      role: 'user',
      content: `Your previous response was not a valid JSON object (${error}). Reply again with ONLY the JSON object, no prose and no markdown fences.`,
    },
  ];
}

/**
 * Pull a JSON object out of a model reply. Local models often wrap JSON in
 * ```json fences or add a sentence of prose, so we strip fences and, failing a
 * direct parse, take the outermost {...} span.
 */
function extractJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const stripped = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  const candidates = [stripped];
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  if (first >= 0 && last > first) candidates.push(stripped.slice(first, last + 1));

  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) return { ok: true, value };
    } catch {
      // try the next candidate
    }
  }
  return { ok: false, error: 'no JSON object found in reply' };
}
