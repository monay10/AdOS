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

/** Strongly-typed Client identifier. */
export class ClientId extends Identifier {
  static of(value?: string): ClientId {
    return new ClientId(value ?? randomUUID());
  }
}

export interface ClientContact {
  email: string;
  phone?: string;
  website?: string;
}

export type ClientStatus = 'active' | 'archived';

export interface ClientProps {
  tenantId: string;
  workspaceId: string;
  name: string;
  industry: string;
  contact: ClientContact;
  status: ClientStatus;
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class ClientCreated extends DomainEvent<{ workspaceId: string; name: string; tenantId: string }> {
  readonly eventName = 'client.created.v1';
}
export class ClientUpdated extends DomainEvent<{ changes: Partial<Pick<ClientProps, 'name' | 'industry' | 'contact'>> }> {
  readonly eventName = 'client.updated.v1';
}
export class ClientArchived extends DomainEvent<Record<string, never>> {
  readonly eventName = 'client.archived.v1';
}

/**
 * Client — a customer of the agency, living inside a Workspace. Owns the brands,
 * products and missions the AI Company works on. Consistency boundary for the
 * client's identity and contact details.
 */
export class Client extends AggregateRoot<ClientId> {
  private constructor(id: ClientId, private props: ClientProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    workspaceId: string;
    name: string;
    industry?: string;
    contact: ClientContact;
    id?: string;
  }): Result<Client, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.workspaceId, 'workspaceId'),
      Guard.againstEmptyString(input.name, 'name'),
      Guard.againstEmptyString(input.contact.email, 'contact.email'),
    );
    if (check.isErr) return err(check.error);

    const client = new Client(ClientId.of(input.id), {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      name: input.name.trim(),
      industry: input.industry?.trim() ?? 'general',
      contact: { ...input.contact, email: input.contact.email.trim() },
      status: 'active',
    });
    client.addDomainEvent(
      new ClientCreated(
        client.id.toString(),
        { workspaceId: input.workspaceId, name: client.props.name, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(client);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: ClientProps): Client {
    return new Client(ClientId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get name(): string {
    return this.props.name;
  }
  get industry(): string {
    return this.props.industry;
  }
  get contact(): ClientContact {
    return this.props.contact;
  }
  get status(): ClientStatus {
    return this.props.status;
  }

  snapshot(): ClientProps {
    return { ...this.props, contact: { ...this.props.contact } };
  }

  update(changes: { name?: string; industry?: string; contact?: Partial<ClientContact> }): Result<void, ValidationError> {
    this.guardActive();
    if (changes.name !== undefined) {
      const check = Guard.againstEmptyString(changes.name, 'name');
      if (check.isErr) return check;
    }
    if (changes.contact?.email !== undefined) {
      const check = Guard.againstEmptyString(changes.contact.email, 'contact.email');
      if (check.isErr) return check;
    }
    const applied: Partial<Pick<ClientProps, 'name' | 'industry' | 'contact'>> = {};
    if (changes.name !== undefined) applied.name = changes.name.trim();
    if (changes.industry !== undefined) applied.industry = changes.industry.trim();
    if (changes.contact !== undefined) applied.contact = { ...this.props.contact, ...changes.contact };
    this.props = { ...this.props, ...applied };
    this.addDomainEvent(new ClientUpdated(this.id.toString(), { changes: applied }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  archive(): void {
    if (this.props.status === 'archived') return;
    this.props = { ...this.props, status: 'archived' };
    this.addDomainEvent(new ClientArchived(this.id.toString(), {}, { tenantId: this.props.tenantId }));
  }

  private guardActive(): void {
    if (this.props.status === 'archived') {
      throw new ValidationError('Client is archived', { details: { id: this.id.toString() } });
    }
  }
}
