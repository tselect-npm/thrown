# @tselect/thrown

[![npm](https://img.shields.io/npm/v/@tselect/thrown.svg?style=flat-square)](https://www.npmjs.com/package/@tselect/thrown)
[![npm](https://img.shields.io/npm/dm/@tselect/thrown.svg?style=flat-square)](https://www.npmjs.com/package/@tselect/thrown)
[![CI](https://img.shields.io/github/actions/workflow/status/tselect-npm/thrown/ci.yml?branch=main&style=flat-square)](https://github.com/tselect-npm/thrown/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/coverallsCoverage/github/tselect-npm/thrown?branch=main&style=flat-square)](https://coveralls.io/github/tselect-npm/thrown?branch=main)
[![license](https://img.shields.io/npm/l/@tselect/thrown.svg?style=flat-square)](./LICENSE)

Handle specific exceptions in TypeScript like you would in classic OOP languages.

JavaScript gives you one `catch` block per `try` and it catches everything, so telling one
kind of failure from another means a chain of `instanceof` checks and a manual `throw` at
the end for whatever you did not recognise. This provides the typed, per-exception handling
that `catch (SomeError e)` gives you elsewhere, and makes rethrowing the unrecognised case
something you say once rather than something you remember to write.

Zero runtime dependencies. Ships both ESM and CommonJS builds, with TypeScript types for each.

## Requirements

**Node 22 or newer** (`engines.node` is `>=22`) — every line still receiving security support. Each release is tested on 22, 24 and 26; the declared floor is the lowest version CI actually runs, not a guess.

## Installation

```bash
npm i @tselect/thrown
```

```bash
pnpm add @tselect/thrown
```

## Usage

```typescript
import { thrown } from '@tselect/thrown';

try {
  doSomething();
} catch (err) {
  thrown(err)
    .catch(TypeError, e => {
      // `e` is narrowed to TypeError.
    })
    .rethrowUncaught(); // Anything that is not a TypeError is rethrown.
}
```

`require()` works too:

```javascript
const { thrown } = require('@tselect/thrown');
```

Handlers chain, and **the first one to match wins** — later handlers are skipped, and their
predicates are not even called.

```typescript
try {
  doSomething();
} catch (err) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catch(ValidationFailure, e => {
      // Special handling for ValidationFailure...
    })
    .rethrowUncaught();
}
```

A chain ending in neither `rethrowUncaught()` nor `catchAny()` silently swallows anything
unmatched, so end with one of the two unless that is what you want.

## API

### `thrown(err: unknown): Thrown`

Wraps a caught value. `err` is `unknown` because that is what TypeScript gives you in a
`catch` clause; narrowing it is what the methods below are for.

`new Thrown(err)` is equivalent — `Thrown` is exported for when you need to name the type.

### `.catch<Err extends object>(errCtor, catcher): this`

Handles the error if it is an `instanceof errCtor`, narrowing it to that type inside
`catcher`. Does nothing if an earlier handler already matched.

The constructor does not have to derive from `Error`:

```typescript
class ValidationFailure {
  public constructor(public readonly field: string) {}
}

try {
  throw new ValidationFailure('email');
} catch (err) {
  thrown(err)
    .catch(ValidationFailure, e => {
      console.error(e.field); // 'email' — typed, no cast.
    })
    .rethrowUncaught();
}
```

### `.catchPredicate<Err extends object>(predicate, catcher): this`

Same as `.catch()`, but matches with a type predicate rather than `instanceof`. Use it for
values with no constructor to test against: plain objects, structured errors decoded from a
JSON response, or `Error`s discriminated by a `code` property.

```typescript
type HttpFailure = { status: number; body: string };

const isHttpFailure = (e: unknown): e is HttpFailure =>
  typeof e === 'object' && e !== null && 'status' in e;

try {
  throw { status: 404, body: 'not found' };
} catch (err) {
  thrown(err)
    .catchPredicate(isHttpFailure, e => {
      console.error(e.status); // 404
    })
    .rethrowUncaught();
}
```

The predicate is only called if nothing has matched yet.

### `.catchAny<T = unknown>(catcher): void`

Handles anything no earlier handler matched. Ends the chain — it returns `void`, so nothing
can follow it.

`T` defaults to `unknown`. Pass it explicitly when you know more than the type system does;
nothing has narrowed the value at this point, so that is an assertion rather than a check.

```typescript
try {
  doSomething();
} catch (err) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catchAny(e => {
      // Everything else. Rethrowing here is up to you.
    });
}
```

### `.rethrowUncaught(override?: unknown): void`

Rethrows the original value if no handler matched, and does nothing if one did. Ends the
chain.

Pass `override` to throw something else in its place — useful for not leaking an internal
failure across an API boundary:

```typescript
try {
  doSomething();
} catch (err) {
  thrown(err)
    .catch(ValidationFailure, e => {
      // Special handling for ValidationFailure...
    })
    .rethrowUncaught(new Error('Something went wrong'));
}
```

`override` is an ordinary argument, so it is constructed whether or not it ends up thrown.

### `Catcher<Err>`

`(error: Err) => void` — the handler signature, exported for when you want to name one.

## License

[MIT](./LICENSE) © Sylvain Estevez
