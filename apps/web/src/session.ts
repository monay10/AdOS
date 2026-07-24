import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

/**
 * A signed, cookie-borne session. Keeps the current tenant + actor (set at
 * login) plus the workspace/client the onboarding wizard is currently working
 * in, so each step can scope the next. Signed with an HMAC so the cookie cannot
 * be tampered with; it is NOT encrypted, so no secret data goes in it.
 */
export interface Session {
  tenantId: string;
  actor: string;
  correlationId: string;
  workspaceId?: string;
  clientId?: string;
  /** RBAC roles resolved at login (empty in open/dev mode). */
  roles?: string[];
  /** Absolute expiry, epoch seconds. Enforced server-side on every request. */
  exp?: number;
  /** Per-session CSRF token, embedded in authenticated forms. */
  csrf?: string;
}

const COOKIE = 'ados_session';
const DEFAULT_TTL_SECONDS = 86_400; // 24h

export function slugifyTenant(company: string): string {
  const slug = company
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'public';
}

export function newSession(
  tenantId: string,
  actor: string,
  opts: { roles?: string[]; ttlSeconds?: number } = {},
): Session {
  const exp = Math.floor(Date.now() / 1000) + (opts.ttlSeconds ?? DEFAULT_TTL_SECONDS);
  return {
    tenantId,
    actor,
    correlationId: randomUUID(),
    roles: opts.roles ?? [],
    exp,
    csrf: randomUUID(),
  };
}

export function encodeSession(session: Session, secret: string): string {
  const body = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const sig = sign(body, secret);
  return `${body}.${sig}`;
}

export function decodeSession(raw: string | undefined, secret: string): Session | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(body, secret);
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Session;
    if (!parsed.tenantId || !parsed.actor) return null;
    // Enforce absolute session expiry server-side (not just via cookie Max-Age).
    if (typeof parsed.exp === 'number' && parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Parse the session cookie out of a raw Cookie header. */
export function readSessionCookie(cookieHeader: string | undefined, secret: string): Session | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return decodeSession(decodeURIComponent(rest.join('=')), secret);
  }
  return null;
}

export function sessionSetCookie(
  session: Session,
  secret: string,
  opts: { secure?: boolean; maxAgeSeconds?: number } = {},
): string {
  const value = encodeSession(session, secret);
  const maxAge = opts.maxAgeSeconds ?? DEFAULT_TTL_SECONDS;
  const flags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${opts.secure ? '; Secure' : ''}`;
  return `${COOKIE}=${encodeURIComponent(value)}; ${flags}`;
}

export function sessionClearCookie(opts: { secure?: boolean } = {}): string {
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${opts.secure ? '; Secure' : ''}`;
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
