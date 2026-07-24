import { ConfigurationError, redactUrl, type StartupReport } from './validator.js';
import type { LoadedConfiguration } from './loader.js';
import { loggerConfigAudit, type ConfigAudit, type ConfigurationMetrics } from './observability.js';

/** Render the per-subsystem startup report as human-readable text. */
export function renderStartupReport(report: StartupReport): string {
  const lines: string[] = [];
  lines.push(`AdOS configuration — profile: ${report.profile} — status: ${report.status.toUpperCase()}`);
  lines.push('─'.repeat(60));
  for (const s of report.subsystems) {
    const mark = s.ok ? '✓' : '✗';
    const tag = s.configured ? 'configured' : s.required ? 'MISSING' : 'default';
    lines.push(`  ${mark} ${s.name.padEnd(12)} [${tag.padEnd(10)}] ${s.detail}`);
    for (const issue of s.ok ? [] : s.issues) lines.push(`      ↳ ${issue}`);
  }
  if (report.warnings.length) {
    lines.push('  warnings:');
    for (const w of report.warnings) lines.push(`      • ${w}`);
  }
  return lines.join('\n');
}

/**
 * Detailed diagnostics of the resolved configuration — every effective key and
 * where the value came from — with secrets and credentials redacted. Safe to log.
 */
export function renderDiagnostics(loaded: LoadedConfiguration): string {
  const lines: string[] = [];
  lines.push(`profile: ${loaded.profile}`);
  lines.push(`sources: ${loaded.sources.join(' → ')} (later overrides earlier)`);
  lines.push('effective configuration:');
  for (const key of Object.keys(loaded.flat).sort()) {
    lines.push(`  ${key} = ${redactValue(key, loaded.flat[key]!, loaded.secretKeys)}`);
  }
  return lines.join('\n');
}

function redactValue(key: string, value: string, secretKeys: ReadonlySet<string>): string {
  if (secretKeys.has(key) || /SECRET|PASSWORD|TOKEN|ACCESS_KEY|API_KEY/i.test(key)) return '***redacted***';
  if (/URL|ENDPOINT|DSN/i.test(key)) return redactUrl(value);
  return value;
}

export interface StartupOptions {
  readonly audit?: ConfigAudit;
  readonly metrics?: ConfigurationMetrics;
  /** Print the startup report via the audit logger (default true). */
  readonly print?: boolean;
}

/**
 * Validate configuration at startup and REFUSE to start when it is invalid.
 * Records the outcome, emits metrics, and (re)throws {@link ConfigurationError}
 * so the process exits before serving a single request with a broken config.
 */
export function assertStartup(loaded: LoadedConfiguration, options: StartupOptions = {}): LoadedConfiguration {
  const audit = options.audit ?? loggerConfigAudit();
  const report = loaded.report;
  options.metrics?.loaded(report);
  if (options.print !== false) audit.record(report.status === 'valid' ? 'loaded' : 'invalid', { profile: report.profile, sources: loaded.sources, errors: report.errors });
  if (report.status === 'invalid') throw new ConfigurationError(report);
  return loaded;
}
