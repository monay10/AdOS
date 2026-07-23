/**
 * ValueObject — an immutable object defined entirely by its attributes.
 * Two value objects are equal when their props are structurally equal.
 */
export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
