import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import { Approval, type ApprovalId, type TransitionInput } from './approval.js';
import type { ApprovalRepository } from './repository.js';

export interface CreateApprovalInput {
  tenantId: string;
  title: string;
  description?: string;
  requestedBy: string;
  projectId?: string;
  at: string;
}

/**
 * Approval Application Service — the transactional entry point for the approval
 * workflow: create a request, then submit / approve / reject / request revision.
 * Every transition persists the aggregate, appends to its timeline and publishes
 * the matching domain event. Traced, logged and metered.
 */
export class ApprovalService {
  private readonly tele: Telemetry = telemetry('agency-os.approval');

  constructor(private readonly repo: ApprovalRepository, private readonly bus: EventBus) {}

  async create(input: CreateApprovalInput): Promise<Result<Approval, AppError>> {
    return this.tele.span('create', async () => {
      const created = Approval.create(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('created');
      this.tele.logger.info(
        { approvalId: created.value.id.toString(), requestedBy: input.requestedBy },
        'approval created',
      );
      return ok(created.value);
    });
  }

  async submit(id: ApprovalId, input: TransitionInput): Promise<Result<Approval, AppError>> {
    return this.mutate('submit', id, (a) => a.submit(input));
  }

  async approve(id: ApprovalId, input: TransitionInput): Promise<Result<Approval, AppError>> {
    return this.mutate('approve', id, (a) => a.approve(input));
  }

  async reject(id: ApprovalId, input: TransitionInput): Promise<Result<Approval, AppError>> {
    return this.mutate('reject', id, (a) => a.reject(input));
  }

  async requestRevision(id: ApprovalId, input: TransitionInput): Promise<Result<Approval, AppError>> {
    return this.mutate('request_revision', id, (a) => a.requestRevision(input));
  }

  async list(projectId?: string): Promise<Approval[]> {
    return this.tele.span('list', async () => this.repo.list(projectId));
  }

  async get(id: ApprovalId): Promise<Result<Approval, AppError>> {
    return this.load(id);
  }

  private async mutate(
    op: string,
    id: ApprovalId,
    change: (a: Approval) => Result<void, AppError>,
  ): Promise<Result<Approval, AppError>> {
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

  private async load(id: ApprovalId): Promise<Result<Approval, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Approval "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(approval: Approval): Promise<void> {
    const events: DomainEvent[] = approval.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
