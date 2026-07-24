import { randomBytes } from 'node:crypto';
import { telemetry } from '@ados/observability';
import type { Principal } from '@ados/security';
import { slugifyTenant } from '../session.js';
import { hashPassword, verifyPassword } from './password.js';
import { hashToken, normalizeEmail, type AuthUser, type CredentialStore } from './credential-store.js';

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'weak_password'
  | 'wrong_password'
  | 'invalid_token'
  | 'email_taken'
  | 'not_found';

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; code: AuthErrorCode; message: string };

export type AuthEvent =
  | 'login.succeeded'
  | 'login.failed'
  | 'logout'
  | 'register.succeeded'
  | 'register.failed'
  | 'password.changed'
  | 'reset.requested'
  | 'reset.completed'
  | 'reset.failed';

/** Sink for authentication audit events. */
export interface AuthAudit {
  record(event: AuthEvent, detail: { email?: string; tenantId?: string; reason?: string }): void;
}

/** Default audit sink — a structured, tamper-evident log line per event. */
export function loggerAudit(): AuthAudit {
  const tele = telemetry('web.auth');
  return {
    record(event, detail) {
      tele.logger.info({ authEvent: event, ...detail }, 'auth audit');
      // Metric names must be [a-zA-Z_:][a-zA-Z0-9_:]* — dots are not allowed.
      tele.count(`auth_${event.replace(/\./g, '_')}`);
    },
  };
}

const MIN_PASSWORD_LENGTH = 8;
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Production authentication at the application boundary. Verifies email/password
 * against a {@link CredentialStore} using Argon2id, resolves the tenant and RBAC
 * roles for the authenticated user, and audits every event. Contains no domain
 * logic and touches no business module.
 */
export class AuthService {
  constructor(
    private readonly store: CredentialStore,
    private readonly audit: AuthAudit = loggerAudit(),
  ) {}

  /** Provision a user (sign-up / seeding). First user of a tenant is the owner. */
  async register(input: { email: string; password: string; company: string; name?: string; roles?: string[] }): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    if (!email.includes('@')) return this.fail('register.failed', 'invalid_credentials', 'A valid email is required.', { email });
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return this.fail('register.failed', 'weak_password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, { email });
    }
    if (await this.store.findByEmail(email)) {
      return this.fail('register.failed', 'email_taken', 'An account with this email already exists.', { email });
    }
    const tenantId = slugifyTenant(input.company);
    const user: AuthUser = {
      email,
      tenantId,
      name: input.name?.trim() || email,
      passwordHash: await hashPassword(input.password),
      roles: input.roles && input.roles.length ? input.roles : ['owner'],
    };
    await this.store.save(user);
    this.audit.record('register.succeeded', { email, tenantId });
    return { ok: true, user };
  }

  /** Verify credentials. Failures are deliberately indistinguishable to the caller. */
  async login(email: string, password: string): Promise<AuthResult> {
    const key = normalizeEmail(email);
    const user = await this.store.findByEmail(key);
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      this.audit.record('login.failed', { email: key, reason: user ? 'bad_password' : 'no_user' });
      return { ok: false, code: 'invalid_credentials', message: 'Incorrect email or password.' };
    }
    this.audit.record('login.succeeded', { email: key, tenantId: user.tenantId });
    return { ok: true, user };
  }

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    const user = await this.store.findByEmail(email);
    if (!user) return this.fail('reset.failed', 'not_found', 'Account not found.', { email: normalizeEmail(email) });
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      return this.fail('reset.failed', 'wrong_password', 'Your current password is incorrect.', { email: user.email });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return this.fail('reset.failed', 'weak_password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, { email: user.email });
    }
    await this.store.save({ ...user, passwordHash: await hashPassword(newPassword) });
    this.audit.record('password.changed', { email: user.email, tenantId: user.tenantId });
    return { ok: true, user };
  }

  /** Begin a local password reset. Returns a one-time token when the account
   * exists (surfaced locally — never emailed); null otherwise, without leaking
   * whether the account exists. */
  async requestReset(email: string): Promise<string | null> {
    const key = normalizeEmail(email);
    const user = await this.store.findByEmail(key);
    this.audit.record('reset.requested', { email: key });
    if (!user) return null;
    const token = randomBytes(24).toString('base64url');
    await this.store.setResetToken(key, hashToken(token), Date.now() + RESET_TTL_MS);
    return token;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<AuthResult> {
    const key = normalizeEmail(email);
    const user = await this.store.findByEmail(key);
    const stored = await this.store.readResetToken(key);
    // A wrong token does NOT consume the pending one (defended by 192-bit entropy
    // + a 1-hour expiry); only a successful reset invalidates it.
    if (!user || !stored || stored.expiresAt < Date.now() || stored.tokenHash !== hashToken(token)) {
      return this.fail('reset.failed', 'invalid_token', 'This reset link is invalid or has expired.', { email: key });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return this.fail('reset.failed', 'weak_password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, { email: key });
    }
    await this.store.save({ ...user, passwordHash: await hashPassword(newPassword) });
    await this.store.clearResetToken(key);
    this.audit.record('reset.completed', { email: key, tenantId: user.tenantId });
    return { ok: true, user };
  }

  logout(detail: { email: string; tenantId: string }): void {
    this.audit.record('logout', detail);
  }

  /** Resolve the RBAC principal (tenant + roles) for an authenticated user. */
  principalOf(user: AuthUser): Principal {
    return { id: user.email, tenantId: user.tenantId, kind: 'user', roles: [...user.roles] };
  }

  private fail(event: AuthEvent, code: AuthErrorCode, message: string, detail: { email?: string }): AuthResult {
    this.audit.record(event, { ...detail, reason: code });
    return { ok: false, code, message };
  }
}
