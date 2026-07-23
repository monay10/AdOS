import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import type { MissionApprovalGate } from '@ados/contracts';
import { Mission, type MissionId } from './mission.js';
import { MissionWizard } from './wizard.js';
import type { MissionRepository } from './repository.js';

/**
 * Mission Application Service — transactional entry point for the mission
 * lifecycle. A client submits a Mission (usually via the Mission Wizard) and the
 * AI Company drives it through planning, approvals and execution. Every
 * operation is traced, logged and metered.
 */
export class MissionService {
  private readonly tele: Telemetry = telemetry('agency-os.mission');

  constructor(private readonly repo: MissionRepository, private readonly bus: EventBus) {}

  /** Submit a Mission built by the Mission Wizard. */
  async submit(wizard: MissionWizard): Promise<Result<Mission, AppError>> {
    return this.tele.span('submit', async () => {
      const built = wizard.build();
      if (built.isErr) return built;
      const saved = await this.repo.save(built.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(built.value);
      this.tele.count('submitted');
      this.tele.logger.info(
        { missionId: built.value.id.toString(), clientId: built.value.clientId },
        'mission submitted',
      );
      return ok(built.value);
    });
  }

  async plan(id: MissionId): Promise<Result<Mission, AppError>> {
    return this.transition('plan', id, (m) => m.plan());
  }

  async requestApproval(id: MissionId, gate: MissionApprovalGate): Promise<Result<Mission, AppError>> {
    return this.transition('request_approval', id, (m) => m.requestApproval(gate));
  }

  async approve(id: MissionId, gate: MissionApprovalGate): Promise<Result<Mission, AppError>> {
    return this.transition('approve', id, (m) => m.approve(gate));
  }

  async startExecuting(id: MissionId): Promise<Result<Mission, AppError>> {
    return this.transition('start_executing', id, (m) => m.startExecuting());
  }

  async complete(id: MissionId): Promise<Result<Mission, AppError>> {
    return this.transition('complete', id, (m) => m.complete());
  }

  async fail(id: MissionId, reason: string): Promise<Result<Mission, AppError>> {
    return this.transition('fail', id, (m) => m.fail(reason));
  }

  async list(clientId?: string): Promise<Mission[]> {
    return this.tele.span('list', async () => this.repo.list(clientId));
  }

  async get(id: MissionId): Promise<Result<Mission, AppError>> {
    return this.load(id);
  }

  private async transition(
    op: string,
    id: MissionId,
    change: (m: Mission) => Result<void, AppError>,
  ): Promise<Result<Mission, AppError>> {
    return this.tele.span(op, async () => {
      const found = await this.load(id);
      if (found.isErr) return err(found.error);
      const changed = change(found.value);
      if (changed.isErr) return err(changed.error);
      const saved = await this.repo.save(found.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(found.value);
      this.tele.count(op);
      return ok(found.value);
    });
  }

  private async load(id: MissionId): Promise<Result<Mission, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Mission "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(mission: Mission): Promise<void> {
    const events: DomainEvent[] = mission.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
