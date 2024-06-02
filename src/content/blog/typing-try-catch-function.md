---
title: 'Typing a try-catch function'
pubDate: 2021-03-28
description: A fully-typed abstraction of the try-catch pattern in TypeScript.
---

## Introduction

When coding anything which relies on data from an untrusted source, it's common to need to parse things that
might not be in the format you expect.

For example, let's say you're integrating with a slightly dodgy API that might return either of the following on error:

- A JSON object with an `error` key containing an explanation of what went wrong,
  e.g. `{"error":"Please contact support", "code": "1234"}`
- a plain, non-JSON string of something like `Internal Server Error` or `Service Unavailable`

If you get an error code, you'll need to send it to support, but if not, there's not much you can do, so you'll do nothing.

The code might look something like this:

```typescript
const { status, body } = await yourFavouriteHttpClient('/dodgy-api');
if (status !== 200) {
  let errorCode: string;
  try {
    errorCode = JSON.parse(body).code;
  } catch (_) {}
  if (errorCode) {
    await sendToSupport(errorCode);
  }
}
```

If you're doing this sort of thing a lot, it can make the code quite difficult to read, with lots of `let` and `try`-`catch` statements flying around. So it makes sense to introduce an abstraction, which we'll call `safe()`. It encapsulates the idea of trying a function and returning a default
result if it throws an error:

```typescript
function safe(action: () => string): string | undefined {
  try {
    return action();
  } catch (_) {}
}
```

Now it looks much cleaner:

```typescript
const result = yourFavouriteHttpClient('/dodgy-api');
if (result.status !== 200) {
  const errorCode = safe(() => JSON.parse(result.bodyString).code);
  if (errorCode) {
    await sendToSupport(errorCode);
  }
}
```

## How do we type this?

Now that we've tidied up that piece of code, we start to see other places where a similar abstraction could come in useful.

Here's another case. This time, we're trying to standardise user-entered strings that represent currency amounts. If we didn't recognise the value, we want to return a warning instead. We're delegating the parsing bit to some library call, `parseMoney()`, which throws an error if given invalid input.

```typescript
function formatCurrency(rawValue: string): string {
  let money: Money;
  try {
    money = parseMoney(rawValue);
    return `${money.value} ${money.currency}`;
  } catch (e) {
    return INVALID_CURRENCY_WARNING;
  }
}
```

If we used `safe()`, we could turn this into a single expression:

```typescript
function formatCurrency(rawValue: string): string {
  const money = safe(() => parseMoney(rawValue));
  return money ? money.toShortString() : INVALID_CURRENCY_WARNING;
}
```

Now, though, we're in trouble as the return type of `parseMoney` is `Money` and not `String`. So the code won't compile.

To fix this, we will need to add a generic:

```typescript
function safe<T>(action: () => T): T | undefined {
  try {
    return action();
  } catch (_) {}
}
```

Now we can pass any function that takes no arguments and returns some object, and the returned value will be correctly typed as either the type of that object, or `undefined`.

```typescript
// safe<T>() inferred to safe<Date>()
// foo inferred to Date | undefined
const foo = safe(() => new Date('12 Jun').toISOString());

// safe<T>() inferred to safe<Money>()
// bar inferred to Money | undefined
const bar = safe(() => parseMoney('$35'));
```

### Adding a default result

Our `formatCurrency` code is still a little more complicated than we'd like, because we have to test the return value from `safe()` to see if it was OK or not.

To improve this, we can add a new optional parameter to `safe()` which controls the default result in case of error.

It's sometimes nice to design this from the call site, so that you get an idea of exactly what you need before you get too deep into types. This is how we ideally want our `formatCurrency()` method to look:

```typescript
function formatCurrency(rawValue: string): string {
  return safe(
    () => parseMoney(rawValue).toShortString(),
    INVALID_CURRENCY_WARNING,
  );
}
```

How could we type the second argument? Here's a quick fix that makes the compiler happy:

```typescript
function safe<T>(action: () => T, defaultResult: any): T | undefined {
  try {
    return action();
  } catch (_) {
    return defaultResult;
  }
}
```

## Type confusion

This typing gets us into trouble. If you passed a `defaultResult` that wasn't of type `T`, it would compile, but resolve to the wrong types at runtime. For example:

```typescript
const broken = safe(() => 'hello', 10);
// broken is of type "string | undefined"
// but its value is actually 10!
```

What can we do to fix this?

Our function can now take on any of three different type signatures:

1. an `action` which returns one type, or `undefined` on error (e.g. `get(() => JSON.parse(thing))`)
2. an `action` and a `defaultResult` which return the same type (e.g. `formatCurrency` above)
3. an `action` which returns one type, and a `defaultResult` which returns another (e.g. `get(() => 5, null))`)

When trying to solve a problem like this, it's often helpful to create individual signatures that match each of the use cases. Then, rather like test-driving an algorithm, a solution which composes them together often appears almost by itself.

So here goes:

```typescript
// Requirement 1: action returns a type, or `undefined` on error
function safe<T>(action: () => T): T | undefined {
  // etc
}

// Requirement 2: action returns a type, defaultResult is same type
function safe<T>(action: () => T, defaultResult: T): T {
  // etc
}

// Requirement 3: action returns a type, defaultResult is a different type
function safe<T, U>(action: () => T, defaultResult: U): T | U {
  // etc
}
```

Notice that the second signature is actually a special case of the third one, where `T` and `U` are just the same type. So the second and third can be merged.

Then we can compose the two remaining signatures into a single declaration using [function overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads).

```typescript
function safe<T>(action: () => T): T | undefined;
function safe<T, U>(action: () => T, defaultResult: U): T | U;
function safe<T, U>(action: () => T, defaultResult?: U): T | U | undefined {
  try {
    return action();
  } catch (_) {
    return defaultResult;
  }
}
```

### Is this over-complicated?

One of my guiding rules in writing code is not to introduce complexity unless it's absolutely necessary. It's always time well spent looking at a piece of code and asking: is this really as simple as it could be?

In this case, we could make the signature much simpler by making the optional default parameter mandatory. This would also make more explicit some behaviour that is currently a bit difficult to see at first glance: that the function returns `undefined` on error if you don't give it a second parameter.

```typescript
function safe<T, U>(action: () => T, defaultResult: U): T | U {
  try {
    return action();
  } catch (_) {
    return defaultResult;
  }
}

// now all callers must explicitly pass 2nd param
const foo = safe(() => JSON.parse(thing), undefined);
```

If the function is in a single repo, and you have control over all call sites, this would be a small refactor and definitely worth doing. On the other hand, the change does not preserve backward compatibility, so if you don't know where all your callers are, it wouldn't be as easy.

### Conclusion

A function that abstracts the `try`-`catch` pattern is a nice way of introducing some functional concepts into a procedural codebase without a major rewrite.
