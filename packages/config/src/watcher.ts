import { watch, type FSWatcher } from 'node:fs';
import { ConfigurationError } from './validator.js';
import type { ConfigurationLoader, LoadedConfiguration } from './loader.js';

export interface ConfigurationWatcherCallbacks {
  /** Fired when a reload produces a different valid configuration. */
  onChange?: (next: LoadedConfiguration, previous: LoadedConfiguration) => void;
  /** Fired when a reload is invalid — the previous config is kept. */
  onError?: (error: ConfigurationError) => void;
}

/**
 * ConfigurationWatcher — hot-reloads configuration when a watched file changes.
 * Only file-backed configuration can be watched; environment and secrets are
 * fixed for the process lifetime, so those layers are inert here. An invalid
 * reload never takes effect and never crashes the process — the last good
 * configuration is retained and onError is notified.
 */
export class ConfigurationWatcher {
  private readonly watchers: FSWatcher[] = [];
  private timer: NodeJS.Timeout | undefined;
  private last: LoadedConfiguration | undefined;

  constructor(
    private readonly loader: ConfigurationLoader,
    private readonly paths: string[] = [],
    private readonly debounceMs = 100,
  ) {}

  /** Load once, then watch the paths for changes. Returns the initial config. */
  start(callbacks: ConfigurationWatcherCallbacks = {}): LoadedConfiguration {
    this.last = this.loader.load();
    for (const path of this.paths) {
      try {
        this.watchers.push(watch(path, () => this.schedule(callbacks)));
      } catch {
        // A path that cannot be watched (missing/unsupported) is simply skipped.
      }
    }
    return this.last;
  }

  /** Force a reload now (used on SIGHUP or in tests). */
  reloadNow(callbacks: ConfigurationWatcherCallbacks = {}): LoadedConfiguration | undefined {
    try {
      const next = this.loader.load();
      const previous = this.last;
      this.last = next;
      if (previous && callbacks.onChange && changed(previous, next)) callbacks.onChange(next, previous);
      return next;
    } catch (e) {
      if (e instanceof ConfigurationError) {
        callbacks.onError?.(e);
        return this.last;
      }
      throw e;
    }
  }

  current(): LoadedConfiguration | undefined {
    return this.last;
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
    for (const w of this.watchers) w.close();
    this.watchers.length = 0;
  }

  private schedule(callbacks: ConfigurationWatcherCallbacks): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.reloadNow(callbacks), this.debounceMs);
    this.timer.unref?.();
  }
}

function changed(a: LoadedConfiguration, b: LoadedConfiguration): boolean {
  return JSON.stringify(a.flat) !== JSON.stringify(b.flat);
}
