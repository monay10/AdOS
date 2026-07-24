import { createHash } from 'node:crypto';
import type { Migration, QueryExecutor } from '@ados/persistence';

/** A stored user credential. Passwords are never stored in plain text. */
export interface AuthUser {
  email: string;
  tenantId: string;
  name: string;
  passwordHash: string;
  roles: string[];
}

interface ResetToken {
  tokenHash: string;
  expiresAt: number; // epoch ms
}

/**
 * The credential store — the persistence port for authentication. Deliberately
 * NOT tenant-scoped: email is the global identity used to resolve a user (and
 * therefore their tenant) at login, before any tenant context exists.
 */
export interface CredentialStore {
  findByEmail(email: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<void>;
  setResetToken(email: string, tokenHash: string, expiresAt: number): Promise<void>;
  /** Read the pending reset token without consuming it. */
  readResetToken(email: string): Promise<ResetToken | null>;
  /** Invalidate the pending reset token (called only after a successful reset). */
  clearResetToken(email: string): Promise<void>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** In-memory credential store — the default (dev/tests). */
export class InMemoryCredentialStore implements CredentialStore {
  private readonly users = new Map<string, AuthUser>();
  private readonly resets = new Map<string, ResetToken>();

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(normalizeEmail(email)) ?? null;
  }

  async save(user: AuthUser): Promise<void> {
    this.users.set(normalizeEmail(user.email), { ...user, email: normalizeEmail(user.email), roles: [...user.roles] });
  }

  async setResetToken(email: string, tokenHash: string, expiresAt: number): Promise<void> {
    this.resets.set(normalizeEmail(email), { tokenHash, expiresAt });
  }

  async readResetToken(email: string): Promise<ResetToken | null> {
    return this.resets.get(normalizeEmail(email)) ?? null;
  }

  async clearResetToken(email: string): Promise<void> {
    this.resets.delete(normalizeEmail(email));
  }
}

/** Forward-only migration creating the credential table (portable DDL). */
export function authCredentialsMigration(): Migration {
  return {
    id: '0002_auth_credentials',
    up: async (exec) => {
      await exec.execute(
        `CREATE TABLE IF NOT EXISTS auth_credentials (
           email text PRIMARY KEY,
           tenant_id text NOT NULL,
           name text NOT NULL,
           password_hash text NOT NULL,
           roles text NOT NULL,
           reset_token_hash text,
           reset_expires_at text,
           updated_at text NOT NULL
         )`,
      );
    },
  };
}

/** SQL-backed credential store (production), over the same QueryExecutor as the
 * aggregate store. Runs the portable SQL both database adapters understand. */
export class SqlCredentialStore implements CredentialStore {
  constructor(private readonly exec: QueryExecutor) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const rows = await this.exec.query<{ email: string; tenant_id: string; name: string; password_hash: string; roles: string }>(
      `SELECT email, tenant_id, name, password_hash, roles FROM auth_credentials WHERE email = $1`,
      [normalizeEmail(email)],
    );
    const row = rows[0];
    if (!row) return null;
    return { email: row.email, tenantId: row.tenant_id, name: row.name, passwordHash: row.password_hash, roles: JSON.parse(row.roles) as string[] };
  }

  async save(user: AuthUser): Promise<void> {
    await this.exec.execute(
      `INSERT INTO auth_credentials (email, tenant_id, name, password_hash, roles, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET tenant_id = excluded.tenant_id, name = excluded.name,
             password_hash = excluded.password_hash, roles = excluded.roles, updated_at = excluded.updated_at`,
      [normalizeEmail(user.email), user.tenantId, user.name, user.passwordHash, JSON.stringify(user.roles), new Date().toISOString()],
    );
  }

  async setResetToken(email: string, tokenHash: string, expiresAt: number): Promise<void> {
    await this.exec.execute(
      `UPDATE auth_credentials SET reset_token_hash = $1, reset_expires_at = $2 WHERE email = $3`,
      [tokenHash, String(expiresAt), normalizeEmail(email)],
    );
  }

  async readResetToken(email: string): Promise<ResetToken | null> {
    const rows = await this.exec.query<{ reset_token_hash: string | null; reset_expires_at: string | null }>(
      `SELECT reset_token_hash, reset_expires_at FROM auth_credentials WHERE email = $1`,
      [normalizeEmail(email)],
    );
    const row = rows[0];
    if (!row || !row.reset_token_hash || !row.reset_expires_at) return null;
    return { tokenHash: row.reset_token_hash, expiresAt: Number(row.reset_expires_at) };
  }

  async clearResetToken(email: string): Promise<void> {
    await this.exec.execute(
      `UPDATE auth_credentials SET reset_token_hash = NULL, reset_expires_at = NULL WHERE email = $1`,
      [normalizeEmail(email)],
    );
  }
}
