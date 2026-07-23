import { Identifier } from '../identifiers/identifier.js';

/**
 * Entity — an object with a stable identity that persists across state changes.
 * Equality is by identity, not by attributes.
 */
export abstract class Entity<TId extends Identifier = Identifier> {
  protected readonly _id: TId;

  protected constructor(id: TId) {
    this._id = id;
  }

  get id(): TId {
    return this._id;
  }

  equals(other?: Entity<TId>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this._id.equals(other._id);
  }
}
