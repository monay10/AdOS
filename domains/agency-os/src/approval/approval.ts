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

/** Strongly-typed Approval identifier. */
export class ApprovalId extends Identifier {
  static of(value?: string): ApprovalId {
    return new ApprovalId(value ?? randomUUID());
  }
}

/**
 * The lifecycle of an approval request:
 *   draft → in_review → approved | rejected | revision_requested
 * A revision_requested request goes back to in_review when resubmitted.
 */
export type ApprovalStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'revision_requested';

/** The action that produced a transition, used to key the timeline + events. */
export type ApprovalAction = 'created' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';

/** One entry in the approval's timeline — an auditable record of a transition. */
export interface ApprovalTimelineEntry {
  action: ApprovalAction;
  from: ApprovalStatus | 'none';
  to: ApprovalStatus;
  note: string;
  actor: string;
  at: string;
}

export interface ApprovalProps {
  tenantId: string;
  title: string;
  description: string;
  requestedBy: string;
  projectId?: string;
  status: ApprovalStatus;
  timeline: ApprovalTimelineEntry[];
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class ApprovalCreated extends DomainEvent<{ title: string; requestedBy: string; tenantId: string; projectId?: string }> {
  readonly eventName = 'approval.created.v1';
}
export class ApprovalSubmitted extends DomainEvent<{ from: ApprovalStatus; to: ApprovalStatus; note: string }> {
  readonly eventName = 'approval.submitted.v1';
}
export class ApprovalApproved extends DomainEvent<{ from: ApprovalStatus; to: ApprovalStatus; note: string }> {
  readonly eventName = 'approval.approved.v1';
}
export class ApprovalRejected extends DomainEvent<{ from: ApprovalStatus; to: ApprovalStatus; note: string }> {
  readonly eventName = 'approval.rejected.v1';
}
export class ApprovalRevisionRequested extends DomainEvent<{ from: ApprovalStatus; to: ApprovalStatus; note: string }> {
  readonly eventName = 'approval.revision_requested.v1';
}

/** Input shared by every state transition. */
export interface TransitionInput {
  actor: string;
  at: string;
  note?: string;
}

/**
 * Approval — a first-class review request that moves through an explicit
 * workflow. It is the consistency boundary for its own status and keeps an
 * append-only timeline so every decision is auditable. Each transition emits a
 * domain event so other contexts can react.
 */
export class Approval extends AggregateRoot<ApprovalId> {
  private constructor(id: ApprovalId, private props: ApprovalProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    title: string;
    description?: string;
    requestedBy: string;
    projectId?: string;
    at: string;
    id?: string;
  }): Result<Approval, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.title, 'title'),
      Guard.againstEmptyString(input.requestedBy, 'requestedBy'),
    );
    if (check.isErr) return err(check.error);

    const created: ApprovalTimelineEntry = {
      action: 'created',
      from: 'none',
      to: 'draft',
      note: '',
      actor: input.requestedBy,
      at: input.at,
    };
    const approval = new Approval(ApprovalId.of(input.id), {
      tenantId: input.tenantId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      requestedBy: input.requestedBy,
      ...(input.projectId ? { projectId: input.projectId } : {}),
      status: 'draft',
      timeline: [created],
    });
    approval.addDomainEvent(
      new ApprovalCreated(
        approval.id.toString(),
        {
          title: approval.props.title,
          requestedBy: input.requestedBy,
          tenantId: input.tenantId,
          ...(input.projectId ? { projectId: input.projectId } : {}),
        },
        { tenantId: input.tenantId },
      ),
    );
    return ok(approval);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: ApprovalProps): Approval {
    return new Approval(ApprovalId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get requestedBy(): string {
    return this.props.requestedBy;
  }
  get projectId(): string | undefined {
    return this.props.projectId;
  }
  get status(): ApprovalStatus {
    return this.props.status;
  }
  get timeline(): readonly ApprovalTimelineEntry[] {
    return this.props.timeline;
  }

  snapshot(): ApprovalProps {
    return { ...this.props, timeline: this.props.timeline.map((t) => ({ ...t })) };
  }

  /** Move a draft (or a revision request) into review. */
  submit(input: TransitionInput): Result<void, ValidationError> {
    if (this.props.status !== 'draft' && this.props.status !== 'revision_requested') {
      return err(this.invalid('submit for review'));
    }
    return this.transition('submitted', 'in_review', input);
  }

  approve(input: TransitionInput): Result<void, ValidationError> {
    if (this.props.status !== 'in_review') return err(this.invalid('approve'));
    return this.transition('approved', 'approved', input);
  }

  reject(input: TransitionInput): Result<void, ValidationError> {
    if (this.props.status !== 'in_review') return err(this.invalid('reject'));
    return this.transition('rejected', 'rejected', input);
  }

  requestRevision(input: TransitionInput): Result<void, ValidationError> {
    if (this.props.status !== 'in_review') return err(this.invalid('request revision on'));
    return this.transition('revision_requested', 'revision_requested', input);
  }

  private transition(action: Exclude<ApprovalAction, 'created'>, to: ApprovalStatus, input: TransitionInput): Result<void, ValidationError> {
    const check = Guard.againstEmptyString(input.actor, 'actor');
    if (check.isErr) return err(check.error);
    const from = this.props.status;
    const note = input.note?.trim() ?? '';
    const entry: ApprovalTimelineEntry = { action, from, to, note, actor: input.actor, at: input.at };
    this.props = { ...this.props, status: to, timeline: [...this.props.timeline, entry] };
    this.addDomainEvent(this.eventFor(action, from, to, note));
    return ok(undefined);
  }

  private eventFor(action: Exclude<ApprovalAction, 'created'>, from: ApprovalStatus, to: ApprovalStatus, note: string): DomainEvent {
    const payload = { from, to, note };
    const meta = { tenantId: this.props.tenantId };
    const id = this.id.toString();
    switch (action) {
      case 'submitted':
        return new ApprovalSubmitted(id, payload, meta);
      case 'approved':
        return new ApprovalApproved(id, payload, meta);
      case 'rejected':
        return new ApprovalRejected(id, payload, meta);
      case 'revision_requested':
        return new ApprovalRevisionRequested(id, payload, meta);
    }
  }

  private invalid(action: string): ValidationError {
    return new ValidationError(`Cannot ${action} an approval that is "${this.props.status}"`, {
      details: { id: this.id.toString(), status: this.props.status },
    });
  }
}
