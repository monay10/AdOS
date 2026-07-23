import { randomUUID } from 'node:crypto';
import {
  AggregateRoot,
  DomainEvent,
  Guard,
  Identifier,
  type Result,
  ValidationError,
  err,
  ok,
} from '@ados/kernel';
import type { Money } from '@ados/contracts';
import { MISSION_EVENTS, type MissionApprovalGate, type MissionStatus } from '@ados/contracts';

/** Strongly-typed Mission identifier. */
export class MissionId extends Identifier {
  static of(value?: string): MissionId {
    return new MissionId(value ?? randomUUID());
  }
}

export interface MissionBudget extends Money {
  period: 'daily' | 'weekly' | 'monthly' | 'total';
}

export interface MissionTargetMetric {
  name: string;
  target: number;
  unit: string;
}

export interface MissionProps {
  tenantId: string;
  workspaceId: string;
  clientId: string;
  /** The raw business objective, in the user's own words. */
  brief: string;
  budget?: MissionBudget;
  targetMetric?: MissionTargetMetric;
  deadline?: string;
  approvalGates: MissionApprovalGate[];
  status: MissionStatus;
  createdBy: string;
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class MissionSubmitted extends DomainEvent<{ workspaceId: string; clientId: string; brief: string; tenantId: string }> {
  readonly eventName = MISSION_EVENTS.SUBMITTED;
}
export class MissionPlanned extends DomainEvent<Record<string, never>> {
  readonly eventName = MISSION_EVENTS.PLANNED;
}
export class MissionApprovalRequested extends DomainEvent<{ gate: MissionApprovalGate }> {
  readonly eventName = MISSION_EVENTS.APPROVAL_REQUESTED;
}
export class MissionApproved extends DomainEvent<{ gate: MissionApprovalGate }> {
  readonly eventName = MISSION_EVENTS.APPROVED;
}
export class MissionExecuting extends DomainEvent<Record<string, never>> {
  readonly eventName = MISSION_EVENTS.EXECUTING;
}
export class MissionCompleted extends DomainEvent<Record<string, never>> {
  readonly eventName = MISSION_EVENTS.COMPLETED;
}
export class MissionFailed extends DomainEvent<{ reason: string }> {
  readonly eventName = MISSION_EVENTS.FAILED;
}

/**
 * Mission — the PRIMARY product surface. A client states a business objective in
 * natural language and the AI Company runs it autonomously. This aggregate owns
 * the mission lifecycle (submitted → planning → awaiting_approval → executing →
 * completed/failed) and the approval gates that require human sign-off.
 */
export class Mission extends AggregateRoot<MissionId> {
  private constructor(id: MissionId, private props: MissionProps) {
    super(id);
  }

  /** Submit a validated mission. Produced by the Mission Wizard. */
  static submit(input: {
    tenantId: string;
    workspaceId: string;
    clientId: string;
    brief: string;
    createdBy: string;
    budget?: MissionBudget;
    targetMetric?: MissionTargetMetric;
    deadline?: string;
    approvalGates?: MissionApprovalGate[];
    id?: string;
  }): Result<Mission, ValidationError> {
    const check = validateMission(input);
    if (check.isErr) return err(check.error);

    const mission = new Mission(MissionId.of(input.id), {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      brief: input.brief.trim(),
      ...(input.budget ? { budget: input.budget } : {}),
      ...(input.targetMetric ? { targetMetric: input.targetMetric } : {}),
      ...(input.deadline ? { deadline: input.deadline } : {}),
      approvalGates: input.approvalGates ?? ['strategy_and_budget', 'campaign_launch'],
      status: 'submitted',
      createdBy: input.createdBy,
    });
    mission.addDomainEvent(
      new MissionSubmitted(
        mission.id.toString(),
        { workspaceId: input.workspaceId, clientId: input.clientId, brief: mission.props.brief, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(mission);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: MissionProps): Mission {
    return new Mission(MissionId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get brief(): string {
    return this.props.brief;
  }
  get budget(): MissionBudget | undefined {
    return this.props.budget;
  }
  get targetMetric(): MissionTargetMetric | undefined {
    return this.props.targetMetric;
  }
  get approvalGates(): readonly MissionApprovalGate[] {
    return this.props.approvalGates;
  }
  get status(): MissionStatus {
    return this.props.status;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }

  snapshot(): MissionProps {
    return {
      ...this.props,
      ...(this.props.budget ? { budget: { ...this.props.budget } } : {}),
      ...(this.props.targetMetric ? { targetMetric: { ...this.props.targetMetric } } : {}),
      approvalGates: [...this.props.approvalGates],
    };
  }

  plan(): Result<void, ValidationError> {
    if (this.props.status !== 'submitted') return this.invalidTransition('plan');
    this.props = { ...this.props, status: 'planning' };
    this.addDomainEvent(new MissionPlanned(this.id.toString(), {}, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  requestApproval(gate: MissionApprovalGate): Result<void, ValidationError> {
    if (this.props.status !== 'planning' && this.props.status !== 'executing') {
      return this.invalidTransition('requestApproval');
    }
    this.props = { ...this.props, status: 'awaiting_approval' };
    this.addDomainEvent(new MissionApprovalRequested(this.id.toString(), { gate }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  approve(gate: MissionApprovalGate): Result<void, ValidationError> {
    if (this.props.status !== 'awaiting_approval') return this.invalidTransition('approve');
    this.props = { ...this.props, status: 'planning' };
    this.addDomainEvent(new MissionApproved(this.id.toString(), { gate }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  startExecuting(): Result<void, ValidationError> {
    if (this.props.status !== 'planning') return this.invalidTransition('startExecuting');
    this.props = { ...this.props, status: 'executing' };
    this.addDomainEvent(new MissionExecuting(this.id.toString(), {}, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  complete(): Result<void, ValidationError> {
    if (this.props.status !== 'executing') return this.invalidTransition('complete');
    this.props = { ...this.props, status: 'completed' };
    this.addDomainEvent(new MissionCompleted(this.id.toString(), {}, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  fail(reason: string): Result<void, ValidationError> {
    if (this.props.status === 'completed' || this.props.status === 'failed') {
      return this.invalidTransition('fail');
    }
    this.props = { ...this.props, status: 'failed' };
    this.addDomainEvent(new MissionFailed(this.id.toString(), { reason }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  private invalidTransition(action: string): Result<void, ValidationError> {
    return err(
      new ValidationError(`Cannot ${action} a mission in status "${this.props.status}"`, {
        details: { id: this.id.toString(), status: this.props.status, action },
      }),
    );
  }
}

export function validateMission(input: {
  tenantId: string;
  workspaceId: string;
  clientId: string;
  brief: string;
  createdBy: string;
  budget?: MissionBudget;
  targetMetric?: MissionTargetMetric;
}): Result<void, ValidationError> {
  const check = Guard.all(
    Guard.againstEmptyString(input.tenantId, 'tenantId'),
    Guard.againstEmptyString(input.workspaceId, 'workspaceId'),
    Guard.againstEmptyString(input.clientId, 'clientId'),
    Guard.againstEmptyString(input.createdBy, 'createdBy'),
    Guard.minLength(input.brief.trim(), 10, 'brief'),
  );
  if (check.isErr) return check;
  if (input.budget && input.budget.amountMinor <= 0) {
    return err(new ValidationError('budget amount must be positive', { details: { field: 'budget.amountMinor' } }));
  }
  if (input.targetMetric && input.targetMetric.target <= 0) {
    return err(new ValidationError('target metric must be positive', { details: { field: 'targetMetric.target' } }));
  }
  return ok(undefined);
}
