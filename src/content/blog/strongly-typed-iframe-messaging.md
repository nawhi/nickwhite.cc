---
title: A pattern for strongly-typed IFrame messaging
pubDate: 2021-12-29
description: Using TypeScript to help with code that communicates between IFrames.
---

_If you aren't familiar with IFrames, have a 30-second scan of their [MDN page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) before reading 🤞_

Lately I've been working on a product which displays pop-up messages with dynamic content on hotels' websites. It consists of a script which collects various bits of data from the page to decide what and when to show, then shows messages via IFrames injected into the DOM.

This pattern has a huge performance upside, because no message UI needs to be loaded until the message itself displays. This means the script that decides what messages to load (which runs on load in the parent window) stays tiny and doesn't interfere with the site's performance.

But sending data between an IFrame and the top window is sometimes tricky. IFrames are in a different browsing context from their parent window, so can only communicate with the script on the main website via the `postMessage` and `addEventListener` APIs on their respective `window` objects.

(Also, it's not just Iframes that have this problem. Browser extensions, where code on a tab's webpage and the extension UI communicate, have [very similar APIs](https://developer.chrome.com/docs/extensions/mv3/messaging/).)

This got me thinking about patterns for making my life easier when working extensively with code that posts and listens to messages.

## The problem

Here's an example of the sort of thing that can go wrong. The scenario: you have previously inserted `iframe#widget-12345` into the document, and now you want it to show a personalised message containing a price that you've scraped from the parent page:

```js
// snipped for brevity
const getPriceFromDocument = () => '$50.00';

// script in the top document...
document
  .getElementById('widget-12345')
  .contentWindow.postMessage(
    {
      type: 'widget.data',
      payload: {
        price: getPriceFromDocument()
      }
    },
    '*'
  );

// code in the iframe...
const listener = (msg) => {
  if (msg.data.type === 'widget.data') {
    // again, snipped for brevity
    const div = document.getElementById('price-desc');
    div.innerText = `The best price is: ${msg.data.price}`;
  }
};
window.addEventListener('message', listener);
```

Let's assume the price was the string `$125.00`. What would you get when it renders?

```text
The best price is: undefined
```

Disaster! The reason is that our message parsing code expects the wrong shape. We posted `{ type: "widget.show-data", payload: { price: "$125.00" } }` but tried to look up the price under `msg.data.price` instead of `msg.data.payload.price`.

Fortunately, catching shape-based errors like this is exactly the kind of job at which TypeScript excels. With a moderate amount of extra type boilerplate, we can make our life a lot happier - and we won't even need to write any unit tests.

## Initial code

Let's declare and use an interface which represents the data that we're sending from parent window to the widget iframe:

```ts
interface ParentToIframeMessage {
  type: 'widget.data';
  payload: { price: string };
}

const listener = (
  msg: MessageEvent<ParentToIframeMessage>
) => {
  if (msg.data.type === 'widget.data') {
    // inside this clause, msg.data.payload is correctly
    // typed as {price: string}!
    const div = document.getElementById('price-desc');
    div.innerText = `The best price is: ${msg.data.payload.price}`;
  }
};
```

This immediately catches two classes of error:

1. If you misspell the string literal in the if clause, TypeScript will give you a compilation error.
2. Trying to access `msg.data.price` is now an error - and autocomplete in most IDEs will nudge you to the correct path, `msg.data.payload.price`.

There's still one gotcha. Both windows are public and anyone can send them messages, so you will still need to make sure there's a no-op fall-through when the message type doesn't match. This is probably best checked through a unit test.

## Many messages

This approach scales really nicely if you have lots of messages. Here's a switch statement from a larger handler, where the `event` variable is the `MessageEvent`:

```js
const handleWindowMessage = (event) => {
  const iframe = event.source.frameElement;

  const sendToIframe = (iframe, message) =>
    iframe.contentWindow?.postMessage(message, '*');

  switch (event.data.type) {
    case 'widget.ready':
      sendToIframe(iframe, {
        type: 'widget.data',
        payload: {
          price: getPriceFromPage()
        }
      });
      break;
    case 'widget.dimensions-change':
      const { width, height } = event.data.payload;
      if (width)
        iframe.style.setProperty(
          'width',
          `${width}px`,
          'important'
        );
      if (height)
        iframe.style.setProperty(
          'height',
          `${height}px`,
          'important'
        );
      break;
    case 'widget.close':
      removeWidget(iframe?.id);
      break;
  }
};
```

We would type this one as a union:

```ts
type IframeToParentMessage =
  | { type: 'widget.close' }
  | { type: 'widget.ready' }
  | {
      type: 'widget.dimensions-change';
      payload: {
        width?: number;
        height?: number;
      };
    };
```

Then declare the event to be of type `MessageEvent<IframeToParentMessage>` and TypeScript will make the payload the right shape in each branch of the switch statement.

Even better, if you also own the code that sends and receives messages at the other end, you can create wrapper functions around the `postMessage` calls that makes them the right type too:

```ts
// in the parent (assuming you kept a ref to the iframe)
const sendToIframe = (
  iframe: HTMLIFrameElement,
  message: ParentToIframeMessage
) => iframe.contentWindow?.postMessage(message, '*');

// in the iframe
const sendToParent = (
  message: IframeToParentMessage
) => window.parent.postMessage(message, '*');
```

## Conclusion

Adding TypeScript types and helper functions to enforce stronger typing around calls to the DOM can be a great way to quickly catch a whole class of bugs, like mistakes in data shape between dispatcher and receiver, without even needing to write unit tests.

### Appendix: Full example with TypeScript & React

Note that this is for illustrative purposes only and has not been tested.

**Type definitions** (likely in a shared library):

```ts
type MessageToIframe =
  | { type: 'widget.close' }
  | { type: 'widget.ready' }
  | {
      type: 'widget.dimensions-change';
      payload: {
        width?: number;
        height?: number;
      };
    };

type MessageToParentWindow = {
  type: 'widget.data';
  payload: { price: string };
};
```

**Script that runs in the parent window**:

```ts
const sendToIframe = (
  iframe: HTMLIFrameElement,
  message: MessageToParentWindow
) => iframe.contentWindow?.postMessage(message, '*');

function getPriceFromPage() {
  // your logic here...
  return '$250.00';
}

const insertWidget = (id: string) => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://cdn.mycompany.com/widget.html';
  iframe.id = id;
  document.body.appendChild(iframe);
};

const removeWidget = (id: string) => {
  document.getElementById(id)?.remove();
};

const getMessageSender = (
  e: MessageEvent<unknown>
): HTMLIFrameElement | null => {
  return e.source &&
    'frameElement' in e.source &&
    e.source?.frameElement?.nodeName === 'IFRAME'
    ? (e.source.frameElement as HTMLIFrameElement)
    : null;
};

const windowMessageHandler = (
  event: MessageEvent<MessageToIframe>
) => {
  const iframe = getMessageSender(event);
  if (iframe == null) return;

  switch (event.data.type) {
    case 'widget.ready':
      sendToIframe(iframe, {
        type: 'widget.data',
        payload: {
          price: getPriceFromPage()
        }
      });
      break;
    case 'widget.dimensions-change':
      const { width, height } = event.data.payload;
      if (width)
        iframe?.style?.setProperty(
          'width',
          `${width}px`,
          'important'
        );
      if (height)
        iframe?.style?.setProperty(
          'height',
          `${height}px`,
          'important'
        );
      break;
    case 'widget.close':
      removeWidget(iframe?.id);
      break;
  }
};

const sleep = (n: number) =>
  new Promise((resolve) => setTimeout(resolve, n));

(async () => {
  const widgetId = 'widget1';

  window.addEventListener(
    'message',
    windowMessageHandler
  );

  // Display widget after 1 second
  await sleep(1000);
  insertWidget(widgetId);

  // Remove widget after 10 seconds (unless already removed)
  await sleep(10000);
  removeWidget(widgetId);
})();
```

**Code that runs in the IFrame** (this uses React, so you'd also need the standard React HTML boilerplate file):

```tsx
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';

const sendToParentWindow = (
  message: MessageToIframe
) => window.parent.postMessage(message, '*');

const App = () => {
  const [price, setPrice] = useState<string>();
  const container = useRef<HTMLDivElement>();

  useEffect(() => {
    sendToParentWindow({
      type: 'widget.ready'
    });

    const listener = (
      e: MessageEvent<MessageToParentWindow>
    ) =>
      e.data.type === 'widget.data' &&
      setPrice(e.data.payload.price);

    window.addEventListener('message', listener);
    return () =>
      window.removeEventListener('message', listener);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { height, width } =
        entry?.contentRect || {};
      sendToParentWindow({
        type: 'widget.dimensions-change',
        payload: { width, height }
      });
    });
    container.current &&
      observer.observe(container.current);

    return () =>
      container.current &&
      observer.unobserve(container.current);
  }, []);

  if (!price)
    return <div>Loading the best price...</div>;

  return (
    <div ref={container}>
      <button
        onClick={() =>
          sendToParentWindow({
            type: 'widget.close'
          })
        }
      >
        Close
      </button>
      <h1>You found a best price of {price}!</h1>
    </div>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
