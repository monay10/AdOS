import { metricsText } from '@ados/observability';
import { HealthAggregator, containerDiagnostics } from '@ados/deploy';
import type { Req, Res } from './http.js';

export interface OpsOptions {
  /** Health probes for readiness (dependencies). Liveness is process-up by default. */
  readonly health?: HealthAggregator;
  readonly service?: string;
}

/**
 * Container operations endpoints — exposed by every AdOS container so the
 * orchestrator can gate traffic and scrape metrics. These run BEFORE auth and
 * routing (they must answer even when the app is unhealthy) and are additive:
 * they never alter existing application routes.
 *
 *   GET /livez        liveness  — is the process alive? (restart if 503)
 *   GET /readyz       readiness — are all dependencies reachable? (gate traffic)
 *   GET /healthz      full health snapshot
 *   GET /diagnostics  runtime/container diagnostics
 *   GET /metrics      Prometheus exposition
 */
export async function handleOps(req: Req, res: Res, opts: OpsOptions = {}): Promise<boolean> {
  if (req.method !== 'GET') return false;
  const health = opts.health ?? new HealthAggregator();
  const service = opts.service ?? 'ados-web';

  switch (req.path) {
    case '/livez': {
      const snap = await health.liveness();
      res.json(snap, snap.status === 'fail' ? 503 : 200);
      return true;
    }
    case '/readyz': {
      const snap = await health.readiness();
      res.json(snap, snap.status === 'fail' ? 503 : 200);
      return true;
    }
    case '/healthz': {
      const snap = await health.health();
      res.json(snap, snap.status === 'fail' ? 503 : 200);
      return true;
    }
    case '/diagnostics': {
      res.json(containerDiagnostics(service));
      return true;
    }
    case '/metrics': {
      const text = await metricsText();
      res.raw.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
      res.raw.end(text);
      return true;
    }
    default:
      return false;
  }
}
