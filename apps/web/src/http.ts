import type { IncomingMessage, ServerResponse } from 'node:http';

/** Parsed request the handlers work with. */
export interface Req {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: IncomingMessage['headers'];
  /** Parsed form / JSON body as a flat string map. */
  body: Record<string, string>;
  raw: IncomingMessage;
}

export interface Res {
  html(body: string, status?: number): void;
  json(data: unknown, status?: number): void;
  redirect(location: string, cookie?: string): void;
  setCookie(cookie: string): void;
  raw: ServerResponse;
}

const MAX_BODY = 1_000_000; // 1MB guard against oversized requests

export async function parseRequest(raw: IncomingMessage): Promise<Req> {
  const url = new URL(raw.url ?? '/', 'http://localhost');
  const method = (raw.method ?? 'GET').toUpperCase();
  const body = method === 'POST' || method === 'PUT' || method === 'PATCH' ? await readBody(raw) : {};
  return { method, path: url.pathname, query: url.searchParams, headers: raw.headers, body, raw };
}

export function makeRes(raw: ServerResponse): Res {
  const cookies: string[] = [];
  const applyCookies = (): void => {
    if (cookies.length) raw.setHeader('Set-Cookie', cookies);
  };
  return {
    raw,
    setCookie(cookie: string) {
      cookies.push(cookie);
    },
    html(bodyStr: string, status = 200) {
      applyCookies();
      raw.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
      raw.end(bodyStr);
    },
    json(data: unknown, status = 200) {
      applyCookies();
      raw.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      raw.end(JSON.stringify(data));
    },
    redirect(location: string, cookie?: string) {
      if (cookie) cookies.push(cookie);
      applyCookies();
      raw.writeHead(303, { Location: location });
      raw.end();
    },
  };
}

async function readBody(raw: IncomingMessage): Promise<Record<string, string>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of raw) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error('Request body too large');
    chunks.push(chunk as Buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  const contentType = raw.headers['content-type'] ?? '';
  if (contentType.includes('application/json')) {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v ?? '')]));
  }
  // default: application/x-www-form-urlencoded
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  for (const [k, v] of params) out[k] = v;
  return out;
}
