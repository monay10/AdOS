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

/** Strongly-typed Asset identifier. */
export class AssetId extends Identifier {
  static of(value?: string): AssetId {
    return new AssetId(value ?? randomUUID());
  }
}

/** The kind of asset, which also decides how it previews. */
export type AssetKind = 'image' | 'copy' | 'document' | 'link';

const KINDS: readonly AssetKind[] = ['image', 'copy', 'document', 'link'];

/** One immutable version of an asset's content. */
export interface AssetVersion {
  version: number;
  content: string;
  note: string;
  by: string;
  at: string;
}

export interface AssetProps {
  tenantId: string;
  clientId: string;
  brandId?: string;
  projectId?: string;
  name: string;
  kind: AssetKind;
  tags: string[];
  versions: AssetVersion[];
}

// ── Domain events ─────────────────────────────────────────────────────────────
export class AssetCreated extends DomainEvent<{ clientId: string; name: string; kind: AssetKind; tenantId: string }> {
  readonly eventName = 'asset.created.v1';
}
export class AssetVersionAdded extends DomainEvent<{ version: number }> {
  readonly eventName = 'asset.version_added.v1';
}
export class AssetTagAdded extends DomainEvent<{ tag: string }> {
  readonly eventName = 'asset.tag_added.v1';
}

/**
 * Asset — a reusable file/copy in the library, organised under a client (and
 * optionally a brand + project). It is the consistency boundary for its own
 * tags and its append-only version history: content is never overwritten, a new
 * version is added instead. Each change emits a domain event.
 */
export class Asset extends AggregateRoot<AssetId> {
  private constructor(id: AssetId, private props: AssetProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    clientId: string;
    brandId?: string;
    projectId?: string;
    name: string;
    kind: AssetKind;
    content: string;
    tags?: string[];
    by: string;
    at: string;
    id?: string;
  }): Result<Asset, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.clientId, 'clientId'),
      Guard.againstEmptyString(input.name, 'name'),
      Guard.againstEmptyString(input.content, 'content'),
      Guard.oneOf(input.kind, KINDS, 'kind'),
    );
    if (check.isErr) return err(check.error);

    const first: AssetVersion = { version: 1, content: input.content.trim(), note: 'Initial version', by: input.by, at: input.at };
    const tags = dedupeTags(input.tags ?? []);
    const asset = new Asset(AssetId.of(input.id), {
      tenantId: input.tenantId,
      clientId: input.clientId,
      ...(input.brandId ? { brandId: input.brandId } : {}),
      ...(input.projectId ? { projectId: input.projectId } : {}),
      name: input.name.trim(),
      kind: input.kind,
      tags,
      versions: [first],
    });
    asset.addDomainEvent(
      new AssetCreated(
        asset.id.toString(),
        { clientId: input.clientId, name: asset.props.name, kind: input.kind, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(asset);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: AssetProps): Asset {
    return new Asset(AssetId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get brandId(): string | undefined {
    return this.props.brandId;
  }
  get projectId(): string | undefined {
    return this.props.projectId;
  }
  get name(): string {
    return this.props.name;
  }
  get kind(): AssetKind {
    return this.props.kind;
  }
  get tags(): readonly string[] {
    return this.props.tags;
  }
  get versions(): readonly AssetVersion[] {
    return this.props.versions;
  }
  /** The highest version number — the one that previews. */
  get currentVersion(): number {
    return this.props.versions.length;
  }
  get currentContent(): string {
    return this.props.versions[this.props.versions.length - 1]?.content ?? '';
  }

  snapshot(): AssetProps {
    return {
      ...this.props,
      tags: [...this.props.tags],
      versions: this.props.versions.map((v) => ({ ...v })),
    };
  }

  /** Add a new version of the content; the previous versions are kept. */
  addVersion(input: { content: string; note?: string; by: string; at: string }): Result<void, ValidationError> {
    const check = Guard.againstEmptyString(input.content, 'content');
    if (check.isErr) return err(check.error);
    const version = this.props.versions.length + 1;
    const entry: AssetVersion = { version, content: input.content.trim(), note: input.note?.trim() ?? '', by: input.by, at: input.at };
    this.props = { ...this.props, versions: [...this.props.versions, entry] };
    this.addDomainEvent(new AssetVersionAdded(this.id.toString(), { version }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }

  /** Add a tag. A duplicate is a no-op (no event). */
  addTag(tag: string): Result<void, ValidationError> {
    const check = Guard.againstEmptyString(tag, 'tag');
    if (check.isErr) return err(check.error);
    const normalized = tag.trim().toLowerCase();
    if (this.props.tags.includes(normalized)) return ok(undefined);
    this.props = { ...this.props, tags: [...this.props.tags, normalized] };
    this.addDomainEvent(new AssetTagAdded(this.id.toString(), { tag: normalized }, { tenantId: this.props.tenantId }));
    return ok(undefined);
  }
}

function dedupeTags(tags: string[]): string[] {
  const out: string[] = [];
  for (const t of tags) {
    const n = t.trim().toLowerCase();
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}

export { KINDS as ASSET_KINDS };
