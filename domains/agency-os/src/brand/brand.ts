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

/** Strongly-typed Brand identifier. */
export class BrandId extends Identifier {
  static of(value?: string): BrandId {
    return new BrandId(value ?? randomUUID());
  }
}

/** Brand Profile — who the brand is and how it speaks. */
export interface BrandProfile {
  mission: string;
  values: string[];
  voice: string;
  targetAudience: string;
}

/** Brand Identity — the visual system. */
export interface BrandIdentity {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  typography: string;
}

/** Brand Rules — do/don't constraints the AI Company must respect. */
export interface BrandRules {
  dos: string[];
  donts: string[];
  bannedWords: string[];
}

/** A named brand asset (logo, style guide, image) held in storage. */
export interface BrandAsset {
  id: string;
  kind: 'logo' | 'image' | 'document' | 'font' | 'other';
  name: string;
  url: string;
}

export type BrandStatus = 'active' | 'archived';

export interface BrandProps {
  tenantId: string;
  clientId: string;
  name: string;
  profile: BrandProfile;
  identity: BrandIdentity;
  rules: BrandRules;
  assets: BrandAsset[];
  status: BrandStatus;
}

const DEFAULT_PROFILE: BrandProfile = { mission: '', values: [], voice: 'professional', targetAudience: '' };
const DEFAULT_IDENTITY: BrandIdentity = { primaryColor: '#000000', secondaryColor: '#ffffff', typography: 'sans-serif' };
const DEFAULT_RULES: BrandRules = { dos: [], donts: [], bannedWords: [] };

// ── Domain events ─────────────────────────────────────────────────────────────
export class BrandCreated extends DomainEvent<{ clientId: string; name: string; tenantId: string }> {
  readonly eventName = 'brand.created.v1';
}
export class BrandProfileUpdated extends DomainEvent<{ profile: BrandProfile }> {
  readonly eventName = 'brand.profile_updated.v1';
}
export class BrandIdentityUpdated extends DomainEvent<{ identity: BrandIdentity }> {
  readonly eventName = 'brand.identity_updated.v1';
}
export class BrandRulesUpdated extends DomainEvent<{ rules: BrandRules }> {
  readonly eventName = 'brand.rules_updated.v1';
}
export class BrandAssetAdded extends DomainEvent<{ asset: BrandAsset }> {
  readonly eventName = 'brand.asset_added.v1';
}
export class BrandArchived extends DomainEvent<Record<string, never>> {
  readonly eventName = 'brand.archived.v1';
}

/**
 * Brand — a client's brand. Holds the profile (voice/values), identity (visual
 * system), rules (do/don't constraints the AI Company must obey) and assets.
 * The single source of brand truth the Creative Studio and reviewers consult.
 */
export class Brand extends AggregateRoot<BrandId> {
  private constructor(id: BrandId, private props: BrandProps) {
    super(id);
  }

  static create(input: {
    tenantId: string;
    clientId: string;
    name: string;
    profile?: Partial<BrandProfile>;
    identity?: Partial<BrandIdentity>;
    rules?: Partial<BrandRules>;
    id?: string;
  }): Result<Brand, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.clientId, 'clientId'),
      Guard.againstEmptyString(input.name, 'name'),
    );
    if (check.isErr) return err(check.error);

    const brand = new Brand(BrandId.of(input.id), {
      tenantId: input.tenantId,
      clientId: input.clientId,
      name: input.name.trim(),
      profile: { ...DEFAULT_PROFILE, ...input.profile },
      identity: { ...DEFAULT_IDENTITY, ...input.identity },
      rules: { ...DEFAULT_RULES, ...input.rules },
      assets: [],
      status: 'active',
    });
    brand.addDomainEvent(
      new BrandCreated(
        brand.id.toString(),
        { clientId: input.clientId, name: brand.props.name, tenantId: input.tenantId },
        { tenantId: input.tenantId },
      ),
    );
    return ok(brand);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: BrandProps): Brand {
    return new Brand(BrandId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get name(): string {
    return this.props.name;
  }
  get profile(): BrandProfile {
    return this.props.profile;
  }
  get identity(): BrandIdentity {
    return this.props.identity;
  }
  get rules(): BrandRules {
    return this.props.rules;
  }
  get assets(): readonly BrandAsset[] {
    return this.props.assets;
  }
  get status(): BrandStatus {
    return this.props.status;
  }

  snapshot(): BrandProps {
    return {
      ...this.props,
      profile: { ...this.props.profile, values: [...this.props.profile.values] },
      identity: { ...this.props.identity },
      rules: {
        dos: [...this.props.rules.dos],
        donts: [...this.props.rules.donts],
        bannedWords: [...this.props.rules.bannedWords],
      },
      assets: this.props.assets.map((a) => ({ ...a })),
    };
  }

  updateProfile(profile: Partial<BrandProfile>): void {
    this.guardActive();
    this.props = { ...this.props, profile: { ...this.props.profile, ...profile } };
    this.addDomainEvent(new BrandProfileUpdated(this.id.toString(), { profile: this.props.profile }, { tenantId: this.props.tenantId }));
  }

  updateIdentity(identity: Partial<BrandIdentity>): void {
    this.guardActive();
    this.props = { ...this.props, identity: { ...this.props.identity, ...identity } };
    this.addDomainEvent(new BrandIdentityUpdated(this.id.toString(), { identity: this.props.identity }, { tenantId: this.props.tenantId }));
  }

  updateRules(rules: Partial<BrandRules>): void {
    this.guardActive();
    this.props = { ...this.props, rules: { ...this.props.rules, ...rules } };
    this.addDomainEvent(new BrandRulesUpdated(this.id.toString(), { rules: this.props.rules }, { tenantId: this.props.tenantId }));
  }

  addAsset(asset: { kind: BrandAsset['kind']; name: string; url: string; id?: string }): Result<BrandAsset, ValidationError> {
    this.guardActive();
    const check = Guard.all(
      Guard.againstEmptyString(asset.name, 'asset.name'),
      Guard.againstEmptyString(asset.url, 'asset.url'),
    );
    if (check.isErr) return err(check.error);
    const created: BrandAsset = { id: asset.id ?? randomUUID(), kind: asset.kind, name: asset.name.trim(), url: asset.url.trim() };
    this.props = { ...this.props, assets: [...this.props.assets, created] };
    this.addDomainEvent(new BrandAssetAdded(this.id.toString(), { asset: created }, { tenantId: this.props.tenantId }));
    return ok(created);
  }

  archive(): void {
    if (this.props.status === 'archived') return;
    this.props = { ...this.props, status: 'archived' };
    this.addDomainEvent(new BrandArchived(this.id.toString(), {}, { tenantId: this.props.tenantId }));
  }

  private guardActive(): void {
    if (this.props.status === 'archived') {
      throw new ValidationError('Brand is archived', { details: { id: this.id.toString() } });
    }
  }
}
