---
title: An introduction to bitwise operations
pubDate: 2022-04-14
description: An interactive guide to bit manipulation for the binary novice.
---

<script>
  import BitwiseOperation from '$lib/blog/bitwise-operations-explained/BitwiseOperation.svelte';
  import BinaryToDecimal from '$lib/blog/bitwise-operations-explained/BinaryToDecimal.svelte';
  import DecimalToBinary from '$lib/blog/bitwise-operations-explained/DecimalToBinary.svelte';
</script>

**TLDR?** Skip to the [interactive bit](#interactive-bit).

## Introduction

Generally, if you do all your programming in high-level languages like Python or JavaScript (or even Java), you'll rarely need to go that far into the underlying machinery. The programming language is usually a good enough abstraction.

That said, it is occasionally useful to understand what binary is, and how to use it. For example (in fact the motivation for this post), bitwise arithmetic can reduce this [Allergies kata](https://www.codewars.com/kata/58be35e9e36224a33f000023/python) from a maths-laden mega-algorithm to a couple of lines.

## Binary numbers

Binary is base two. That means instead of counting up to 9 before a new digit is added at the front of the number, in our normal base ten (also called _decimal_), you only count up to 1.

So the first few binary numbers from zero go like this: `0, 1, 10, 11, 100, 101, 110, 111, 1000`.

Notice that each number with a single leading 1 and trailing zeroes represents a higher power of two:

`&nbsp;&nbsp;&nbsp;1000`&nbsp; = 2<sup>3</sup> = 8<br/>
`&nbsp;&nbsp;10000`&nbsp; = 2<sup>4</sup> = 16<br/>
`&nbsp;100000`&nbsp; = 2<sup>5</sup> = 32<br/>
`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`&nbsp; and so on.

_(Edit: there was previously an error in the above, it read `100` = 2<sup>3</sup>. I have since returned to pre-school, and can now count to three correctly.)_

This applies to `1` as well, because as usual in computer science, we start not with one but with zero.

`&nbsp;1` = 2<sup>0</sup> = 1<br/>
`10` = 2<sup>1</sup> = 2

To disambiguate between decimal and binary, you might see the binary number prefixed with a zero and a lower-case `b`. So `0b10110` means 22 in binary, not 10,110 in decimal.

## <a id="interactive-bit" style="text-decoration: none">The Interactive Bit</a>

### Converting decimal to binary

If you have a decimal number, and you want its binary form, you can get it doing the following.

For each integer `i` starting at `0`:

1. divide the decimal number by `2`<sup>`i`</sup>
2. floor the result (round it to the lower of its two nearest integers)
3. take the remainder when dividing by two - this is the integer in the `i`<sup>th</sup> position

If in step 1 you get a number that is less than `1`, stop. Then the binary result will be the bits you already have arranged with the lowest last.

This is much easier to see in practice. (NB: in the demo, `⌊X⌋` means flooring `X`.)

<div class="blog-widget">
  <DecimalToBinary/>
</div>

### Converting binary to decimal

Going the other way is a lot easier: sum up the powers of two that have a `1` there, and ignore the ones that have a `0`. Counting from the right makes it more straightforward, as you can start with the lowest powers of two.

<div class="blog-widget">
  <BinaryToDecimal/>
</div>

### Bitwise operations

All numbers are stored as an array of bits, each taking the value 1 or 0 and representing a digit of the number in binary form.

Since each digit takes only two values, we can use Boolean operators (AND, OR, XOR, etc) on each pair of their digits to create a totally new binary number.

This yields surprising but interesting results. To see it in action for bitwise AND, have a go below.

<div class="blog-widget">
  <BitwiseOperation/>
</div>

All high-level programming languages have bitwise operations, and they are often builtins. In JavaScript, bitwise AND and OR are the similar to boolean AND and OR, and there are also XOR and NOT operators - see [here](https://www.w3schools.com/js/js_bitwise.asp) for a full list.

## Why would you do this?

Unless you work in [cryptography](https://en.wikipedia.org/wiki/XOR_cipher), users of high-level programming languages are unlikely to encounter these on the day-to-day. But they are used under the hood of the interpreted languages and are especially ideal for resource-constrained environments, because they are much cheaper than regular arithmetic.

A classic example of how they are used is for a bag of yes/no options. In JavaScript you might use an object:

```javascript
// we declare a function which takes an options object
function logic(options) {
  if (options.isAdmin) {
    // do something...
  }
  if (options.hasLoggedInBefore) {
    // do something else...
  }
}

// call it like so
logic({
  isAdmin: false,
  hasLoggedInBefore: true,
  eligibleForUpgrade: true
  /* etc... */
});
```

What if you were in such a resource-constrained environment that you couldn't pass an object any more because of the overhead of creating it?

Well, you could just pass each boolean as a separate function argument. But that's a disaster waiting to happen:

```javascript
// 😱 which is which???
logic(false, true, true, false, true, false);
```

With our new binary knowledge, you can achieve all the readability of an object with the storage overhead of just a single bit for each option.

```javascript
const IS_ADMIN = 0b1;
const HAS_LOGGED_IN_BEFORE = 0b10;
const ELIGIBLE_FOR_UPGRADE = 0b100;

function logic(options) {
  if (options & IS_ADMIN) {
    // do something...
  }
  if (options & HAS_LOGGED_IN_BEFORE) {
    // do something else...
  }
}

// call it like so, for these two
// options to be true, and the rest false
logic(IS_ADMIN | ELIGIBLE_FOR_UPGRADE);
```

(Side note: using binary literals has a developer experience problem - if you create a flag by copy-pasting a line, it will overwrite the flag that was already there unless you remember to add another zero. To prevent this proble, flags can instead be declared with a [left-shifted](https://www.ibm.com/docs/en/i/7.1?topic=expressions-bitwise-left-right-shift-operators) incrementing integer.)

```javascript
let i = 0;

const FLAG1 = 1 << i++; // 0b10
const FLAG2 = 1 << i++; // 0b100
const FLAG3 = 1 << i++; // 0b1000
```
