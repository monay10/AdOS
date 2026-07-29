import { randomUUID } from 'node:crypto';
import type { AIManagerPort, CompanyBrainPort, DecisionJournalPort, ExecutiveMemoryPort } from '@ados/contracts';
import { InMemoryEventBus, type EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import { telemetry, type Telemetry } from '@ados/observability';
import {
  ApprovalService,
  AssetService,
  BrandService,
  ClientService,
  MissionService,
  PerformanceReportService,
  ProductService,
  ProjectService,
  WorkspaceService,
} from '@ados/agency-os';
import { MarketingBriefService } from '@ados/marketing-intelligence';
import { CreativeStudioService } from '@ados/creative-studio';
import { CampaignDraftService } from '@ados/campaign-engine';
import { CampaignReportService } from '@ados/analytics-engine';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import { ExecutiveReportService } from '@ados/executive-ai';
import { RegexCreativeSafetyGate } from './safety.js';
import { createOfflineGovernedManager } from './governed-inference.js';
import { StagedAIManager } from './staged-ai-manager.js';
import { defaultStageEngine } from './stage-engine.js';
import { InMemoryExecutionTraceStore } from './execution-trace-store.js';
import { InMemoryGovernanceDecisionLog, type GovernanceDecisionLog } from './governance-decisions.js';
import {
  GovernanceCalibration,
  InMemoryCalibrationStore,
  DEFAULT_CALIBRATION_CONFIG,
  type CalibrationStore,
  type CalibrationConfig,
} from './governance-calibration.js';
import { InMemoryMissionQueue, type MissionQueue } from './mission-queue.js';
import { MaintenanceService } from './maintenance.js';
import { BackupManager } from './backup-manager.js';
import { QueueWorker } from './queue-worker.js';
import { assembleHealth, type RuntimeHealth } from './runtime-health.js';
import { runApplyJob } from './mission-runner.js';
import { isRestorableBrain } from './brain-persistence.js';
import { isRestorable } from './executive-persistence.js';
import { isEnforced, REVIEW_ONLY, type GovernancePolicy } from './governance-policy.js';
import { inMemoryRepositories, type RepositoryBundle } from './db/repositories.js';

/** A single event as surfaced on the dashboard activity feed. */
export interface FeedEntry {
  eventName: string;
  tenantId: string;
  occurredAt: string;
}

/**
 * The composition root for the AdOS web app. Wires every onboarding application
 * service over one shared event bus and one repository bundle, and keeps a
 * bounded activity feed so the UI can show that events really fire.
 *
 * The repository bundle defaults to in-memory; production injects the SQL
 * (Postgres) bundle via `main.ts`. Either way repositories are tenant-scoped
 * internally (they read the ambient TenantContext), so sharing a single
 * instance per type across all requests is safe: tenant A never sees tenant B's
 * data.
 */
export class App {
  readonly bus: EventBus;
  readonly workspaces: WorkspaceService;
  readonly clients: ClientService;
  readonly brands: BrandService;
  readonly products: ProductService;
  readonly projects: ProjectService;
  readonly approvals: ApprovalService;
  readonly assets: AssetService;
  readonly performance: PerformanceReportService;
  readonly missions: MissionService;
  readonly briefs: MarketingBriefService;
  readonly creative: CreativeStudioService;
  readonly campaigns: CampaignDraftService;
  readonly reports: CampaignReportService;
  readonly executive: ExecutiveReportService;
  readonly brain: CompanyBrainPort;
  readonly execMemory: ExecutiveMemoryPort;
  readonly journal: DecisionJournalPort;
  /** Every AI task leaves an auditable ExecutionTrace here (Sprint 4.1). */
  readonly traces: InMemoryExecutionTraceStore;
  /** Each gate approval records flagged/override for the approval funnel (Sprint 5). */
  readonly governanceDecisions: GovernanceDecisionLog;
  /** Which gates hard-enforce a failing governance verdict (Sprint 8; default none). */
  readonly governance: GovernancePolicy;
  /**
   * Governance Auto-Calibration — the data-driven Observe→Candidate→Enforced
   * state machine over {@link governanceDecisions}. Always present (works over an
   * in-memory store); durable when `main.ts` injects the SQLite-backed stores.
   */
  readonly calibration: GovernanceCalibration;
  /** Durable queue of missions an agent created from applied recommendations. */
  readonly missionQueue: MissionQueue;
  /**
   * Storage lifecycle over the durable local SQLite store (metrics, journal
   * compaction, VACUUM). Present only when a durable store is wired (`main.ts`);
   * undefined for the in-memory default, where there is nothing to maintain.
   */
  readonly maintenance?: MaintenanceService;
  /**
   * App-integrated backup & restore over the durable local store (Series 3 ·
   * Deployment). Present only when a durable store is wired (`main.ts`).
   */
  readonly backups?: BackupManager;
  /** Background drain of {@link missionQueue} — started explicitly via {@link startWorker}. */
  private readonly worker: QueueWorker;

  private readonly tele: Telemetry = telemetry('web');
  private readonly feed: FeedEntry[] = [];
  private readonly maxFeed = 50;

  constructor(
    bus: EventBus = new InMemoryEventBus(),
    ai: AIManagerPort = createOfflineGovernedManager(),
    repos: RepositoryBundle = inMemoryRepositories(),
    // In-memory by default (dev/tests). `main.ts` injects SQLite-backed persistent
    // stores so the compounding learned state survives restarts (Sprint 6).
    brain: CompanyBrainPort = new InMemoryCompanyBrain(),
    execMemory: ExecutiveMemoryPort = new InMemoryExecutiveMemory(),
    journal: DecisionJournalPort = new InMemoryDecisionJournal(),
    // Which gates hard-enforce governance (Sprint 8). Default: none — every gate
    // stays in overridable Required-review mode. `main.ts` reads the operator's
    // GOVERNANCE_ENFORCED_GATES opt-in.
    governance: GovernancePolicy = REVIEW_ONLY,
    // Durable queue for applied recommendations (Async Queue Worker sprint).
    // In-memory by default; `main.ts` injects the SQLite-backed queue so applied
    // recommendations survive a restart and the worker resumes them.
    queue: MissionQueue = new InMemoryMissionQueue(),
    // Storage lifecycle over the durable local store (data-lifecycle sprint).
    // Undefined for the in-memory default; `main.ts` injects one bound to the
    // BRAIN_DB SQLite file + the compactable Decision Journal.
    maintenance?: MaintenanceService,
    // Governance Auto-Calibration wiring (data-calibration sprint). All optional:
    // `decisions` durable gate-decision log (default in-memory), `store` durable
    // calibration state (default in-memory), `config` the thresholds (tests lower
    // them). `main.ts` injects the SQLite-backed decisions + state stores.
    calibrationDeps?: { decisions?: GovernanceDecisionLog; store?: CalibrationStore; config?: CalibrationConfig },
    // App-integrated backup & restore (Series 3 · Deployment · Sprint 1). Built in
    // `main.ts` over the durable BRAIN_DB store; undefined for the in-memory default.
    backups?: BackupManager,
  ) {
    this.bus = bus;
    // The Company Brain must exist before the AI wrap: the Stage Engine's
    // governance.observe stage reads its per-vertical marketing memory to ground
    // evidence/confidence/constitution (Sprint 4.3 observe ladder).
    this.brain = brain;
    // Run a real Stage Engine around every AI task and seal an ExecutionTrace,
    // without changing generation. Covers the default offline manager and any
    // injected live manager alike (Sprint 4.1 — trace goes live; Sprint 4.2 —
    // orchestration stages run observably around generation; Sprint 4.3 — real
    // governance stages run in observe mode, recorded but never enforced).
    this.traces = new InMemoryExecutionTraceStore();
    this.governanceDecisions = calibrationDeps?.decisions ?? new InMemoryGovernanceDecisionLog();
    this.calibration = new GovernanceCalibration(
      this.governanceDecisions,
      calibrationDeps?.store ?? new InMemoryCalibrationStore(),
      calibrationDeps?.config ?? DEFAULT_CALIBRATION_CONFIG,
    );
    ai = new StagedAIManager(ai, this.traces, defaultStageEngine(this.brain));
    this.workspaces = new WorkspaceService(repos.workspaces, bus);
    this.clients = new ClientService(repos.clients, bus);
    this.brands = new BrandService(repos.brands, bus);
    this.products = new ProductService(repos.products, bus);
    this.projects = new ProjectService(repos.projects, bus);
    this.approvals = new ApprovalService(repos.approvals, bus);
    this.assets = new AssetService(repos.assets, bus);
    this.performance = new PerformanceReportService(repos.performance, bus);
    this.missions = new MissionService(repos.missions, bus);
    this.briefs = new MarketingBriefService(repos.briefs, bus, ai);
    this.creative = new CreativeStudioService(repos.creative, bus, ai, new RegexCreativeSafetyGate());
    this.campaigns = new CampaignDraftService(repos.campaigns, bus, ai);
    this.reports = new CampaignReportService(repos.reports, bus, ai);
    this.executive = new ExecutiveReportService(repos.executive, bus, ai);
    this.execMemory = execMemory;
    this.journal = journal;
    this.governance = governance;
    this.missionQueue = queue;
    if (maintenance) this.maintenance = maintenance;
    if (backups) {
      this.backups = backups;
      // After a restore replaces the durable contents, reload in-memory state.
      backups.setOnRestore(() => this.rehydrate());
    }
    // The worker runs the same governed brief step an operator would, out of band,
    // and stops at the human gate. Started explicitly (startWorker) so tests that
    // only construct/`start()` the app never spawn a background loop.
    this.worker = new QueueWorker(this.missionQueue, (job) => runApplyJob(this, job));
  }

  /**
   * Publish an integration event for a subsystem that has no service of its own
   * (the Company Brain + Executive Memory stores). Uses the ambient
   * TenantContext for metadata so the event is tenant-scoped and correlated.
   */
  async emit(eventName: string, aggregateId: string, payload: Record<string, unknown> = {}): Promise<void> {
    const ctx = TenantContext.current();
    await this.bus.publish([
      {
        eventName,
        aggregateId,
        payload,
        metadata: {
          eventId: randomUUID(),
          occurredAt: new Date().toISOString(),
          tenantId: ctx?.tenantId ?? 'public',
          correlationId: ctx?.correlationId ?? randomUUID(),
          causationId: undefined,
          actor: ctx?.actor,
        },
      },
    ]);
  }

  /**
   * Load all durable state into the in-memory decorators. Idempotent: run at
   * startup, and again after a backup **restore** replaces the durable store's
   * contents (so the running app reflects the restored data without a process
   * restart). In-memory stores make each step a no-op.
   */
  async rehydrate(): Promise<void> {
    if (isRestorableBrain(this.brain)) await this.brain.restore();
    if (isRestorable(this.execMemory)) await this.execMemory.restore();
    if (isRestorable(this.journal)) await this.journal.restore();
    // Prepare the durable queue and resume any job a crash left mid-flight: a
    // `running` job with an expired lease returns to `pending` so the worker
    // picks it up again (Async Queue Worker — crash recovery / resume).
    if (this.missionQueue.init) await this.missionQueue.init();
    await this.missionQueue.recoverStale(Date.now());
    // Restore calibration state + init the durable decision log, then recompute
    // once so gate states reflect the accumulated history (and any Enforced→
    // Observe auto-relax is applied before the first approval is served).
    await this.calibration.restore();
    await this.calibration.recompute(Date.now());
  }

  /** Subscribe the activity feed + audit log to every domain event. */
  async start(): Promise<void> {
    await this.rehydrate();
    // Prepare the maintenance + backup bookkeeping tables (no-op when in-memory).
    if (this.maintenance) await this.maintenance.init();
    if (this.backups) await this.backups.init();
    await this.bus.subscribe('>', async (envelope) => {
      const entry: FeedEntry = {
        eventName: envelope.eventName,
        tenantId: envelope.metadata.tenantId,
        occurredAt: envelope.metadata.occurredAt,
      };
      this.feed.unshift(entry);
      if (this.feed.length > this.maxFeed) this.feed.length = this.maxFeed;
      this.tele.logger.info({ event: entry.eventName, tenantId: entry.tenantId }, 'domain event');
    });
  }

  /** Most recent events for the current tenant, newest first. */
  recentEvents(tenantId: string, limit = 10): FeedEntry[] {
    return this.feed.filter((e) => e.tenantId === tenantId).slice(0, limit);
  }

  /**
   * Whether a failing verdict at this gate hard-blocks approval — the effective
   * enforcement, combining the static operator policy (`GOVERNANCE_ENFORCED_GATES`)
   * with any gate the Auto-Calibration state machine has promoted to Enforced.
   */
  enforcedAt(gate: string): boolean {
    return isEnforced(this.governance, gate) || this.calibration.isEnforced(gate);
  }

  /**
   * A measured Runtime Health snapshot (Series 3 · Observability · Sprint 1).
   * Every field is read from a real source now — no estimates: process uptime,
   * the worker flag, counted queue rows, the SQLite size + schema version, the
   * backup catalogue, and the maintenance log.
   */
  async health(): Promise<RuntimeHealth> {
    const queue = await this.missionQueue.counts();
    let database = { durable: false, reachable: false, sizeBytes: 0 };
    let migration: { version: string | null; applied: number } = { version: null, applied: 0 };
    let maintenance: { lastAt: string | null; lastKind: string | null } = { lastAt: null, lastKind: null };
    if (this.maintenance) {
      try {
        const s = await this.maintenance.stats(); // PRAGMAs succeed ⇒ reachable
        database = { durable: true, reachable: true, sizeBytes: s.totalBytes };
        maintenance = { lastAt: s.lastMaintenanceAt ?? null, lastKind: s.recent[0]?.kind ?? null };
        migration = await this.maintenance.schemaVersion();
      } catch {
        database = { durable: true, reachable: false, sizeBytes: 0 };
      }
    }
    let backup = { count: 0, lastAt: null as string | null, lastValidated: null as boolean | null };
    if (this.backups) {
      const list = await this.backups.listBackups();
      backup = {
        count: list.length,
        lastAt: list[0]?.createdAt ?? null,
        lastValidated: list[0] ? list[0].restoreValidated : null,
      };
    }
    return assembleHealth({
      now: Date.now(),
      uptimeSeconds: Math.round(process.uptime()),
      workerRunning: this.worker.isRunning,
      queue,
      database,
      migration,
      backup,
      maintenance,
    });
  }

  /** Start the background queue worker (production). No-op if already running. */
  startWorker(): void {
    this.worker.start();
  }

  /**
   * Drain the queue by exactly one job (recover → claim → run → settle). Returns
   * true if it did work. Deterministic hook for tests + a one-shot drain; the
   * production loop is {@link startWorker}.
   */
  processQueueOnce(): Promise<boolean> {
    return this.worker.tick();
  }

  /** Graceful shutdown: stop claiming and await the in-flight queue job. */
  async stop(): Promise<void> {
    await this.worker.stop();
  }
}
