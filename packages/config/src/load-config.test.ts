import { describe, expect, it } from 'vitest';
import { loadConfig } from './load-config.js';

/** Minimal env that satisfies every required field. */
const baseEnv = {
  DATABASE_URL: 'postgres://ados:ados@localhost:5432/ados',
  REDIS_URL: 'redis://localhost:6379',
  NATS_URL: 'nats://localhost:4222',
  STORAGE_ENDPOINT: 'http://localhost:9000',
  STORAGE_ACCESS_KEY: 'ados',
  STORAGE_SECRET_KEY: 'ados-secret',
} as NodeJS.ProcessEnv;

describe('loadConfig (configuration validation)', () => {
  it('applies safe, offline-first defaults', () => {
    const cfg = loadConfig(baseEnv);
    expect(cfg.env).toBe('development');
    expect(cfg.logLevel).toBe('info');
    expect(cfg.tenancy.defaultTenant).toBe('public');
    expect(cfg.database.maxConnections).toBe(20);
    expect(cfg.nats.stream).toBe('ados-events');
    // Offline-first: local engine, no cloud inference.
    expect(cfg.ai.primaryEngine).toBe('ollama');
    expect(cfg.ai.enableCloudInference).toBe(false);
    expect(cfg.ai.ollamaUrl).toBe('http://localhost:11434');
  });

  it('fails fast and loudly when a required value is missing', () => {
    const { DATABASE_URL, ...withoutDb } = baseEnv;
    void DATABASE_URL;
    expect(() => loadConfig(withoutDb as NodeJS.ProcessEnv)).toThrow(/Invalid AdOS configuration/);
  });

  it('rejects an invalid enum value', () => {
    expect(() => loadConfig({ ...baseEnv, LOG_LEVEL: 'verbose' })).toThrow(/Invalid AdOS configuration/);
  });

  it('rejects a malformed storage endpoint URL', () => {
    expect(() => loadConfig({ ...baseEnv, STORAGE_ENDPOINT: 'not-a-url' })).toThrow(/Invalid AdOS configuration/);
  });

  it('coerces numeric and boolean env strings', () => {
    const cfg = loadConfig({ ...baseEnv, DATABASE_MAX_CONNECTIONS: '50', ENABLE_CLOUD_INFERENCE: 'true' });
    expect(cfg.database.maxConnections).toBe(50);
    expect(cfg.ai.enableCloudInference).toBe(true);
  });

  it('honours explicit overrides for tenancy and engine selection', () => {
    const cfg = loadConfig({ ...baseEnv, NODE_ENV: 'production', DEFAULT_TENANT: 'acme', INFERENCE_PRIMARY: 'vllm' });
    expect(cfg.env).toBe('production');
    expect(cfg.tenancy.defaultTenant).toBe('acme');
    expect(cfg.ai.primaryEngine).toBe('vllm');
  });
});
