import { z } from 'zod';

/**
 * The single source of truth for platform configuration. Every value is
 * validated at startup; an invalid environment fails fast and loudly rather
 * than surfacing as a runtime error deep in a request.
 *
 * Config is layered: process.env -> schema defaults. No business rule is ever
 * hardcoded; anything operators may tune lives here.
 */
export const configSchema = z.object({
  env: z.enum(['development', 'test', 'production']).default('development'),
  serviceName: z.string().min(1).default('ados'),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  tenancy: z.object({
    defaultTenant: z.string().min(1).default('public'),
    header: z.string().min(1).default('x-tenant-id'),
  }),

  database: z.object({
    url: z.string().min(1),
    maxConnections: z.coerce.number().int().positive().default(20),
  }),

  redis: z.object({
    url: z.string().min(1),
  }),

  nats: z.object({
    url: z.string().min(1),
    stream: z.string().min(1).default('ados-events'),
  }),

  storage: z.object({
    endpoint: z.string().url(),
    accessKey: z.string().min(1),
    secretKey: z.string().min(1),
    bucket: z.string().min(1).default('ados'),
  }),

  observability: z.object({
    otlpEndpoint: z.string().url().optional(),
    metricsPort: z.coerce.number().int().positive().default(9464),
  }),

  ai: z.object({
    /** Offline-first: default primary engine is always a local one. */
    primaryEngine: z
      .enum(['ollama', 'vllm', 'llamacpp', 'sglang', 'lmstudio'])
      .default('ollama'),
    ollamaUrl: z.string().url().default('http://localhost:11434'),
    vllmUrl: z.string().url().default('http://localhost:8000'),
    llamacppUrl: z.string().url().default('http://localhost:8080'),
    sglangUrl: z.string().url().default('http://localhost:30000'),
    lmstudioUrl: z.string().url().default('http://localhost:1234'),
    comfyuiUrl: z.string().url().default('http://localhost:8188'),
    /** Cloud passthrough is OFF by default and never required. */
    enableCloudInference: z.coerce.boolean().default(false),
  }),

  secrets: z.object({
    provider: z.enum(['env', 'file', 'vault']).default('env'),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;
