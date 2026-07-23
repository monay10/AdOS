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

/** Strongly-typed Workspace identifier. */
export class WorkspaceId extends Identifier {
  static of(value?: string): WorkspaceId {
    return new WorkspaceId(value ?? randomUUID());
  }
}

export interface WorkspaceSettings {
  locale: string;
  timezone: string;
  currency: string;
}

export interface WorkspaceConfiguration {
  /** Feature flags scoped to the workspace. */
  features: Record<string, boolean>;
}

export type WorkspaceStatus = 'active' | 'deleted';

const DEFAULT_SETTINGS: WorkspaceSettings = { locale: 'en', timezone: 'UTC', currency: 'USD' };

export interface WorkspaceProps {
  tenantId: string;
  name: string;
  settings: WorkspaceSettings;
  configuration: WorkspaceConfiguration;
  status: WorkspaceStatus;
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class WorkspaceCreated extends DomainEvent<{ name: string; tenantId: string }> {
  readonly eventName = 'workspace.created.v1';
}
export class WorkspaceUpdated extends DomainEvent<{ changes: Partial<Pick<WorkspaceProps, 'name' | 'configuration'>> }> {
  readonly eventName = 'workspace.updated.v1';
}
export class WorkspaceSettingsChanged extends DomainEvent<{ settings: WorkspaceSettings }> {
  readonly eventName = 'workspace.settings_changed.v1';
}
export class WorkspaceDeleted extends DomainEvent<Record<string, never>> {
  readonly eventName = 'workspace.deleted.v1';
}

/**
 * Workspace — the top-level container a client's brands, products and missions
 * live in. Consistency boundary for workspace-level settings and configuration.
 */
export class Workspace extends AggregateRoot<WorkspaceId> {
  private constructor(id: WorkspaceId, private props: WorkspaceProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    name: string;
    settings?: Partial<WorkspaceSettings>;
    configuration?: Partial<WorkspaceConfiguration>;
    id?: string;
  }): Result<Workspace, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.name, 'name'),
    );
    if (check.isErr) return err(check.error);

    const workspace = new Workspace(WorkspaceId.of(input.id), {
      tenantId: input.tenantId,
      name: input.name.trim(),
      settings: { ...DEFAULT_SETTINGS, ...input.settings },
      configuration: { features: input.configuration?.features ?? {} },
      status: 'active',
    });
    workspace.addDomainEvent(
      new WorkspaceCreated(workspace.id.toString(), { name: workspace.props.name, tenantId: input.tenantId }, { tenantId: input.tenantId }),
    );
    return ok(workspace);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: WorkspaceProps): Workspace {
    return new Workspace(WorkspaceId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get name(): string {
    return this.props.name;
  }
  get settings(): WorkspaceSettings {
    return this.props.settings;
  }
  get configuration(): WorkspaceConfiguration {
    return this.props.configuration;
  }
  get status(): WorkspaceStatus {
    return this.props.status;
  }

  snapshot(): WorkspaceProps {
    return { ...this.props, settings: { ...this.props.settings }, configuration: { features: { ...this.props.configuration.features } } };
  }

  rename(name: string): Result<void, ValidationError> {
    const check = Guard.againstEmptyString(name, 'name');
    if (check.isErr) return check;
    this.guardActive();
    this.props = { ...this.props, name: name.trim() };
    this.addDomainEvent(new WorkspaceUpdated(this.id.toString(), { changes: { name: this.props.name } }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  configure(features: Record<string, boolean>): void {
    this.guardActive();
    this.props = { ...this.props, configuration: { features: { ...this.props.configuration.features, ...features } } };
    this.addDomainEvent(new WorkspaceUpdated(this.id.toString(), { changes: { configuration: this.props.configuration } }, { tenantId: this.props.tenantId }));
  }

  updateSettings(settings: Partial<WorkspaceSettings>): void {
    this.guardActive();
    this.props = { ...this.props, settings: { ...this.props.settings, ...settings } };
    this.addDomainEvent(new WorkspaceSettingsChanged(this.id.toString(), { settings: this.props.settings }, { tenantId: this.props.tenantId }));
  }

  markDeleted(): void {
    if (this.props.status === 'deleted') return;
    this.props = { ...this.props, status: 'deleted' };
    this.addDomainEvent(new WorkspaceDeleted(this.id.toString(), {}, { tenantId: this.props.tenantId }));
  }

  private guardActive(): void {
    if (this.props.status === 'deleted') throw new ValidationError('Workspace is deleted', { details: { id: this.id.toString() } });
  }
}
