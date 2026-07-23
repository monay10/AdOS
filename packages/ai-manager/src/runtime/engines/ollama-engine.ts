import { TimeoutError, UnavailableError } from '@ados/kernel';
import type { AIMessage, AIStreamChunk } from '@ados/contracts';
import type { InferenceEnginePort } from '../../ports.js';

/**
 * Ollama adapter — the default local inference engine. Talks HTTP to a
 * locally-running Ollama server (offline, no cloud). Implements the same
 * InferenceEnginePort as every other engine, so models are fully swappable.
 */
export class OllamaEngine implements InferenceEnginePort {
  readonly id = 'ollama' as const;

  constructor(private readonly baseUrl = 'http://localhost:11434') {}

  async health(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
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
    const res = await this.post(
      '/api/chat',
      {
        model: input.model,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: pruneOptions(input),
      },
      input.signal,
    );
    const body = (await res.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };
    return {
      text: body.message?.content ?? '',
      promptTokens: body.prompt_eval_count ?? 0,
      completionTokens: body.eval_count ?? 0,
    };
  }

  async *stream(input: {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
  }): AsyncIterable<AIStreamChunk> {
    const res = await this.post(
      '/api/chat',
      {
        model: input.model,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        options: pruneOptions(input),
      },
      input.signal,
    );
    if (!res.body) throw new UnavailableError('Ollama returned no stream body');

    for await (const line of ndjson(res.body, input.signal)) {
      const chunk = line as { message?: { content?: string }; done?: boolean };
      yield { taskId: input.model, delta: chunk.message?.content ?? '', done: Boolean(chunk.done) };
      if (chunk.done) return;
    }
  }

  async embed(input: { model: string; texts: string[] }): Promise<number[][]> {
    const out: number[][] = [];
    for (const text of input.texts) {
      const res = await this.post('/api/embeddings', { model: input.model, prompt: text });
      const body = (await res.json()) as { embedding?: number[] };
      out.push(body.embedding ?? []);
    }
    return out;
  }

  private async post(path: string, payload: unknown, signal?: AbortSignal): Promise<Response> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        ...(signal ? { signal } : {}),
      });
      if (!res.ok) {
        throw new UnavailableError(`Ollama ${path} failed: HTTP ${res.status}`, {
          details: { status: res.status },
        });
      }
      return res;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new TimeoutError(`Ollama ${path} aborted`);
      }
      if (e instanceof UnavailableError) throw e;
      throw new UnavailableError(`Ollama ${path} unreachable`, { cause: e });
    }
  }
}

function pruneOptions(input: { temperature?: number; maxTokens?: number }): Record<string, number> {
  const opts: Record<string, number> = {};
  if (input.temperature !== undefined) opts['temperature'] = input.temperature;
  if (input.maxTokens !== undefined) opts['num_predict'] = input.maxTokens;
  return opts;
}

/** Parse a streaming NDJSON body line-by-line. */
export async function* ndjson(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncIterable<unknown> {
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
        if (line) yield JSON.parse(line);
      }
    }
    const rest = buffer.trim();
    if (rest) yield JSON.parse(rest);
  } finally {
    reader.releaseLock();
  }
}
