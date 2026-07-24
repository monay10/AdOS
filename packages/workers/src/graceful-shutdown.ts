import { getLogger } from '@ados/observability';

/**
 * GracefulShutdown — on SIGTERM/SIGINT, stop claiming new jobs and let in-flight
 * ones drain (via the host's stop()). Because every job is persisted, anything
 * still queued simply resumes on the next start; nothing is lost.
 */
export class GracefulShutdown {
  private triggered = false;
  private readonly logger = getLogger('workers');

  constructor(private readonly stop: () => Promise<void>) {}

  /** Install signal handlers. Returns a disposer that removes them. */
  install(signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']): () => void {
    const handlers = signals.map((signal) => {
      const handler = (): void => void this.trigger(signal);
      process.on(signal, handler);
      return [signal, handler] as const;
    });
    return () => {
      for (const [signal, handler] of handlers) process.off(signal, handler);
    };
  }

  async trigger(signal: string): Promise<void> {
    if (this.triggered) return;
    this.triggered = true;
    this.logger.info({ signal }, 'workers: graceful shutdown');
    await this.stop();
  }
}
