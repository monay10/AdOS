import type { InferenceEngineId, InferenceEnginePort, ModelRegistryPort } from '../ports.js';

export interface ModelAvailability {
  modelId: string;
  engine: InferenceEngineId;
  available: boolean;
  detail?: string;
  avgLatencyMs?: number;
  samples: number;
}

/**
 * Model Registry — Health, Benchmark & Availability monitor.
 *
 * Probes each engine's health and reconciles model availability into the
 * registry (disabling models whose engine is down, re-enabling on recovery), and
 * records latency benchmarks so routing can prefer faster models. Purely local,
 * no cloud.
 */
export class ModelHealthMonitor {
  private readonly bench = new Map<string, { totalMs: number; samples: number }>();
  private readonly availability = new Map<string, ModelAvailability>();

  constructor(
    private readonly registry: ModelRegistryPort,
    private readonly engines: Map<InferenceEngineId, InferenceEnginePort>,
  ) {}

  /** Probe every engine and reconcile model enabled-state with availability. */
  async check(): Promise<ModelAvailability[]> {
    const engineHealth = new Map<InferenceEngineId, { ok: boolean; detail?: string }>();
    for (const [id, engine] of this.engines) engineHealth.set(id, await engine.health());

    const report: ModelAvailability[] = [];
    for (const model of this.registry.list()) {
      const health = engineHealth.get(model.engine) ?? { ok: false, detail: 'no engine registered' };
      // Availability reflects the engine; operator-disabled models stay disabled.
      if (!health.ok && model.enabled) this.registry.setEnabled(model.id, false);

      const bench = this.bench.get(model.id);
      const entry: ModelAvailability = {
        modelId: model.id,
        engine: model.engine,
        available: health.ok,
        samples: bench?.samples ?? 0,
        ...(health.detail ? { detail: health.detail } : {}),
        ...(bench && bench.samples > 0 ? { avgLatencyMs: bench.totalMs / bench.samples } : {}),
      };
      this.availability.set(model.id, entry);
      report.push(entry);
    }
    return report;
  }

  /** Record an observed latency for a model (benchmark signal). */
  benchmark(modelId: string, latencyMs: number): void {
    const b = this.bench.get(modelId) ?? { totalMs: 0, samples: 0 };
    b.totalMs += latencyMs;
    b.samples += 1;
    this.bench.set(modelId, b);
  }

  availabilityOf(modelId: string): ModelAvailability | undefined {
    return this.availability.get(modelId);
  }
}
