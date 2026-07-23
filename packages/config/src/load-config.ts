import { configSchema, type AppConfig } from './schema.js';

/**
 * Maps a flat environment record onto the nested config schema and validates it.
 * Kept pure (env passed in) so it is trivially testable and free of global
 * process access.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const raw = {
    env: env.NODE_ENV,
    serviceName: env.SERVICE_NAME,
    logLevel: env.LOG_LEVEL,
    tenancy: {
      defaultTenant: env.DEFAULT_TENANT,
      header: env.TENANT_HEADER,
    },
    database: {
      url: env.DATABASE_URL,
      maxConnections: env.DATABASE_MAX_CONNECTIONS,
    },
    redis: { url: env.REDIS_URL },
    nats: { url: env.NATS_URL, stream: env.NATS_STREAM },
    storage: {
      endpoint: env.STORAGE_ENDPOINT,
      accessKey: env.STORAGE_ACCESS_KEY,
      secretKey: env.STORAGE_SECRET_KEY,
      bucket: env.STORAGE_BUCKET,
    },
    observability: {
      otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
      metricsPort: env.METRICS_PORT,
    },
    ai: {
      primaryEngine: env.INFERENCE_PRIMARY,
      ollamaUrl: env.OLLAMA_URL,
      vllmUrl: env.VLLM_URL,
      llamacppUrl: env.LLAMACPP_URL,
      sglangUrl: env.SGLANG_URL,
      lmstudioUrl: env.LMSTUDIO_URL,
      comfyuiUrl: env.COMFYUI_URL,
      enableCloudInference: env.ENABLE_CLOUD_INFERENCE,
    },
    secrets: { provider: env.SECRETS_PROVIDER },
  };

  const parsed = configSchema.safeParse(pruneUndefined(raw));
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid AdOS configuration:\n${issues}`);
  }
  return parsed.data;
}

/** Remove undefined leaves so schema defaults apply cleanly. */
function pruneUndefined<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined) continue;
    out[k] = typeof v === 'object' && v !== null && !Array.isArray(v) ? pruneUndefined(v) : v;
  }
  return out as T;
}
