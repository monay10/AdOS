import type { AICapability } from '@ados/contracts';
import type { CostAnalyzerPort, InferenceEngineId, ModelDescriptor, MonitoringPort } from '../ports.js';
import type { AITaskRequest } from '../ports.js';

export interface InferenceSample {
  model: string;
  engine: InferenceEngineId;
  capability: AICapability;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  cached: boolean;
  ok: boolean;
}

export interface MonitoringSnapshot {
  totalInferences: number;
  failures: number;
  cacheHits: number;
  totalTokens: number;
  avgLatencyMs: number;
  perModel: Record<string, { count: number; failures: number; totalLatencyMs: number; tokens: number }>;
}

/**
 * Monitoring — aggregates every inference in-process so the AI Manager dashboard
 * can report running tasks, latency, tokens, cache hits, and failures. A
 * production deployment also exports these via @ados/observability (Prometheus);
 * this aggregator is the always-available source of truth and is dependency-free.
 */
export class InMemoryMonitoring implements MonitoringPort {
  private total = 0;
  private failures = 0;
  private cacheHits = 0;
  private tokens = 0;
  private latencySum = 0;
  private readonly perModel = new Map<string, { count: number; failures: number; totalLatencyMs: number; tokens: number }>();

  recordInference(sample: InferenceSample): void {
    this.total++;
    this.latencySum += sample.latencyMs;
    this.tokens += sample.promptTokens + sample.completionTokens;
    if (!sample.ok) this.failures++;
    if (sample.cached) this.cacheHits++;

    const m = this.perModel.get(sample.model) ?? { count: 0, failures: 0, totalLatencyMs: 0, tokens: 0 };
    m.count++;
    m.totalLatencyMs += sample.latencyMs;
    m.tokens += sample.promptTokens + sample.completionTokens;
    if (!sample.ok) m.failures++;
    this.perModel.set(sample.model, m);
  }

  snapshot(): MonitoringSnapshot {
    return {
      totalInferences: this.total,
      failures: this.failures,
      cacheHits: this.cacheHits,
      totalTokens: this.tokens,
      avgLatencyMs: this.total ? this.latencySum / this.total : 0,
      perModel: Object.fromEntries(this.perModel),
    };
  }
}

/**
 * Offline Cost Analyzer — there is no per-call dollar cost with local models, so
 * "cost" is compute: estimated GPU-seconds and energy (Wh). Estimates scale with
 * the model's VRAM footprint and the expected token count; actuals are recorded
 * from measured latency. Enables cost-aware routing without any cloud pricing.
 */
export class OfflineCostAnalyzer implements CostAnalyzerPort {
  private totalGpuSeconds = 0;
  private totalEnergyWh = 0;

  constructor(private readonly assumedWatts = 300) {}

  async estimate(request: AITaskRequest, model: ModelDescriptor): Promise<{ gpuSeconds: number; energyWh: number }> {
    const expectedTokens = request.hints?.maxTokens ?? 512;
    // Rough model: larger (more VRAM) models are slower per token.
    const tokensPerSecond = Math.max(5, 200 - model.vramGb * 4);
    const gpuSeconds = expectedTokens / tokensPerSecond;
    return { gpuSeconds, energyWh: (gpuSeconds / 3600) * this.assumedWatts };
  }

  record(actual: { taskId: string; gpuSeconds: number; energyWh: number }): void {
    this.totalGpuSeconds += actual.gpuSeconds;
    this.totalEnergyWh += actual.energyWh;
  }

  totals(): { gpuSeconds: number; energyWh: number } {
    return { gpuSeconds: this.totalGpuSeconds, energyWh: this.totalEnergyWh };
  }
}
