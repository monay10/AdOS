import { readFileSync } from 'node:fs';

/**
 * A source of flat configuration key/value pairs. Providers are layered by the
 * loader; later providers override earlier ones. This is the ONLY place the
 * platform reads configuration from the outside world — nothing else touches
 * process.env or a config file directly.
 */
export interface ConfigProvider {
  readonly name: string;
  /** Keys this provider carries whose values must be redacted in diagnostics. */
  readonly secretKeys?: ReadonlySet<string>;
  load(): Record<string, string>;
}

/** Environment variables — the primary provider. The single point of env access. */
export class EnvProvider implements ConfigProvider {
  readonly name = 'env';
  constructor(private readonly env: Record<string, string | undefined> = process.env) {}
  load(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.env)) if (v !== undefined) out[k] = v;
    return out;
  }
}

/**
 * A configuration file (JSON object, or dotenv `KEY=value` lines). Used for
 * per-environment defaults checked into the repo or mounted into a container. A
 * missing file is not an error — it simply contributes nothing.
 */
export class FileProvider implements ConfigProvider {
  readonly name: string;
  constructor(
    private readonly path: string,
    private readonly optional = true,
  ) {
    this.name = `file(${path})`;
  }

  load(): Record<string, string> {
    let text: string;
    try {
      text = readFileSync(this.path, 'utf8');
    } catch (e) {
      if (this.optional) return {};
      throw new Error(`Required config file "${this.path}" could not be read: ${(e as Error).message}`);
    }
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
    }
    return parseDotenv(text);
  }
}

/**
 * Secrets from a secret provider (env, mounted file, or an external vault via an
 * injected backing provider). Every key it carries is marked secret so it is
 * redacted in diagnostics and never logged.
 */
export class SecretProvider implements ConfigProvider {
  readonly name = 'secrets';
  readonly secretKeys: ReadonlySet<string>;
  constructor(private readonly backing: ConfigProvider) {
    this.secretKeys = new Set(Object.keys(backing.load()));
  }
  load(): Record<string, string> {
    return this.backing.load();
  }
}

/** In-memory runtime overrides — the highest-precedence layer (feature flags,
 * hot-reloaded values, test fixtures). */
export class RuntimeOverrideProvider implements ConfigProvider {
  readonly name = 'runtime';
  private readonly overrides = new Map<string, string>();
  set(key: string, value: string): this {
    this.overrides.set(key, value);
    return this;
  }
  unset(key: string): this {
    this.overrides.delete(key);
    return this;
  }
  load(): Record<string, string> {
    return Object.fromEntries(this.overrides);
  }
}

function parseDotenv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}
