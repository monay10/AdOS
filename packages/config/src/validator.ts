import { isProductionLike, type Profile } from './profiles.js';

export type SubsystemName =
  | 'environment'
  | 'secret'
  | 'port'
  | 'database'
  | 'storage'
  | 'minio'
  | 'nats'
  | 'redis'
  | 'ollama'
  | 'worker';

export interface SubsystemStatus {
  readonly name: SubsystemName;
  readonly ok: boolean;
  readonly configured: boolean;
  readonly required: boolean;
  readonly issues: string[];
  readonly detail: string;
}

export interface StartupReport {
  readonly profile: Profile;
  readonly status: 'valid' | 'invalid';
  readonly subsystems: SubsystemStatus[];
  readonly errors: string[];
  readonly warnings: string[];
  readonly generatedAt: string;
}

/** Thrown by fail-fast startup when the configuration is invalid. */
export class ConfigurationError extends Error {
  constructor(readonly report: StartupReport) {
    super(`Invalid configuration for profile "${report.profile}":\n${report.errors.map((e) => `  - ${e}`).join('\n')}`);
    this.name = 'ConfigurationError';
  }
}

type Flat = Record<string, string>;

const has = (flat: Flat, key: string): boolean => typeof flat[key] === 'string' && flat[key]!.length > 0;
const isUrl = (v: string | undefined): boolean => {
  if (!v) return false;
  try {
    // eslint-disable-next-line no-new
    new URL(v);
    return true;
  } catch {
    return false;
  }
};
const port = (v: string | undefined): number | null => {
  if (v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 65_535 ? n : null;
};

/**
 * ConfigurationValidator — turns a merged flat config + profile into a
 * per-subsystem startup report. Each subsystem is validated for presence and
 * format; whether it is *required* depends on the profile. Nothing here reaches
 * out over the network — it validates configuration, deterministically and
 * offline, so startup can fail fast. Live reachability is a deploy-time probe.
 */
export class ConfigurationValidator {
  validate(flat: Flat, profile: Profile): StartupReport {
    const prod = isProductionLike(profile);
    const subsystems: SubsystemStatus[] = [
      this.environment(flat),
      this.secret(flat, prod),
      this.port(flat),
      this.database(flat, prod),
      this.storage(flat, prod),
      this.minio(flat, prod),
      this.nats(flat, prod),
      this.redis(flat),
      this.ollama(flat, profile),
      this.worker(flat),
    ];

    const errors: string[] = [];
    const warnings: string[] = [];
    for (const s of subsystems) {
      if (!s.ok) for (const issue of s.issues) errors.push(`${s.name}: ${issue}`);
      // A prod-required subsystem that is unconfigured but otherwise "ok" — warn in dev.
      if (!prod && s.required === false && !s.configured && (s.name === 'database' || s.name === 'nats' || s.name === 'storage')) {
        warnings.push(`${s.name}: not configured — using offline/in-memory mode (development only).`);
      }
    }

    return {
      profile,
      status: errors.length === 0 ? 'valid' : 'invalid',
      subsystems,
      errors,
      warnings,
      generatedAt: new Date().toISOString(),
    };
  }

  private make(name: SubsystemName, opts: { configured: boolean; required: boolean; issues: string[]; detail: string }): SubsystemStatus {
    // A subsystem is OK unless it is required-but-missing, or configured-but-invalid.
    const missingRequired = opts.required && !opts.configured;
    const ok = opts.issues.length === 0 && !missingRequired;
    const issues = missingRequired && opts.issues.length === 0 ? ['required but not configured'] : opts.issues;
    return { name, ok, configured: opts.configured, required: opts.required, issues, detail: opts.detail };
  }

  private environment(flat: Flat): SubsystemStatus {
    const level = flat['LOG_LEVEL'];
    const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    const issues: string[] = [];
    if (level !== undefined && !validLevels.includes(level)) issues.push(`LOG_LEVEL "${level}" is not one of ${validLevels.join(', ')}`);
    return this.make('environment', { configured: true, required: true, issues, detail: `service=${flat['SERVICE_NAME'] ?? 'ados'} logLevel=${level ?? 'info'}` });
  }

  private secret(flat: Flat, prod: boolean): SubsystemStatus {
    const configured = has(flat, 'SESSION_SECRET');
    const issues: string[] = [];
    if (configured && flat['SESSION_SECRET']!.length < 16 && prod) issues.push('SESSION_SECRET is too short (need ≥ 16 chars in production)');
    const provider = flat['SECRETS_PROVIDER'] ?? 'env';
    if (prod && provider === 'env' && !configured) issues.push('no secret provider or SESSION_SECRET set');
    return this.make('secret', { configured, required: prod, issues, detail: `provider=${provider}` });
  }

  private port(flat: Flat): SubsystemStatus {
    const issues: string[] = [];
    const web = flat['PORT'] ?? '4000';
    const metrics = flat['METRICS_PORT'] ?? '9464';
    if (port(web) === null) issues.push(`PORT "${web}" is not a valid port`);
    if (port(metrics) === null) issues.push(`METRICS_PORT "${metrics}" is not a valid port`);
    if (port(web) !== null && web === metrics) issues.push('PORT and METRICS_PORT must differ');
    return this.make('port', { configured: true, required: true, issues, detail: `web=${web} metrics=${metrics}` });
  }

  private database(flat: Flat, prod: boolean): SubsystemStatus {
    const configured = has(flat, 'DATABASE_URL');
    const issues: string[] = [];
    const url = flat['DATABASE_URL'];
    if (configured && !/^postgres(ql)?:\/\//.test(url!)) issues.push('DATABASE_URL must be a postgres:// connection string');
    return this.make('database', { configured, required: prod, issues, detail: configured ? redactUrl(url!) : 'in-memory' });
  }

  private storage(flat: Flat, prod: boolean): SubsystemStatus {
    const configured = has(flat, 'STORAGE_ENDPOINT');
    const issues: string[] = [];
    if (configured) {
      if (!has(flat, 'STORAGE_ACCESS_KEY')) issues.push('STORAGE_ACCESS_KEY is required when storage is configured');
      if (!has(flat, 'STORAGE_SECRET_KEY')) issues.push('STORAGE_SECRET_KEY is required when storage is configured');
    }
    return this.make('storage', { configured, required: prod, issues, detail: `bucket=${flat['STORAGE_BUCKET'] ?? 'ados'}` });
  }

  private minio(flat: Flat, prod: boolean): SubsystemStatus {
    const configured = has(flat, 'STORAGE_ENDPOINT');
    const issues: string[] = [];
    if (configured && !isUrl(flat['STORAGE_ENDPOINT'])) issues.push('STORAGE_ENDPOINT must be a valid URL');
    return this.make('minio', { configured, required: prod, issues, detail: configured ? redactUrl(flat['STORAGE_ENDPOINT']!) : '—' });
  }

  private nats(flat: Flat, prod: boolean): SubsystemStatus {
    const configured = has(flat, 'NATS_URL');
    const issues: string[] = [];
    if (configured && !/^(nats|tls|ws|wss):\/\//.test(flat['NATS_URL']!) && !isUrl(flat['NATS_URL'])) issues.push('NATS_URL must be a valid nats:// URL');
    return this.make('nats', { configured, required: prod, issues, detail: configured ? redactUrl(flat['NATS_URL']!) : 'in-process' });
  }

  private redis(flat: Flat): SubsystemStatus {
    const enabled = flat['REDIS_ENABLED'] === 'true' || has(flat, 'REDIS_URL');
    const configured = has(flat, 'REDIS_URL');
    const issues: string[] = [];
    if (enabled && configured && !isUrl(flat['REDIS_URL'])) issues.push('REDIS_URL must be a valid URL');
    return this.make('redis', { configured, required: enabled, issues, detail: enabled ? (configured ? redactUrl(flat['REDIS_URL']!) : 'enabled') : 'disabled' });
  }

  private ollama(flat: Flat, profile: Profile): SubsystemStatus {
    const engine = flat['INFERENCE_PRIMARY'] ?? 'ollama';
    const url = flat['OLLAMA_URL'] ?? 'http://localhost:11434';
    const configured = has(flat, 'OLLAMA_URL');
    const issues: string[] = [];
    if (!isUrl(url)) issues.push(`OLLAMA_URL "${url}" is not a valid URL`);
    // Required only when Ollama is the primary engine in a production-like profile.
    const required = isProductionLike(profile) && engine === 'ollama';
    return this.make('ollama', { configured: configured || engine === 'ollama', required, issues, detail: `engine=${engine} url=${url}` });
  }

  private worker(flat: Flat): SubsystemStatus {
    const issues: string[] = [];
    const concurrency = flat['WORKER_CONCURRENCY'];
    if (concurrency !== undefined && !(Number.isInteger(Number(concurrency)) && Number(concurrency) > 0)) issues.push('WORKER_CONCURRENCY must be a positive integer');
    const lease = flat['WORKER_LEASE_MS'];
    if (lease !== undefined && !(Number.isInteger(Number(lease)) && Number(lease) > 0)) issues.push('WORKER_LEASE_MS must be a positive integer');
    return this.make('worker', { configured: concurrency !== undefined, required: false, issues, detail: `concurrency=${concurrency ?? '4 (default)'}` });
  }
}

/** Strip credentials from a URL for safe display. */
export function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    if (u.username) u.username = '***';
    return u.toString();
  } catch {
    return url;
  }
}
