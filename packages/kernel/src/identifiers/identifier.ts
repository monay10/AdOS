import { randomUUID } from 'node:crypto';

/**
 * Strongly-typed entity identifier. Wraps a UUID v4 string and provides
 * value-equality. Subclass with a phantom brand per aggregate if stricter
 * type-safety is desired (e.g. `class CampaignId extends Identifier {}`).
 */
export class Identifier {
  protected constructor(private readonly value: string) {}

  static create(value?: string): Identifier {
    return new Identifier(value ?? randomUUID());
  }

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }

  equals(other?: Identifier): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof Identifier)) return false;
    return this.value === other.value;
  }
}
