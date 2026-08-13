import { describe, expect, it } from 'vitest';
import { thrown } from './thrown';

class MyError {
  public readonly customMessage: string;
  public constructor() {
    this.customMessage = 'MyError';
  }
}

class MyOtherError extends Error {
  public readonly otherCustomMessage: string;
  public constructor() {
    super();
    this.otherCustomMessage = 'MyOtherError';
  }
}

const noop = () => {};

describe('thrown()', () => {
  it('should catch specific error (one catcher)', () => {
    let message: string | null = null;

    try {
      try {
        throw new MyError();
      } catch (err) {
        thrown(err)
          .catch(MyError, e => {
            message = e.customMessage;
          })
          .rethrowUncaught();
      }
    } catch (err) {
      throw `Should not have thrown!`;
    }

    expect(message).toBe('MyError');
  });

  it('should catch specific error (multiple catchers)', () => {
    let message: string | null = null;

    try {
      try {
        throw new MyOtherError();
      } catch (err) {
        thrown(err)
          .catch(MyError, e => {
            message = e.customMessage;
          })
          .catch(MyOtherError, e => {
            message = e.otherCustomMessage;
          })
          .catch(Error, e => {
            message = e.message;
          })
          .rethrowUncaught();
      }
    } catch (err) {
      throw `Should not have thrown!`;
    }

    expect(message).toBe('MyOtherError');
  });

  it('should rethrow uncaught error', () => {
    const e = new Error('foobar');

    try {
      try {
        throw e;
      } catch (err) {
        thrown(err)
          .catch(MyError, noop)
          .catch(MyOtherError, noop)
          .rethrowUncaught();
      }
    } catch (err) {
      expect(err).toBe(e);
      return;
    }

    throw `Should have thrown!`;
  });

  it('should rethrow overridden error', () => {
    const e = new Error('overridden');

    try {
      try {
        throw new Error(`foobar`);
      } catch (err) {
        thrown(err)
          .catch(MyError, noop)
          .catch(MyOtherError, noop)
          .rethrowUncaught(e);
      }
    } catch (err) {
      expect(err).toBe(e);
      return;
    }

    throw `Should have thrown!`;
  });

  it('should catch any uncaught error', () => {
    let message: string | null = null;

    try {
      try {
        throw new Error('foobar');
      } catch (err) {
        thrown(err)
          .catch(MyError, noop)
          .catch(MyOtherError, noop)
          .catchAny<Error>(e => {
            message = e.message;
          });
      }
    } catch (err) {
      throw `Should not have thrown!`;
    }

    expect(message).toBe('foobar');
  });

  it('should catch error matching predicate', () => {
    type CustomError = { foo: 'bar' };

    const predicate = (err: any): err is CustomError => {
      return true;
    };

    let message: string | null = null;

    try {
      try {
        throw { foo: 'bar' };
      } catch (err) {
        thrown(err)
          .catch(MyError, noop)
          .catch(MyOtherError, noop)
          .catchPredicate<CustomError>(predicate, e => {
            message = e.foo;
          })
          .rethrowUncaught();
      }
    } catch (err) {
      throw `Should not have thrown!`;
    }

    expect(message).toBe('bar');
  });
});