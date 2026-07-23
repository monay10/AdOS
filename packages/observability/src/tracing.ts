/**
 * OpenTelemetry bootstrap. Distributed tracing spans propagate across HTTP,
 * the event bus, and AI Manager calls. When no OTLP endpoint is configured
 * (fully offline dev), tracing is a no-op and never blocks startup.
 *
 * The heavy OTel SDK + auto-instrumentation packages are imported lazily inside
 * initTracing so that simply importing @ados/observability (which every bounded
 * context does, for logging + metrics) does NOT pull the entire instrumentation
 * tree into memory in the common offline case.
 */
interface Shutdownable {
  shutdown(): Promise<void>;
}

let sdk: Shutdownable | null = null;

export async function initTracing(options: {
  service: string;
  otlpEndpoint?: string | undefined;
}): Promise<void> {
  if (!options.otlpEndpoint) return; // offline: tracing disabled, zero external calls
  const [{ NodeSDK }, { getNodeAutoInstrumentations }, { OTLPTraceExporter }] = await Promise.all([
    import('@opentelemetry/sdk-node'),
    import('@opentelemetry/auto-instrumentations-node'),
    import('@opentelemetry/exporter-trace-otlp-http'),
  ]);
  const instance = new NodeSDK({
    serviceName: options.service,
    traceExporter: new OTLPTraceExporter({ url: `${options.otlpEndpoint}/v1/traces` }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await instance.start();
  sdk = instance;
}

export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}
