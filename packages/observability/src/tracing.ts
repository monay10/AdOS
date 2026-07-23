import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

/**
 * OpenTelemetry bootstrap. Distributed tracing spans propagate across HTTP,
 * the event bus, and AI Manager calls. When no OTLP endpoint is configured
 * (fully offline dev), tracing is a no-op and never blocks startup.
 */
let sdk: NodeSDK | null = null;

export async function initTracing(options: {
  service: string;
  otlpEndpoint?: string | undefined;
}): Promise<void> {
  if (!options.otlpEndpoint) return; // offline: tracing disabled, zero external calls
  sdk = new NodeSDK({
    serviceName: options.service,
    traceExporter: new OTLPTraceExporter({ url: `${options.otlpEndpoint}/v1/traces` }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
}

export async function shutdownTracing(): Promise<void> {
  if (sdk) await sdk.shutdown();
}
