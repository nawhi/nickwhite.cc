---
title: 'Retyping the Google Maps SDK'
pubDate: 2021-02-20
description: A neat way to improve developer experience with the power of TypeScript.
---

## Introduction

In tech, user experience is king. Apps need to work, sure, but to be really valuable, they must also be easy and pleasant to use.

Something people often forget is that the first, the last, and the most frequent users of software systems are the engineers that built it.

Can we borrow from the principles of customer-facing user interface design to make working with our Developer Interface - that is, the codebase - a more efficient and fulfilling experience?

## Errors in JavaScript and TypeScript

One of the [principles of user interface design](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-831-user-interface-design-and-implementation-spring-2011/index.htm) is reducing the likelihood of error.

As an engineer, little errors, even relatively inconsequential ones, can pile up and start to be a huge drain to our productivity, sense of efficacy, and even job satisfaction.

Here's a simple example:

```javascript
const user = { firstname: 'Nick', lastname: 'White' };

console.log(user.firstName);
```

If I run this in JavaScript, my typo (`firstName` instead of `firstname`) will be accepted without error by the language. When I run it, the result of the console.log is `undefined`.

With TypeScript, though, the mistake is surfaced at compile time:

```text
test.ts:3:18 - error TS2551: Property 'firstName' does not exist on
                             type '{ firstname: string; lastName: string; }'.
                             Did you mean 'firstname'?

3 console.log(user.firstName);
                   ~~~~~~~~~

  test.ts:1:16
    1 const user = { firstname: "Nick", lastName: "White" };
                     ~~~~~~~~~~~~~~~~~
    'firstname' is declared here.
```

If you are using an integrated development environment (IDE), it'll probably get surfaced even sooner - almost as soon as you've typed it - with a red squiggly line underneath the offending typo.

![IDE highlighting of a TypeScript compilation error](/img/highlighted-compilation-error.png)

So TypeScript can statically catch a whole class of errors, where in JavaScript you'd have had to run the code to find them.

Already, that's a big bump in developer experience - but it's hugely more powerful than that, as the following more complex example shows.

## The Google Maps Place Details API

Google Maps have a handy API which allows you to programmatically fetch all sorts of data for a particular place pin on Google Maps.

Let's use [Google's Node.js SDK](https://github.com/googlemaps/google-maps-services-js), wrapped in a helper class for clarity, to get the address from the place ID for Buckingham Palace, which is a large house in London where the Queen lives.

```typescript
import {
  Client,
  Place
} from '@googlemaps/google-maps-services-js';

class GoogleMapsClient {
  private client: Client = new Client();

  constructor(private apiKey: string) {}

  public async getPlaceDetails(
    placeId: string,
    fields: string[]
  ): Promise<Place> {
    const details = await this.client.placeDetails({
      params: {
        key: this.apiKey,
        place_id: placeId,
        fields
      }
    });
    return details.data.result;
  }
}
```

This API has one quirk. It is billed per field, per entry, and its default behaviour is to return _everything_ that Google knows about a place. Unless you have recently closed a Series A, you'll probably want to tell it upfront which fields you need.

For instance, this is how we'd use our client to get the address:

```typescript
const buckinghamPalace = 'ChIJtV5bzSAFdkgRpwLZFPWrJgo';
const client = new GoogleMapsClient(
  process.env.MAPS_API_KEY!
);

client
  .getPlaceDetails(buckinghamPalace, [
    'formatted_address'
  ])
  .then((details) => console.log({ details }));
```

Running this with a registered API key gives you this output:

```json
{
  "details": {
    "formatted_address": "Westminster, London SW1A 1AA, UK"
  }
}
```

## The Problem

However, this method of specifying the field comes with drawbacks. To illustrate, let's see if we can get its phone number too:

```typescript
client
  .getPlaceDetails(buckinghamPalace, ['phone_number'])
  .then((details) => console.log({ details }))
  .catch(console.error);
```

This time, disaster:

```text
Error: Request failed with status code 400
    at createError (/Users/nick/ts-article-2/node_modules/axios/lib/core/createError.js:16:15)
    at settle (/Users/nick/ts-article-2/node_modules/axios/lib/core/settle.js:17:12)
    at /Users/nick/ts-article-2/node_modules/@googlemaps/google-maps-services-js/src/adapter.ts:63:9
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
```

Here's the actual response from the Maps API that caused this error:

```json
{
  "error_message": "Error while parsing 'fields' parameter: Unsupported field name 'phone_number'. ",
  "html_attributions": [],
  "status": "INVALID_REQUEST"
}
```

There's no field called `phone_number`. D'oh.

## Error forecast: mostly cloudy

From a developer perspective, the API response was pretty clear, so we could find our error quite easily. And most IDEs will show you what fields are available with an intention action on the result:

![IDE showing autocomplete with possible fields matching 'phone'](/img/phone-number-intention.png)

But unless you're exceptionally careful, you'll probably still get tripped up by this now and then.

Besides, there's a second problem which is much harder to catch. For example, what happens with the following code?

```typescript
client
  .getPlaceDetails(buckinghamPalace, [
    'formatted_address'
  ])
  .then((details) =>
    console.log(details.formatted_phone_number)
  );
```

It compiles, runs and succeeds, but prints out:

```text
undefined
```

We tried to key the result by `formatted_phone_number` - but we had only asked for `formatted_address` in the initial request, so the phone number wasn't there.

This one might get all the way to an integration test or even production before being spotted.

## Possible improvements

In sum, there are two big things we'd like to improve on our wrapper class.

1. You can misspell an entry in the `fields` parameter and only find out at runtime.
2. You can ask the result for a field that you didn't request, and only find out that it's not there at runtime.

Let's see a potential solution.

```typescript
class GoogleMapsClient {
  private client: Client = new Client();

  constructor(private apiKey: string) {}

  public async getPlaceDetails<K extends keyof Place>(
    placeId: string,
    fields: K[]
  ): Promise<Pick<Place, K>> {
    // etc
  }
}
```

In plain English, here's what we're telling the compiler:

- The argument `fields` will be an array of strings containing a subset of the keys of the `Place` type.
- The return type will be a `Pick` of just those keys, and their associated values, from `Place`.

This will work nicely - not only will you get compile-time errors if you misspell a field, but many IDEs will now also give you autocomplete in the `fields` array!

![IDE screenshot with autocomplete dropdown in the fields parameter](/img/fields-parameter-autocomplete.png)

## Supporting the all-fields case

It's worth noting one potential drawback of this code. If you give an empty array as the `fields` parameter, TypeScript will infer (admittedly in a slightly cryptic way) that the resulting details object has no accessible fields:

![Compilation error and odd type deduction on passing an empty fields array](/img/place-details-with-empty-fields-array-error.png)

Empty arrays are of type `never[]`, and `Partial<PlaceData>` is the SDK's internal alias for `Place`, so this is equivalent to picking nothing out of `Place` - i.e. an empty object (`{}`).

In actual fact, though, the Places API call will have returned every field.

We could implement this with function overloads or conditional types. But given the cost implications of accidentally asking the API for every field, I actively want to close down that possibility. So I'm happy to leave it as-is.

In theory, I could go one step further and require `fields` to be an array of at least length 1, by changing its type to a variadic tuple:

```typescript
class GoogleMapsClient {
  public async getPlaceDetails<K extends keyof Place>(
    placeId: string,
    fields: [K, ...K[]]
  ): Promise<Pick<Place, K>> {
    // etc
  }
}
```

But this causes more problems than it solves. TypeScript now complains if you give it a variable rather than an array literal, and with a pretty cryptic error to boot.

![Compilation error trying to pass an extracted variable as the fields parameter](/img/fields-as-variadic-tuple-error.png)

So let's back that out and leave it how it was!

## Conclusion

The experience of developers matters too when building a software system.

It's well worth the time to consider ways of designing your components so that anyone consuming the component - whether it's your colleagues now, you in the future, or someone else entirely - can have a better and more efficient experience.
