[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![npm version](https://badge.fury.io/js/@tselect%2Fthrown.svg)](https://badge.fury.io/js/@tselect%2Fthrown)

# thrown

Handle specific exceptions in Typescript like you would do in classic OOP languages.

## Install

`npm i @tselect/thrown`

`yarn add @tselect/thrown`

## Usage

The module exports a single utility `thrown(err)`:

```typescript
import { thrown } from '@tselect/thrown';

try {
  // Might throw TypeError.
  doSomething(someArg);
} catch (err: any) {
  thrown(err)
    .catch(TypeError, e => {
      // "e" is of type TypeError.
      // Special handling for TypeError...
    })
    .rethrowUncaught(); // Any non TypeError will be thrown.
}
```

Catch multiple error types:

```typescript
try {
  // Might throw TypeError or a custom SomeError class.
  doSomething(someArg); // Might throw TypeError.
} catch (err: any) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catch(SomeError, e => {
      // Special handling for SomeError...
    })
    // Any non TypeError will be thrown as is.
    .rethrowUncaught();
}
```

Using a predicate:

```typescript
const isSomeError = (err: any): err is CustomError => {
  return true;
}

try {
  // Might throw TypeError or a custom SomeError class.
  doSomething(someArg); // Might throw TypeError.
} catch (err: any) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catchPredicate(isSomeError, e => {
      // Special handling for SomeError...
    })
    // Any non TypeError will be thrown as is.
    .rethrowUncaught();
}
```

Catch any other type of error:

```typescript
try {
  // Might throw TypeError or a custom SomeError class.
  doSomething(someArg); // Might throw TypeError.
} catch (err: any) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catch(SomeError, e => {
      // Special handling for SomeError...
    })
    .catchAny(e => {
      // Will catch errors that are not TypeError nor SomeError.
      // Beware that you are responsible for rethrowing in this case.
    });
}
```

Rethrow a generic error:

```typescript
try {
  // Might throw TypeError or a custom SomeError class.
  doSomething(someArg); // Might throw TypeError.
} catch (err: any) {
  thrown(err)
    .catch(TypeError, e => {
      // Special handling for TypeError...
    })
    .catch(SomeError, e => {
      // Special handling for SomeError...
    })
    // If not TypeError nor SomeError, rethrow a default error.
    .rethrowUncaught(new Error(err.message));
}
```

## License

Copyright (c) 2023 Sylvain Estevez

This project is licensed under the MIT License - see the LICENSE file for details.

