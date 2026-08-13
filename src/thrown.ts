/**
 * Utility type to constrain classes as parameter.
 *
 * `never[]` rather than `any[]` for the constructor arguments: they are never
 * called, only used as the right operand of `instanceof`, and `never` accepts
 * any parameter list contravariantly.
 */
type Constructor<T extends object> = new (...args: never[]) => T;

type Predicate<T> = (v: unknown) => v is T;

/**
 * Handler for a caught error.
 */
export type Catcher<Err> = (error: Err) => void;

/**
 * Thrown
 */
export class Thrown {
  private readonly err: unknown;
  private caught: boolean;

  public constructor(err: unknown) {
    this.err = err;
    this.caught = false;
  }

  /**
   * Same as catch(), but using a predicate to match the error type.
   */
  public catchPredicate<Err extends object>(predicate: Predicate<Err>, catcher: Catcher<Err>): this {
    if (!this.caught) {
      if (predicate(this.err)) {
        this.caught = true;
        catcher(this.err);
      }
    }

    return this;
  }

  /**
   * Catch a specific error type. Doing so will prevent the error from being rethrown.
   * Note that the constructor does not have to derive from Error.
   */
  public catch<Err extends object>(errCtor: Constructor<Err>, catcher: Catcher<Err>): this {
    if (!this.caught) {
      if (this.err instanceof errCtor) {
        this.caught = true;
        catcher(this.err);
      }
    }

    return this;
  }

  /**
   * Catch any error not matching a specific handler.
   */
  public catchAny<T = unknown>(catcher: Catcher<T>) {
    if (!this.caught) {
      // The only unchecked cast in the file. `catchAny` is the escape hatch: by
      // definition nothing has narrowed `err`, so `T` is whatever the caller
      // asserts it is. Default it to `unknown` and callers who want more must
      // ask for it explicitly.
      catcher(this.err as T);
    }
  }

  /**
   * Rethrow any error that did not have a specific handler.
   */
  public rethrowUncaught(override?: unknown) {
    if (!this.caught) {
      throw override ?? this.err;
    }
  }
}

/**
 * Convenience export.
 */
export function thrown(err: unknown): Thrown {
  return new Thrown(err);
}
