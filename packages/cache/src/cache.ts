import { TenantContext } from '@ados/tenancy';

/**
 * Cache port. Keys are automatically namespaced by tenant so one tenant can
 * never read another's cached values. The default adapter is in-memory (offline
 * dev / tests); a Redis/Valkey adapter implements the same port in production.
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  /** Get-or-compute with single-flight semantics per key. */
  wrap<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T>;
}

function scoped(key: string): string {
  const ctx = TenantContext.current();
  return `${ctx?.tenantId ?? 'public'}:${key}`;
}

interface Entry {
  value: unknown;
  expiresAt: number | null;
}

/** In-memory, tenant-scoped cache with TTL and single-flight de-duplication. */
export class InMemoryCache implements Cache {
  private readonly store = new Map<string, Entry>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  async get<T>(key: string): Promise<T | undefined> {
    const k = scoped(key);
    const entry = this.store.get(k);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.store.delete(k);
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(scoped(key), {
      value,
      expiresAt: ttlSeconds ? this.now() + ttlSeconds * 1000 : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(scoped(key));
  }

  async wrap<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    const k = scoped(key);
    const existing = this.inflight.get(k);
    if (existing) return existing as Promise<T>;

    const promise = compute()
      .then(async (value) => {
        await this.set(key, value, ttlSeconds);
        return value;
      })
      .finally(() => this.inflight.delete(k));

    this.inflight.set(k, promise);
    return promise;
  }
}
