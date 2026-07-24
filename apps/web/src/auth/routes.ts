import { timingSafeEqual } from 'node:crypto';
import { BruteForceGuard } from '@ados/security';
import type { Req, Res } from '../http.js';
import {
  newSession,
  readSessionCookie,
  sessionClearCookie,
  sessionSetCookie,
  type Session,
} from '../session.js';
import type { AuthService } from './auth-service.js';
import { authLoginPage, authRegisterPage, changePasswordPage, forgotPage, resetPage } from './pages.js';

/** Password-mode authentication config, passed from the composition root. */
export interface AuthGateway {
  service: AuthService;
  /** Emit the `Secure` cookie flag (true behind HTTPS in production). */
  secureCookies: boolean;
  /** Brute-force guard for credential endpoints (a default is used if omitted). */
  bruteForce?: BruteForceGuard;
}

const DAY = 86_400;
const REMEMBER_TTL = 30 * DAY;

/** Process-wide default: lock a (ip, email) pair after 5 failures for 15 minutes. */
const defaultBruteForceGuard = new BruteForceGuard();

function loginKey(req: Req, email: string): string {
  const ip = req.raw.socket.remoteAddress ?? 'unknown';
  return `${ip}:${email.toLowerCase()}`;
}

/**
 * Handle the password-mode authentication surface. Returns true when it has
 * handled the request (so the caller stops); false to fall through to the
 * authenticated application routes. Contains no business logic.
 */
export async function handleAuth(secret: string, gateway: AuthGateway, session: Session | null, req: Req, res: Res): Promise<boolean> {
  const { path, method } = req;
  const secure = gateway.secureCookies;

  if (path === '/login' && method === 'GET') {
    if (session) res.redirect('/dashboard');
    else res.html(authLoginPage());
    return true;
  }
  if (path === '/login' && method === 'POST') {
    const email = (req.body['email'] ?? '').trim();
    const guard = gateway.bruteForce ?? defaultBruteForceGuard;
    const key = loginKey(req, email);
    // Brute-force protection: refuse further attempts once locked.
    const locked = guard.status(key);
    if (locked.locked) {
      res.raw.setHeader('Retry-After', String(Math.ceil(locked.retryAfterMs / 1000)));
      res.html(authLoginPage('Too many failed attempts. Please try again later.', { email }), 429);
      return true;
    }
    const result = await gateway.service.login(email, req.body['password'] ?? '');
    if (!result.ok) {
      guard.fail(key);
      res.html(authLoginPage(result.message, { email }), 401);
      return true;
    }
    guard.reset(key); // successful login clears the counter
    startSession(res, secret, secure, result.user, req.body['remember'] === '1');
    return true;
  }

  if (path === '/register' && method === 'GET') {
    if (session) res.redirect('/dashboard');
    else res.html(authRegisterPage());
    return true;
  }
  if (path === '/register' && method === 'POST') {
    const result = await gateway.service.register({
      email: (req.body['email'] ?? '').trim(),
      company: (req.body['company'] ?? '').trim(),
      password: req.body['password'] ?? '',
    });
    if (!result.ok) {
      res.html(authRegisterPage(result.message, req.body), 400);
      return true;
    }
    startSession(res, secret, secure, result.user, false);
    return true;
  }

  if (path === '/forgot' && method === 'GET') {
    res.html(forgotPage());
    return true;
  }
  if (path === '/forgot' && method === 'POST') {
    const email = (req.body['email'] ?? '').trim();
    const token = await gateway.service.requestReset(email);
    // Local-only: no email is sent; the one-time link is shown on screen when the
    // account exists. The generic copy avoids leaking whether it does.
    const resetLink = token ? `/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}` : undefined;
    res.html(forgotPage(undefined, { email }, resetLink));
    return true;
  }

  if (path === '/reset' && method === 'GET') {
    const email = req.query.get('email') ?? '';
    const token = req.query.get('token') ?? '';
    if (!email || !token) res.redirect('/forgot');
    else res.html(resetPage(email, token));
    return true;
  }
  if (path === '/reset' && method === 'POST') {
    const email = (req.body['email'] ?? '').trim();
    const token = req.body['token'] ?? '';
    const result = await gateway.service.resetPassword(email, token, req.body['password'] ?? '');
    if (!result.ok) {
      res.html(resetPage(email, token, result.message), 400);
      return true;
    }
    res.html(authLoginPage(undefined, { email }, 'Your password was updated — please sign in.'));
    return true;
  }

  if (path === '/logout' && method === 'POST') {
    if (session && !csrfOk(session, req)) {
      res.html('<h1>403 — invalid CSRF token</h1>', 403);
      return true;
    }
    if (session) gateway.service.logout({ email: session.actor, tenantId: session.tenantId });
    res.redirect('/login', sessionClearCookie({ secure }));
    return true;
  }

  if (path === '/account/password') {
    if (!session) {
      res.redirect('/login');
      return true;
    }
    if (method === 'GET') {
      res.html(changePasswordPage(session));
      return true;
    }
    if (method === 'POST') {
      if (!csrfOk(session, req)) {
        res.html('<h1>403 — invalid CSRF token</h1>', 403);
        return true;
      }
      const result = await gateway.service.changePassword(session.actor, req.body['current'] ?? '', req.body['next'] ?? '');
      if (!result.ok) res.html(changePasswordPage(session, result.message), 400);
      else res.html(changePasswordPage(session, undefined, 'Your password was updated.'));
      return true;
    }
  }

  return false;
}

/** Whether the request carries the session's CSRF token (double-submit). */
export function csrfOk(session: Session, req: Req): boolean {
  const provided = req.body['_csrf'] ?? '';
  const expected = session.csrf ?? '';
  if (!expected || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function startSession(res: Res, secret: string, secure: boolean, user: { email: string; tenantId: string; roles: string[] }, remember: boolean): void {
  const ttl = remember ? REMEMBER_TTL : DAY;
  const session = newSession(user.tenantId, user.email, { roles: user.roles, ttlSeconds: ttl });
  res.redirect('/dashboard', sessionSetCookie(session, secret, { secure, maxAgeSeconds: ttl }));
}

/** Re-exported for the composition root so it can read the current session. */
export { readSessionCookie };
