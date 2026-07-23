import type { AIMessage, AIStreamChunk } from '@ados/contracts';
import type { InferenceEngineId, InferenceEnginePort } from '../../ports.js';

/**
 * Deterministic in-process inference engine.
 *
 * Used for tests and fully-offline development where no model server is running.
 * A `responder` maps the prompt to a reply, so scenarios are reproducible
 * (Constitution Rule #8). It also provides a deterministic embedding so RAG code
 * paths can run without a model. It is NOT a cloud call — everything is local.
 */
export class FakeInferenceEngine implements InferenceEnginePort {
  constructor(
    readonly id: InferenceEngineId = 'ollama',
    private readonly responder: (messages: AIMessage[], model: string) => string = defaultResponder,
    private readonly opts: { healthy?: boolean; embeddingDim?: number } = {},
  ) {}

  async health(): Promise<{ ok: boolean; detail?: string }> {
    return this.opts.healthy === false ? { ok: false, detail: 'fake: forced unhealthy' } : { ok: true };
  }

  async complete(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    input.signal?.throwIfAborted();
    const text = this.responder(input.messages, input.model);
    return {
      text,
      promptTokens: approxTokens(input.messages.map((m) => m.content).join(' ')),
      completionTokens: approxTokens(text),
    };
  }

  async *stream(input: {
    model: string;
    messages: AIMessage[];
    signal?: AbortSignal;
  }): AsyncIterable<AIStreamChunk> {
    const text = this.responder(input.messages, input.model);
    const words = text.split(/(\s+)/);
    for (let i = 0; i < words.length; i++) {
      input.signal?.throwIfAborted();
      yield { taskId: input.model, delta: words[i]!, done: false };
    }
    yield { taskId: input.model, delta: '', done: true };
  }

  async embed(input: { model: string; texts: string[] }): Promise<number[][]> {
    const dim = this.opts.embeddingDim ?? 8;
    return input.texts.map((t) => hashEmbedding(t, dim));
  }
}

function defaultResponder(messages: AIMessage[]): string {
  const last = messages[messages.length - 1];
  return `ACK: ${last?.content.slice(0, 120) ?? ''}`;
}

/** Rough token estimate (~4 chars/token); good enough for offline accounting. */
export function approxTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/** Deterministic, dependency-free embedding: stable per input, unit-scaled. */
export function hashEmbedding(text: string, dim: number): number[] {
  const v = new Array<number>(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    v[i % dim] = (v[i % dim]! + text.charCodeAt(i)) % 997;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}
