import { cpus, totalmem } from 'node:os';
import { UnavailableError } from '@ados/kernel';
import type {
  HardwareProfile,
  ModelDescriptor,
  ResourceLease,
  ResourceSchedulerPort,
  ResourceSnapshot,
  RoutingDecision,
} from '../ports.js';

/**
 * Detect the machine's hardware profile. CPU cores and RAM are read from the OS;
 * GPU/VRAM cannot be probed reliably from Node, so they are supplied via config
 * (an operator sets `maxModelVramGb` for the box). This keeps the scheduler
 * deterministic and offline.
 */
export function detectHardwareProfile(overrides: Partial<HardwareProfile> = {}): HardwareProfile {
  const ramTotalGb = Math.round(totalmem() / 1024 ** 3);
  return {
    gpu: overrides.gpu ?? false,
    vramTotalGb: overrides.vramTotalGb ?? 0,
    ramTotalGb: overrides.ramTotalGb ?? ramTotalGb,
    cpuCores: overrides.cpuCores ?? cpus().length,
    // Default budget: VRAM if a GPU is present, else a fraction of system RAM
    // (CPU inference). Operators override per machine.
    maxModelVramGb: overrides.maxModelVramGb ?? (overrides.gpu ? overrides.vramTotalGb ?? 0 : Math.floor(ramTotalGb * 0.6)),
  };
}

/**
 * In-memory Resource Scheduler. Enforces a concurrency limit (a counting
 * semaphore), tracks loaded models (warmup/unload), and — crucially — picks the
 * best model from a routing decision that actually FITS this machine, so agents
 * never need to know the hardware (Qwen 32B on a 4090, 14B on an M4 Air).
 */
export class InMemoryResourceScheduler implements ResourceSchedulerPort {
  private readonly loaded = new Set<string>();
  private running = 0;
  private readonly waiters: Array<() => void> = [];

  constructor(
    private readonly hw: HardwareProfile = detectHardwareProfile(),
    private readonly maxConcurrency: number = Math.max(1, Math.floor((detectHardwareProfile().cpuCores || 4) / 2)),
  ) {}

  async profile(): Promise<HardwareProfile> {
    return this.hw;
  }

  async snapshot(): Promise<ResourceSnapshot> {
    return {
      gpuUtil: 0,
      vramUsedGb: 0,
      vramTotalGb: this.hw.vramTotalGb,
      cpuUtil: this.running / this.maxConcurrency,
      ramUsedGb: 0,
      loadedModels: [...this.loaded],
      queueDepth: this.waiters.length,
      runningInferences: this.running,
    };
  }

  async canFit(model: ModelDescriptor): Promise<boolean> {
    // vram 0 (CPU/embedding/image via other engines) always fits.
    return model.vramGb === 0 || model.vramGb <= this.hw.maxModelVramGb;
  }

  async select(decision: RoutingDecision): Promise<ModelDescriptor> {
    for (const model of [decision.primary, ...decision.fallbacks]) {
      if (await this.canFit(model)) return model;
    }
    throw new UnavailableError('No routed model fits this machine', {
      details: { maxModelVramGb: this.hw.maxModelVramGb, tried: [decision.primary.id, ...decision.fallbacks.map((m) => m.id)] },
    });
  }

  async acquire(model: ModelDescriptor): Promise<ResourceLease> {
    await this.enter();
    this.loaded.add(model.id); // warmup: model considered resident while leased
    let released = false;
    return {
      release: async () => {
        if (released) return;
        released = true;
        this.leave();
      },
    };
  }

  private async enter(): Promise<void> {
    if (this.running < this.maxConcurrency) {
      this.running++;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    this.running++;
  }

  private leave(): void {
    this.running--;
    const next = this.waiters.shift();
    if (next) next();
  }
}
