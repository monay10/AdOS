import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resolveProfile } from './profiles.js';
import { EnvProvider, FileProvider, RuntimeOverrideProvider, SecretProvider } from './providers.js';
import { ConfigurationValidator, ConfigurationError } from './validator.js';
import { ConfigurationLoader } from './loader.js';
import { ConfigurationWatcher } from './watcher.js';
import { ConfigurationHealthCheck } from './health.js';
import { ConfigurationMetrics, loggerConfigAudit } from './observability.js';
import { assertStartup, renderDiagnostics, renderStartupReport } from './startup.js';

let dir: string;
beforeAll(async () => { dir = await mkdtemp(join(tmpdir(), 'ados-config-')); });
afterAll(async () => { await rm(dir, { recursive: true, force: true }); });

/** A complete, valid production environment. */
const PROD_ENV: Record<string, string> = {
  NODE_ENV: 'production',
  SESSION_SECRET: 'a-very-long-session-secret',
  DATABASE_URL: 'postgres://u:p@db:5432/ados',
  NATS_URL: 'nats://nats:4222',
  STORAGE_ENDPOINT: 'https://minio:9000',
  STORAGE_ACCESS_KEY: 'ak',
  STORAGE_SECRET_KEY: 'sk',
  PORT: '4000',
  METRICS_PORT: '9464',
};

describe('profiles', () => {
  it('resolves from ADOS_PROFILE then NODE_ENV', () => {
    expect(resolveProfile({ ADOS_PROFILE: 'staging' })).toBe('staging');
    expect(resolveProfile({ NODE_ENV: 'production' })).toBe('production');
    expect(resolveProfile({ NODE_ENV: 'test' })).toBe('test');
    expect(resolveProfile({})).toBe('development');
  });
});

describe('providers', () => {
  it('reads env, JSON files, dotenv files, and runtime overrides with correct precedence', async () => {
    const jsonPath = join(dir, 'c.json');
    await writeFile(jsonPath, JSON.stringify({ LOG_LEVEL: 'warn', SERVICE_NAME: 'from-file' }));
    const envPath = join(dir, 'c.env');
    await writeFile(envPath, '# comment\nSERVICE_NAME=from-dotenv\nEMPTY=\n');

    expect(new FileProvider(jsonPath).load()).toEqual({ LOG_LEVEL: 'warn', SERVICE_NAME: 'from-file' });
    expect(new FileProvider(envPath).load()).toMatchObject({ SERVICE_NAME: 'from-dotenv' });
    expect(new FileProvider(join(dir, 'missing.json')).load()).toEqual({}); // optional

    const runtime = new RuntimeOverrideProvider().set('SERVICE_NAME', 'from-runtime');
    const loaded = new ConfigurationLoader(
      [new FileProvider(jsonPath), new EnvProvider({ SERVICE_NAME: 'from-env' }), runtime],
      { profile: 'development' },
    ).load();
    expect(loaded.flat['SERVICE_NAME']).toBe('from-runtime'); // runtime beats env beats file
    expect(loaded.flat['LOG_LEVEL']).toBe('warn'); // survives from file
  });

  it('marks secret-provider keys for redaction', () => {
    const secrets = new SecretProvider(new EnvProvider({ SESSION_SECRET: 's', STORAGE_SECRET_KEY: 'k' }));
    expect([...secrets.secretKeys].sort()).toEqual(['SESSION_SECRET', 'STORAGE_SECRET_KEY']);
  });
});

describe('ConfigurationValidator', () => {
  it('passes development with no infrastructure (offline)', () => {
    const report = new ConfigurationValidator().validate({}, 'development');
    expect(report.status).toBe('valid');
    expect(report.warnings.some((w) => w.includes('database'))).toBe(true);
  });

  it('fails production without infrastructure and secrets', () => {
    const report = new ConfigurationValidator().validate({ NODE_ENV: 'production' }, 'production');
    expect(report.status).toBe('invalid');
    const names = report.subsystems.filter((s) => !s.ok).map((s) => s.name);
    expect(names).toEqual(expect.arrayContaining(['secret', 'database', 'storage', 'nats']));
  });

  it('passes production with a complete environment', () => {
    expect(new ConfigurationValidator().validate(PROD_ENV, 'production').status).toBe('valid');
  });

  it('validates ports, database URL, and redis-if-enabled', () => {
    const v = new ConfigurationValidator();
    expect(v.validate({ ...PROD_ENV, PORT: '70000' }, 'production').status).toBe('invalid');
    expect(v.validate({ ...PROD_ENV, PORT: '9464' }, 'production').errors.join(' ')).toMatch(/must differ/);
    expect(v.validate({ ...PROD_ENV, DATABASE_URL: 'mysql://x' }, 'production').errors.join(' ')).toMatch(/postgres/);
    expect(v.validate({ REDIS_ENABLED: 'true', REDIS_URL: 'not a url' }, 'development').errors.join(' ')).toMatch(/REDIS_URL/);
  });
});

describe('ConfigurationLoader — fail fast', () => {
  it('throws ConfigurationError on invalid production config', () => {
    const loader = new ConfigurationLoader([new EnvProvider({ NODE_ENV: 'production' })], { profile: 'production' });
    expect(() => loader.load()).toThrow(ConfigurationError);
  });

  it('returns a typed AppConfig for a valid production config', () => {
    const loaded = new ConfigurationLoader([new EnvProvider(PROD_ENV)], { profile: 'production' }).load();
    expect(loaded.report.status).toBe('valid');
    expect(loaded.config?.database.url).toBe('postgres://u:p@db:5432/ados');
    expect(loaded.config?.storage.bucket).toBe('ados');
  });

  it('materialises offline defaults for development', () => {
    const loaded = new ConfigurationLoader([new EnvProvider({})], { profile: 'development' }).load();
    expect(loaded.config).not.toBeNull();
    expect(loaded.config?.nats.url).toContain('nats://'); // dev default
  });
});

describe('ConfigurationWatcher — hot reload', () => {
  it('reloads a changed configuration and reports the change', () => {
    const runtime = new RuntimeOverrideProvider();
    const loader = new ConfigurationLoader([new EnvProvider({}), runtime], { profile: 'development' });
    const watcher = new ConfigurationWatcher(loader);
    watcher.start();
    let changedTo: string | undefined;
    runtime.set('SERVICE_NAME', 'renamed');
    watcher.reloadNow({ onChange: (next) => { changedTo = next.flat['SERVICE_NAME']; } });
    expect(changedTo).toBe('renamed');
    watcher.stop();
  });

  it('keeps the last good config and reports an invalid reload', () => {
    const runtime = new RuntimeOverrideProvider();
    const loader = new ConfigurationLoader([new EnvProvider({}), runtime], { profile: 'development' });
    const watcher = new ConfigurationWatcher(loader);
    watcher.start();
    let error: ConfigurationError | undefined;
    runtime.set('PORT', '0'); // invalid
    const result = watcher.reloadNow({ onError: (e) => { error = e; } });
    expect(error).toBeInstanceOf(ConfigurationError);
    expect(result?.flat['PORT']).toBeUndefined(); // reverted to last good
    watcher.stop();
  });
});

describe('ConfigurationHealthCheck + startup', () => {
  it('reports healthy for valid config and unhealthy (without throwing) for invalid', () => {
    const good = new ConfigurationLoader([new EnvProvider(PROD_ENV)], { profile: 'production' });
    expect(new ConfigurationHealthCheck(() => good.load()).check().healthy).toBe(true);

    const bad = new ConfigurationLoader([new EnvProvider({ NODE_ENV: 'production' })], { profile: 'production' });
    const health = new ConfigurationHealthCheck(() => bad.load()).check();
    expect(health.healthy).toBe(false);
    expect(health.errors.length).toBeGreaterThan(0);
  });

  it('assertStartup refuses invalid config and renders reports/diagnostics with redaction', () => {
    const loaded = new ConfigurationLoader([new EnvProvider(PROD_ENV)], { profile: 'production', failFast: false }).load();
    expect(() => assertStartup(loaded, { metrics: new ConfigurationMetrics(), audit: loggerConfigAudit() })).not.toThrow();

    const report = renderStartupReport(loaded.report);
    expect(report).toContain('profile: production');
    expect(report).toContain('database');

    const diag = renderDiagnostics(loaded);
    expect(diag).toContain('***redacted***'); // SESSION_SECRET / STORAGE_SECRET_KEY hidden
    expect(diag).not.toContain('a-very-long-session-secret');

    const invalid = new ConfigurationLoader([new EnvProvider({ NODE_ENV: 'production' })], { profile: 'production', failFast: false }).load();
    expect(() => assertStartup(invalid)).toThrow(ConfigurationError);
  });
});
