import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus metrics registry. A single shared registry exposes both default
 * process metrics and the platform's domain metrics at /metrics. Helper
 * factories keep metric creation consistent and idempotent.
 */
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

const counters = new Map<string, Counter>();
const gauges = new Map<string, Gauge>();
const histograms = new Map<string, Histogram>();

export function counter(name: string, help: string, labelNames: string[] = []): Counter {
  let c = counters.get(name);
  if (!c) {
    c = new Counter({ name, help, labelNames, registers: [registry] });
    counters.set(name, c);
  }
  return c;
}

export function gauge(name: string, help: string, labelNames: string[] = []): Gauge {
  let g = gauges.get(name);
  if (!g) {
    g = new Gauge({ name, help, labelNames, registers: [registry] });
    gauges.set(name, g);
  }
  return g;
}

export function histogram(
  name: string,
  help: string,
  labelNames: string[] = [],
  buckets?: number[],
): Histogram {
  let h = histograms.get(name);
  if (!h) {
    h = new Histogram({
      name,
      help,
      labelNames,
      ...(buckets ? { buckets } : {}),
      registers: [registry],
    });
    histograms.set(name, h);
  }
  return h;
}

/** Render the metrics exposition format for the /metrics endpoint. */
export function metricsText(): Promise<string> {
  return registry.metrics();
}
