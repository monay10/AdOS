import { connect } from 'node:net';
import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';
import type { CheckResult, CheckState } from './health.js';

/**
 * DeploymentVerifier — before a container accepts traffic, every dependency it
 * needs must be validated. Each dependency has a verify() (a TCP or HTTP probe
 * in production, a fake in tests). A critical dependency failing makes the whole
 * deployment not-ready.
 */
export interface Dependency {
  readonly name: string;
  /** A failing critical dependency blocks readiness (default true). */
  readonly critical?: boolean;
  verify(): Promise<CheckResult> | CheckResult;
}

export interface DeploymentReport {
  readonly ready: boolean;
  readonly dependencies: CheckResult[];
  readonly generatedAt: string;
}

export class DeploymentVerifier {
  constructor(private readonly dependencies: Dependency[]) {}

  async verify(): Promise<DeploymentReport> {
    const dependencies = await Promise.all(
      this.dependencies.map(async (d): Promise<CheckResult & { critical: boolean }> => {
        const critical = d.critical ?? true;
        try {
          return { ...(await d.verify()), critical };
        } catch (e) {
          return { name: d.name, state: 'fail', detail: e instanceof Error ? e.message : String(e), critical };
        }
      }),
    );
    const ready = dependencies.every((d) => !d.critical || d.state !== 'fail');
    return { ready, dependencies: dependencies.map(({ critical, ...rest }) => (void critical, rest)), generatedAt: new Date().toISOString() };
  }
}

/** Probe a TCP port (e.g. Postgres 5432, NATS 4222). */
export function tcpProbe(name: string, host: string, port: number, timeoutMs = 2_000): () => Promise<CheckResult> {
  return () =>
    new Promise<CheckResult>((resolve) => {
      const started = Date.now();
      const socket = connect({ host, port });
      const done = (state: CheckState, detail?: string): void => {
        socket.destroy();
        resolve({ name, state, ...(detail ? { detail } : {}), durationMs: Date.now() - started });
      };
      socket.setTimeout(timeoutMs);
      socket.once('connect', () => done('pass', `${host}:${port}`));
      socket.once('timeout', () => done('fail', `timeout after ${timeoutMs}ms`));
      socket.once('error', (e) => done('fail', e.message));
    });
}

/** Probe an HTTP(S) endpoint (e.g. MinIO, Ollama, Prometheus, Grafana). */
export function httpProbe(name: string, url: string, timeoutMs = 2_000): () => Promise<CheckResult> {
  return () =>
    new Promise<CheckResult>((resolve) => {
      const started = Date.now();
      const getter = url.startsWith('https:') ? httpsGet : httpGet;
      const req = getter(url, (res) => {
        res.resume();
        const code = res.statusCode ?? 0;
        resolve({ name, state: code > 0 && code < 500 ? 'pass' : 'fail', detail: `HTTP ${code}`, durationMs: Date.now() - started });
      });
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve({ name, state: 'fail', detail: `timeout after ${timeoutMs}ms`, durationMs: Date.now() - started });
      });
      req.once('error', (e) => resolve({ name, state: 'fail', detail: e.message, durationMs: Date.now() - started }));
    });
}
