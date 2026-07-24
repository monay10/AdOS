/**
 * Container health model. Kubernetes/Compose distinguish two questions:
 *  - liveness:  "is the process alive?" — restart it if not.
 *  - readiness: "can it serve requests?" — every dependency must be reachable.
 * The aggregator answers both from a set of probes.
 */
export type CheckState = 'pass' | 'warn' | 'fail';

export interface CheckResult {
  readonly name: string;
  readonly state: CheckState;
  readonly detail?: string;
  readonly durationMs?: number;
}

export type ProbeKind = 'liveness' | 'readiness';

export interface HealthProbe {
  readonly name: string;
  /** Defaults to 'readiness' — the strict check gated before serving traffic. */
  readonly kind?: ProbeKind;
  check(): Promise<Omit<CheckResult, 'name'>> | Omit<CheckResult, 'name'>;
}

export interface HealthSnapshot {
  readonly status: CheckState;
  readonly checks: CheckResult[];
  readonly checkedAt: string;
  readonly uptimeSeconds: number;
}

/** Worst state wins: any fail → fail; else any warn → warn; else pass. */
function reduce(states: CheckState[]): CheckState {
  if (states.includes('fail')) return 'fail';
  if (states.includes('warn')) return 'warn';
  return 'pass';
}

export class HealthAggregator {
  private readonly probes: HealthProbe[] = [];
  constructor(
    probes: HealthProbe[] = [],
    private readonly uptime: () => number = () => process.uptime(),
  ) {
    this.probes.push(...probes);
  }

  add(probe: HealthProbe): this {
    this.probes.push(probe);
    return this;
  }

  private async run(probes: HealthProbe[]): Promise<HealthSnapshot> {
    const checks: CheckResult[] = await Promise.all(
      probes.map(async (p) => {
        const started = Date.now();
        try {
          const r = await p.check();
          return { name: p.name, state: r.state, ...(r.detail ? { detail: r.detail } : {}), durationMs: r.durationMs ?? Date.now() - started };
        } catch (e) {
          return { name: p.name, state: 'fail' as const, detail: e instanceof Error ? e.message : String(e), durationMs: Date.now() - started };
        }
      }),
    );
    return { status: reduce(checks.map((c) => c.state)), checks, checkedAt: new Date().toISOString(), uptimeSeconds: Math.round(this.uptime()) };
  }

  /** Liveness: the process itself plus any liveness probes. */
  liveness(): Promise<HealthSnapshot> {
    return this.run(this.probes.filter((p) => p.kind === 'liveness'));
  }

  /** Readiness: every readiness probe (the default kind) must pass. */
  readiness(): Promise<HealthSnapshot> {
    return this.run(this.probes.filter((p) => (p.kind ?? 'readiness') === 'readiness'));
  }

  /** Full health: every probe. */
  health(): Promise<HealthSnapshot> {
    return this.run(this.probes);
  }
}

/** Map a snapshot to an HTTP response (200 for pass/warn, 503 for fail). */
export function healthResponse(snapshot: HealthSnapshot): { status: number; body: string } {
  return { status: snapshot.status === 'fail' ? 503 : 200, body: JSON.stringify(snapshot) };
}
