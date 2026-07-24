import { configSchema, type AppConfig } from './schema.js';
import { isProductionLike, resolveProfile, type Profile } from './profiles.js';
import type { ConfigProvider } from './providers.js';
import { ConfigurationError, ConfigurationValidator, type StartupReport } from './validator.js';

export interface LoadedConfiguration {
  readonly profile: Profile;
  readonly config: AppConfig | null;
  readonly flat: Record<string, string>;
  /** Provider names in precedence order (later overrides earlier). */
  readonly sources: string[];
  readonly secretKeys: ReadonlySet<string>;
  readonly report: StartupReport;
}

export interface ConfigurationLoaderOptions {
  /** Force a profile; otherwise it is resolved from the merged config. */
  readonly profile?: Profile;
  /** Throw a {@link ConfigurationError} when the config is invalid (default true). */
  readonly failFast?: boolean;
  readonly validator?: ConfigurationValidator;
}

/** Schema-satisfying default for an optional-in-practice field. Redis is only
 * used when explicitly enabled, but the base schema always types a url; this
 * default lets the typed config materialise whenever validation passes. */
const BASE_DEFAULTS: Record<string, string> = {
  REDIS_URL: 'redis://localhost:6379',
};

/** Offline defaults used only for non-production profiles so the app can run
 * fully in-memory in development without any infrastructure present. */
const DEV_INFRA_DEFAULTS: Record<string, string> = {
  DATABASE_URL: 'postgres://ados:ados@localhost:5432/ados',
  NATS_URL: 'nats://localhost:4222',
  STORAGE_ENDPOINT: 'http://localhost:9000',
  STORAGE_ACCESS_KEY: 'ados',
  STORAGE_SECRET_KEY: 'ados',
};

/**
 * ConfigurationLoader — layers providers into one flat config, resolves the
 * profile, runs the startup validation, and materialises the typed AppConfig.
 * It is the single entry point the platform uses to obtain configuration; no
 * other code reads the environment or a config file.
 */
export class ConfigurationLoader {
  private readonly validator: ConfigurationValidator;
  private readonly failFast: boolean;
  private readonly forcedProfile: Profile | undefined;

  constructor(
    private readonly providers: ConfigProvider[],
    options: ConfigurationLoaderOptions = {},
  ) {
    this.validator = options.validator ?? new ConfigurationValidator();
    this.failFast = options.failFast ?? true;
    this.forcedProfile = options.profile;
  }

  load(): LoadedConfiguration {
    const flat: Record<string, string> = {};
    const sources: string[] = [];
    const secretKeys = new Set<string>();
    for (const provider of this.providers) {
      sources.push(provider.name);
      for (const [k, v] of Object.entries(provider.load())) flat[k] = v;
      for (const key of provider.secretKeys ?? []) secretKeys.add(key);
    }

    const profile = this.forcedProfile ?? resolveProfile(flat);
    const report = this.validator.validate(flat, profile);
    const config = resolveConfig(flat, profile);

    if (report.status === 'invalid' && this.failFast) throw new ConfigurationError(report);
    return { profile, config, flat, sources, secretKeys, report };
  }
}

function resolveConfig(flat: Record<string, string>, profile: Profile): AppConfig | null {
  const merged = isProductionLike(profile) ? { ...BASE_DEFAULTS, ...flat } : { ...BASE_DEFAULTS, ...DEV_INFRA_DEFAULTS, ...flat };
  const parsed = configSchema.safeParse(prune(toRaw(merged)));
  return parsed.success ? parsed.data : null;
}

/** Map the flat config namespace onto the nested schema shape. */
function toRaw(env: Record<string, string>): Record<string, unknown> {
  return {
    env: env['NODE_ENV'],
    serviceName: env['SERVICE_NAME'],
    logLevel: env['LOG_LEVEL'],
    tenancy: { defaultTenant: env['DEFAULT_TENANT'], header: env['TENANT_HEADER'] },
    database: { url: env['DATABASE_URL'], maxConnections: env['DATABASE_MAX_CONNECTIONS'] },
    redis: { url: env['REDIS_URL'] },
    nats: { url: env['NATS_URL'], stream: env['NATS_STREAM'] },
    storage: {
      endpoint: env['STORAGE_ENDPOINT'],
      accessKey: env['STORAGE_ACCESS_KEY'],
      secretKey: env['STORAGE_SECRET_KEY'],
      bucket: env['STORAGE_BUCKET'],
    },
    observability: { otlpEndpoint: env['OTEL_EXPORTER_OTLP_ENDPOINT'], metricsPort: env['METRICS_PORT'] },
    ai: {
      primaryEngine: env['INFERENCE_PRIMARY'],
      ollamaUrl: env['OLLAMA_URL'],
      vllmUrl: env['VLLM_URL'],
      llamacppUrl: env['LLAMACPP_URL'],
      sglangUrl: env['SGLANG_URL'],
      lmstudioUrl: env['LMSTUDIO_URL'],
      comfyuiUrl: env['COMFYUI_URL'],
      enableCloudInference: env['ENABLE_CLOUD_INFERENCE'],
    },
    secrets: { provider: env['SECRETS_PROVIDER'] },
  };
}

function prune<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined) continue;
    out[k] = typeof v === 'object' && v !== null && !Array.isArray(v) ? prune(v) : v;
  }
  return out as T;
}
