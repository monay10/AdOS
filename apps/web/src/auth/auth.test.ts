import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { App } from '../app.js';
import { buildServer } from '../server.js';
import { decodeSession, encodeSession, newSession, sessionSetCookie, type Session } from '../session.js';
import { SqliteDatabase } from '@ados/persistence';
import { AuthService, loggerAudit, type AuthAudit, type AuthEvent } from './auth-service.js';
import { authCredentialsMigration, hashToken, InMemoryCredentialStore, SqlCredentialStore } from './credential-store.js';
import { hashPassword, verifyPassword } from './password.js';

const SECRET = 'auth-test-secret';
const PW = 'correct-horse-battery';

const events: AuthEvent[] = [];
const audit: AuthAudit = { record: (event) => events.push(event) };

let store: InMemoryCredentialStore;
let service: AuthService;
let base: string;
let baseSecure: string;
let close: () => Promise<void>;

beforeAll(async () => {
  store = new InMemoryCredentialStore();
  service = new AuthService(store, audit);
  // Seed users directly (no HTTP) so login/change/reset tests have accounts.
  await service.register({ email: 'owner@acme.com', password: PW, company: 'Acme Co' });
  await service.register({ email: 'change@acme.com', password: PW, company: 'Acme Co' });
  await service.register({ email: 'reset@acme.com', password: PW, company: 'Acme Co' });

  const app = new App();
  await app.start();
  const insecure = buildServer({ sessionSecret: SECRET, app, auth: { service, secureCookies: false } });
  const secure = buildServer({ sessionSecret: SECRET, app, auth: { service, secureCookies: true } });
  await new Promise<void>((r) => insecure.server.listen(0, r));
  await new Promise<void>((r) => secure.server.listen(0, r));
  base = `http://localhost:${(insecure.server.address() as AddressInfo).port}`;
  baseSecure = `http://localhost:${(secure.server.address() as AddressInfo).port}`;
  close = async () => {
    await new Promise<void>((r) => insecure.server.close(() => r()));
    await new Promise<void>((r) => secure.server.close(() => r()));
  };
});

afterAll(async () => {
  await close();
});

function client(origin = base) {
  let cookie = '';
  return {
    lastSetCookie: '' as string | null,
    async req(method: string, path: string, body?: Record<string, string>) {
      const headers: Record<string, string> = {};
      if (cookie) headers['cookie'] = cookie;
      let payload: string | undefined;
      if (body) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        payload = new URLSearchParams(body).toString();
      }
      const res = await fetch(`${origin}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
      this.lastSetCookie = res.headers.get('set-cookie');
      if (this.lastSetCookie) cookie = this.lastSetCookie.split(';')[0]!;
      return res;
    },
  };
}

/** Decode the signed session out of a Set-Cookie header. */
function sessionFromCookie(setCookie: string | null): Session | null {
  if (!setCookie) return null;
  const value = setCookie.split(';')[0]!.split('=').slice(1).join('=');
  return decodeSession(decodeURIComponent(value), SECRET);
}

describe('Default audit sink', () => {
  it('records every event type without throwing (valid metric names)', () => {
    const sink = loggerAudit();
    const all: AuthEvent[] = ['login.succeeded', 'login.failed', 'logout', 'register.succeeded', 'register.failed', 'password.changed', 'reset.requested', 'reset.completed', 'reset.failed'];
    for (const e of all) expect(() => sink.record(e, { email: 'a@b.com', tenantId: 't' })).not.toThrow();
  });
});

describe('Password hashing (Argon2id)', () => {
  it('hashes and verifies, and rejects wrong or malformed input', async () => {
    const hash = await hashPassword('s3cret-password');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, 's3cret-password')).toBe(true);
    expect(await verifyPassword(hash, 'wrong')).toBe(false);
    expect(await verifyPassword('not-a-hash', 's3cret-password')).toBe(false);
  });
});

describe('SqlCredentialStore (embedded SQL)', () => {
  it('round-trips users and reset tokens through SQL', async () => {
    const db = new SqliteDatabase(':memory:');
    await authCredentialsMigration().up(db);
    const sql = new SqlCredentialStore(db);

    await sql.save({ email: 'Owner@Acme.com', tenantId: 'acme', name: 'Owner', passwordHash: 'hash', roles: ['owner', 'admin'] });
    const found = await sql.findByEmail('owner@acme.com'); // email normalised
    expect(found?.tenantId).toBe('acme');
    expect(found?.roles).toEqual(['owner', 'admin']);
    expect(await sql.findByEmail('missing@acme.com')).toBeNull();

    await sql.setResetToken('owner@acme.com', hashToken('tok'), Date.now() + 1000);
    expect((await sql.readResetToken('owner@acme.com'))?.tokenHash).toBe(hashToken('tok'));
    await sql.clearResetToken('owner@acme.com');
    expect(await sql.readResetToken('owner@acme.com')).toBeNull();
    await db.close();
  });
});

describe('Authentication (password mode) — HTTP surface', () => {
  it('requires a session for protected routes', async () => {
    const r = await client().req('GET', '/dashboard');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login');
  });

  it('renders a password login form', async () => {
    const html = await (await client().req('GET', '/login')).text();
    expect(html).toContain('type="password"');
    expect(html).toContain('Remember me');
    expect(html).toContain('Create account');
  });

  it('rejects wrong credentials and does not establish a session', async () => {
    const c = client();
    const r = await c.req('POST', '/login', { email: 'owner@acme.com', password: 'nope' });
    expect(r.status).toBe(401);
    expect(await r.text()).toContain('Incorrect email or password');
    expect(events).toContain('login.failed');
    expect((await c.req('GET', '/dashboard')).status).toBe(303); // still no session
  });

  it('signs in with correct credentials and resolves tenant + roles + expiry + csrf', async () => {
    const c = client();
    const r = await c.req('POST', '/login', { email: 'owner@acme.com', password: PW });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/dashboard');
    expect(events).toContain('login.succeeded');

    const setCookie = c.lastSetCookie!;
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Max-Age=86400'); // default (no remember)
    expect(setCookie).not.toContain('Secure'); // secureCookies:false

    const session = sessionFromCookie(setCookie)!;
    expect(session.tenantId).toBe('acme-co'); // tenant resolved from the user, not typed at login
    expect(session.actor).toBe('owner@acme.com');
    expect(session.roles).toEqual(['owner']); // RBAC role resolution
    expect(session.exp).toBeGreaterThan(Math.floor(Date.now() / 1000)); // session expiration set
    expect(session.csrf).toBeTruthy();

    // The authenticated dashboard renders for the resolved tenant.
    const dash = await (await c.req('GET', '/dashboard')).text();
    expect(dash).toContain('Tenant: acme-co');
  });

  it('honours "remember me" with a 30-day cookie', async () => {
    const c = client();
    await c.req('POST', '/login', { email: 'owner@acme.com', password: PW, remember: '1' });
    expect(c.lastSetCookie).toContain('Max-Age=2592000');
  });

  it('emits the Secure flag when configured', async () => {
    const c = client(baseSecure);
    await c.req('POST', '/login', { email: 'owner@acme.com', password: PW });
    expect(c.lastSetCookie).toContain('; Secure');
  });

  it('rejects an expired session cookie', async () => {
    const expired: Session = { tenantId: 'acme-co', actor: 'owner@acme.com', correlationId: 'x', exp: Math.floor(Date.now() / 1000) - 5 };
    const cookie = `ados_session=${encodeURIComponent(encodeSession(expired, SECRET))}`;
    const r = await fetch(`${base}/dashboard`, { headers: { cookie }, redirect: 'manual' });
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('/login');
  });

  it('registers a new account (auto sign-in) and rejects duplicates + weak passwords', async () => {
    const c = client();
    const ok = await c.req('POST', '/register', { email: 'new@acme.com', company: 'New Co', password: 'a-strong-pass' });
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe('/dashboard');
    expect(sessionFromCookie(c.lastSetCookie)!.tenantId).toBe('new-co');

    const dup = await client().req('POST', '/register', { email: 'owner@acme.com', company: 'Acme Co', password: 'a-strong-pass' });
    expect(dup.status).toBe(400);
    expect(await dup.text()).toContain('already exists');

    const weak = await client().req('POST', '/register', { email: 'weak@acme.com', company: 'Weak Co', password: 'short' });
    expect(weak.status).toBe(400);
    expect(await weak.text()).toContain('at least 8 characters');
  });

  it('enforces CSRF on logout, then clears the session', async () => {
    const c = client();
    await c.req('POST', '/login', { email: 'owner@acme.com', password: PW });
    const csrf = sessionFromCookie(c.lastSetCookie)!.csrf!;

    const noCsrf = await c.req('POST', '/logout', {});
    expect(noCsrf.status).toBe(403);

    const good = await c.req('POST', '/logout', { _csrf: csrf });
    expect(good.status).toBe(303);
    expect(good.headers.get('location')).toBe('/login');
    expect(good.headers.get('set-cookie')).toContain('Max-Age=0'); // cleared
    expect(events).toContain('logout');
  });

  it('changes a password (CSRF-protected, verifies current)', async () => {
    const c = client();
    await c.req('POST', '/login', { email: 'change@acme.com', password: PW });
    const csrf = sessionFromCookie(c.lastSetCookie)!.csrf!;

    // Wrong CSRF → 403.
    expect((await c.req('POST', '/account/password', { current: PW, next: 'brand-new-pass', _csrf: 'bad' })).status).toBe(403);
    // Wrong current password → 400.
    expect((await c.req('POST', '/account/password', { current: 'wrong', next: 'brand-new-pass', _csrf: csrf })).status).toBe(400);
    // Correct → 200 + updated.
    const okRes = await c.req('POST', '/account/password', { current: PW, next: 'brand-new-pass', _csrf: csrf });
    expect(okRes.status).toBe(200);
    expect(await okRes.text()).toContain('password was updated');
    expect(events).toContain('password.changed');

    // New password works; old does not.
    expect((await service.login('change@acme.com', 'brand-new-pass')).ok).toBe(true);
    expect((await service.login('change@acme.com', PW)).ok).toBe(false);
  });

  it('runs the local password-reset flow end to end', async () => {
    // Request a reset — the one-time link is surfaced locally.
    const forgot = await (await client().req('POST', '/forgot', { email: 'reset@acme.com' })).text();
    const link = /href="(\/reset\?[^"]+)"/.exec(forgot.replace(/&amp;/g, '&'))?.[1];
    expect(link).toBeTruthy();
    expect(events).toContain('reset.requested');

    const url = new URL(`http://x${link}`);
    const email = url.searchParams.get('email')!;
    const token = url.searchParams.get('token')!;

    // A bad token is rejected.
    expect((await client().req('POST', '/reset', { email, token: 'bogus', password: 'another-pass' })).status).toBe(400);

    // The real token resets the password.
    const done = await client().req('POST', '/reset', { email, token, password: 'reset-done-pass' });
    expect(done.status).toBe(200);
    expect(await done.text()).toContain('password was updated');
    expect(events).toContain('reset.completed');
    expect((await service.login('reset@acme.com', 'reset-done-pass')).ok).toBe(true);
  });

  it('does not leak whether an unknown account exists on reset', async () => {
    const r = await client().req('POST', '/forgot', { email: 'ghost@nowhere.com' });
    const html = await r.text();
    expect(html).not.toContain('/reset?'); // no link for a non-existent account
  });
});
