import { readFileSync, readdirSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BruteForceGuard } from '@ados/security';
import { App } from './app.js';
import { buildServer } from './server.js';
import { AuthService } from './auth/auth-service.js';
import { InMemoryCredentialStore } from './auth/credential-store.js';

const SRC = join(process.cwd(), 'src');
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  const store = new InMemoryCredentialStore();
  const service = new AuthService(store, { record: () => {} });
  await service.register({ email: 'user@acme.com', password: 'correct-horse-battery', company: 'Acme Co' });
  const app = new App();
  await app.start();
  // A low threshold so the brute-force test locks quickly and deterministically.
  const { server } = buildServer({ sessionSecret: 'sec', app, auth: { service, secureCookies: false, bruteForce: new BruteForceGuard(2, 60_000, 60_000) } });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});
afterAll(async () => { await close(); });

async function post(path: string, body: Record<string, string>): Promise<Response> {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
    redirect: 'manual',
  });
}

describe('Security headers', () => {
  it('sets defence-in-depth headers on every response', async () => {
    const r = await fetch(`${base}/login`);
    expect(r.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(r.headers.get('content-security-policy')).toContain("frame-ancestors 'none'"); // clickjacking
    expect(r.headers.get('x-frame-options')).toBe('DENY');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(r.headers.get('referrer-policy')).toBe('no-referrer');
    expect(r.headers.get('permissions-policy')).toContain('geolocation=()');
  });

  it('applies to ops/health responses too', async () => {
    const r = await fetch(`${base}/livez`);
    expect(r.headers.get('x-frame-options')).toBe('DENY');
  });
});

describe('XSS — output encoding', () => {
  it('escapes untrusted input reflected onto the page', async () => {
    const r = await post('/login', { email: '<script>alert(1)</script>', password: 'nope' });
    const html = await r.text();
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;'); // escaped
  });
});

describe('Brute-force protection', () => {
  it('locks the account after repeated failures (429 + Retry-After)', async () => {
    expect((await post('/login', { email: 'user@acme.com', password: 'wrong1' })).status).toBe(401);
    expect((await post('/login', { email: 'user@acme.com', password: 'wrong2' })).status).toBe(401);
    const locked = await post('/login', { email: 'user@acme.com', password: 'wrong3' });
    expect(locked.status).toBe(429);
    expect(locked.headers.get('retry-after')).toBeTruthy();
    // Even the correct password is refused while locked.
    expect((await post('/login', { email: 'user@acme.com', password: 'correct-horse-battery' })).status).toBe(429);
  });
});

describe('Static security scan (request surface)', () => {
  it('contains no dynamic code execution or shell in apps/web/src', () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
          const src = readFileSync(full, 'utf8');
          if (/\beval\s*\(|child_process|\bnew Function\s*\(/.test(src)) offenders.push(full);
        }
      }
    };
    walk(SRC);
    expect(offenders).toEqual([]);
  });
});
