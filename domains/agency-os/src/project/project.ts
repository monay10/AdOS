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

/** Strongly-typed Project identifier. */
export class ProjectId extends Identifier {
  static of(value?: string): ProjectId {
    return new ProjectId(value ?? randomUUID());
  }
}

/** A measurable goal the project is working toward. */
export interface ProjectGoal {
  description: string;
  metric: string;
  target: number;
}

/** A person working on the project. */
export interface ProjectMember {
  name: string;
  email: string;
  role: string;
}

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

const STATUSES: readonly ProjectStatus[] = ['active', 'paused', 'completed', 'archived'];

export interface ProjectProps {
  tenantId: string;
  clientId: string;
  brandId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  goals: ProjectGoal[];
  members: ProjectMember[];
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class ProjectCreated extends DomainEvent<{ clientId: string; brandId: string; name: string; tenantId: string }> {
  readonly eventName = 'project.created.v1';
}
export class ProjectUpdated extends DomainEvent<{ changes: Partial<Pick<ProjectProps, 'name' | 'description'>> }> {
  readonly eventName = 'project.updated.v1';
}
export class ProjectStatusChanged extends DomainEvent<{ status: ProjectStatus }> {
  readonly eventName = 'project.status_changed.v1';
}
export class ProjectGoalAdded extends DomainEvent<{ goal: ProjectGoal }> {
  readonly eventName = 'project.goal_added.v1';
}
export class ProjectMemberAdded extends DomainEvent<{ member: ProjectMember }> {
  readonly eventName = 'project.member_added.v1';
}
export class ProjectArchived extends DomainEvent<Record<string, never>> {
  readonly eventName = 'project.archived.v1';
}

/**
 * Project — a body of work a client runs under one of its brands. Owns the
 * Missions (and, through them, their briefs, creatives, campaigns and reports)
 * executed for that brand. Consistency boundary for the project's status, goals
 * and members.
 */
export class Project extends AggregateRoot<ProjectId> {
  private constructor(id: ProjectId, private props: ProjectProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    clientId: string;
    brandId: string;
    name: string;
    description?: string;
    id?: string;
  }): Result<Project, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.clientId, 'clientId'),
      Guard.againstEmptyString(input.brandId, 'brandId'),
      Guard.againstEmptyString(input.name, 'name'),
    );
    if (check.isErr) return err(check.error);

    const project = new Project(ProjectId.of(input.id), {
      tenantId: input.tenantId,
      clientId: input.clientId,
      brandId: input.brandId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      status: 'active',
      goals: [],
      members: [],
    });
    project.addDomainEvent(
      new ProjectCreated(
        project.id.toString(),
        { clientId: input.clientId, brandId: input.brandId, name: project.props.name, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(project);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: ProjectProps): Project {
    return new Project(ProjectId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get brandId(): string {
    return this.props.brandId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get status(): ProjectStatus {
    return this.props.status;
  }
  get goals(): readonly ProjectGoal[] {
    return this.props.goals;
  }
  get members(): readonly ProjectMember[] {
    return this.props.members;
  }

  snapshot(): ProjectProps {
    return {
      ...this.props,
      goals: this.props.goals.map((g) => ({ ...g })),
      members: this.props.members.map((m) => ({ ...m })),
    };
  }

  update(changes: { name?: string; description?: string }): Result<void, ValidationError> {
    this.guardActive();
    if (changes.name !== undefined) {
      const check = Guard.againstEmptyString(changes.name, 'name');
      if (check.isErr) return check;
    }
    const applied: Partial<Pick<ProjectProps, 'name' | 'description'>> = {};
    if (changes.name !== undefined) applied.name = changes.name.trim();
    if (changes.description !== undefined) applied.description = changes.description.trim();
    this.props = { ...this.props, ...applied };
    this.addDomainEvent(new ProjectUpdated(this.id.toString(), { changes: applied }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  changeStatus(status: ProjectStatus): Result<void, ValidationError> {
    this.guardActive();
    const check = Guard.oneOf(status, ['active', 'paused', 'completed'] as const, 'status');
    if (check.isErr) return check;
    this.props = { ...this.props, status };
    this.addDomainEvent(new ProjectStatusChanged(this.id.toString(), { status }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  addGoal(goal: ProjectGoal): Result<void, ValidationError> {
    this.guardActive();
    const check = Guard.all(
      Guard.againstEmptyString(goal.description, 'goal.description'),
      Guard.againstEmptyString(goal.metric, 'goal.metric'),
    );
    if (check.isErr) return check;
    const created: ProjectGoal = { description: goal.description.trim(), metric: goal.metric.trim(), target: goal.target };
    this.props = { ...this.props, goals: [...this.props.goals, created] };
    this.addDomainEvent(new ProjectGoalAdded(this.id.toString(), { goal: created }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  addMember(member: ProjectMember): Result<void, ValidationError> {
    this.guardActive();
    const check = Guard.all(
      Guard.againstEmptyString(member.name, 'member.name'),
      Guard.againstEmptyString(member.email, 'member.email'),
    );
    if (check.isErr) return check;
    const created: ProjectMember = { name: member.name.trim(), email: member.email.trim(), role: member.role.trim() || 'member' };
    this.props = { ...this.props, members: [...this.props.members, created] };
    this.addDomainEvent(new ProjectMemberAdded(this.id.toString(), { member: created }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  archive(): void {
    if (this.props.status === 'archived') return;
    this.props = { ...this.props, status: 'archived' };
    this.addDomainEvent(new ProjectArchived(this.id.toString(), {}, { tenantId: this.props.tenantId }));
  }

  private guardActive(): void {
    if (this.props.status === 'archived') {
      throw new ValidationError('Project is archived', { details: { id: this.id.toString() } });
    }
  }
}

export { STATUSES as PROJECT_STATUSES };
