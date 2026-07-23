import { TimeoutError, UnavailableError } from '@ados/kernel';
import type { AIMessage, AIStreamChunk } from '@ados/contracts';
import type { InferenceEngineId, InferenceEnginePort } from '../../ports.js';

/**
 * Adapter for local servers that expose an OpenAI-compatible HTTP API:
 * vLLM, LM Studio, SGLang, and llama.cpp's server. One implementation, selected
 * by engine id + base URL. Still 100% local — no cloud, no API key required.
 */
export class OpenAICompatibleEngine implements InferenceEnginePort {
  constructor(
    readonly id: InferenceEngineId,
    private readonly baseUrl: string,
    private readonly apiKey?: string,
  ) {}

  async health(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/models`, { headers: this.headers() });
      return res.ok ? { ok: true } : { ok: false, detail: `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, detail: e instanceof Error ? e.message : String(e) };
    }
  }

  async complete(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    const res = await this.post('/v1/chat/completions', this.chatBody(input, false), input.signal);
    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: body.choices?.[0]?.message?.content ?? '',
      promptTokens: body.usage?.prompt_tokens ?? 0,
      completionTokens: body.usage?.completion_tokens ?? 0,
    };
  }

  async *stream(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): AsyncIterable<AIStreamChunk> {
    const res = await this.post('/v1/chat/completions', this.chatBody(input, true), input.signal);
    if (!res.body) throw new UnavailableError(`${this.id} returned no stream body`);

    for await (const data of sse(res.body, input.signal)) {
      if (data === '[DONE]') {
        yield { taskId: input.model, delta: '', done: true };
        return;
      }
      const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
      const delta = parsed.choices?.[0]?.delta?.content ?? '';
      if (delta) yield { taskId: input.model, delta, done: false };
    }
  }

  async embed(input: { model: string; texts: string[] }): Promise<number[][]> {
    const res = await this.post('/v1/embeddings', { model: input.model, input: input.texts });
    const body = (await res.json()) as { data?: Array<{ embedding: number[] }> };
    return (body.data ?? []).map((d) => d.embedding);
  }

  private chatBody(
    input: { model: string; messages: AIMessage[]; maxTokens?: number; temperature?: number },
    stream: boolean,
  ): Record<string, unknown> {
    return {
      model: input.model,
      messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
      stream,
      ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
      ...(input.maxTokens !== undefined ? { max_tokens: input.maxTokens } : {}),
    };
  }

  private headers(): Record<string, string> {
    return {
      'content-type': 'application/json',
      ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
    };
  }

  private async post(path: string, payload: unknown, signal?: AbortSignal): Promise<Response> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
        ...(signal ? { signal } : {}),
      });
      if (!res.ok) {
        throw new UnavailableError(`${this.id} ${path} failed: HTTP ${res.status}`, {
          details: { status: res.status },
        });
      }
      return res;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw new TimeoutError(`${this.id} ${path} aborted`);
      if (e instanceof UnavailableError) throw e;
      throw new UnavailableError(`${this.id} ${path} unreachable`, { cause: e });
    }
  }
}

/** Parse a Server-Sent-Events body, yielding each `data:` payload. */
export async function* sse(body: ReadableStream<Uint8Array>, signal?: AbortSignal): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      signal?.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line.startsWith('data:')) yield line.slice(5).trim();
      }
    }
  } finally {
    reader.releaseLock();
  }
}
