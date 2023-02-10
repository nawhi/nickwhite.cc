---
title: Supporting Dark Mode using Tailwind CSS
description: With the right CSS abstractions, creating a dark theme is easy.
pubDate: 2022-05-28
---

As someone who spends pretty much their entire working life staring at a computer screen, I try hard to make sure that my virtual environment is set up in a way that mirrors my office - professional-looking, aesthetically pleasing, just generally a nice and productive place to be.

For me, as for many other developers, this has meant embracing dark mode in a lot of apps that I use.

The jury is still out on whether light-on-dark or dark-on-light is actually better for one's eyes, but from I've found that on all but the sunniest days I prefer the darker tones of a colour scheme like [Dracula](https://www.draculatheme.com) to anything in "light mode". 


Given this, it was only natural that I should look to add a dark mode to my website.

### How Tailwind works

My site is built with Tailwind CSS. Tailwind is a framework which uses small utility classes to style your HTML. 

Tailwind's most talked-about advantage is that your styles are in the actual HTML, so you don't have to tab back and forth between a separate CSS file (or a `styled.div` declared 50 lines above) to see the style of an element.

But the bigger (and often overlooked) benefit is that the utility classes it provides are a slightly higher level of abstraction than actual CSS. This frees you from a lot of the drudgery generally associated with writing raw CSS, and allows you to do cool things with less work.

A great example is its [colour palette](https://tailwindcss.com/docs/customizing-colors), and that's what I had been using for my site. A typical bit of code might look something like this.

```html
<body class="bg-white">
  <h1 class="text-gray-900">Welcome to the blog</h1>
  <p class="text-gray-600">
    Hello and welcome to Nick's website. Lorem ipsum.
    Etc.
  </p>
</body>
```

For reference, here is what the classes I've used in the above ends up looking like in the browser.

```css
.bg-white {
  background-color: #ffffff;
}

.text-gray-900 {
  color: #1a202c;
}

.text-gray-600 {
  color: #718096;
}
```

### The `dark:` modifier

Once I had decided what colours I wanted in my new dark mode, an initial googling session led me to discover Tailwind's dark-scheme modifier. If you add `dark:` to the front of a Tailwind class, it'll apply those classes only when the browser's own operating system (or internal UI) is in dark mode.

So I copied all my colour classes, changed them to the dark scheme colours, and added the `dark:` modifier. (While I was there, I changed the light scheme colours from `gray` to the slightly sexier `zinc`.) Then this is what I had:

```html
<body class="bg-white dark:bg-slate-900">
  <h1 class="text-zinc-800 dark:text-slate-300">
    Welcome to the blog
  </h1>
  <p class="text-zinc-600 dark:text-slate-400">
    Hello and welcome to Nick's website. Lorem ipsum.
    Etc.
  </p>
</body>
```

Now the CSS looks like this:

```css
.bg-white {
  background-color: #ffffff;
}

.text-zinc-800 {
  color: #27272a;
}

.text-zinc-600 {
  color: #52525b;
}

@media (prefers-color-scheme: dark) {
  dark\\:.bg-slate-900 {
    background-color: #111827;
  }

  dark\\:.text-slate-300 {
    color: #cbd5e1;
  }

  dark\\:.text-slate-400 {
    color: #94a3b8;
  }
}
```

### More colours, more problems

You probably spotted the issues with this format before I did. Firstly, it's a huge amount of duplication. More importantly, though, if anywhere you forget to add both style rules, you'll end up with text in the colour from the wrong scheme, which is <span style="color: var(--th-wrong-media)">almost impossible to read.</span> So the use of `dark:` had to go.

I realised that I would need to declare upfront which colours I wanted to use in a mode-agnostic way. I decided to follow an approach I'd seen at work, where we had a theme with "primary" and "secondary" colours. I also added a "background" colour, as obviously my background could not remain white in the dark colour scheme.


### Creating a colour palette 
My code could now look like this:

```html
<body class="bg-background">
  <h1 class="text-primary">Welcome to the blog</h1>
  <p class="text-secondary">
    Hello and welcome to Nick's website. Lorem ipsum.
    Etc.
  </p>
</body>
```

How could I get Tailwind to understand that these took different values in dark and light?

The solution involves combining pure CSS functionality with Tailwind config. Firstly, CSS allows you to overwrite variables you have already declared - so in my root stylesheet, I created some theme variables that conditionally took on a different colours in dark vs light colour schemes.

```css
:root {
  --background: #fafafa;
  --primary: #27272a;
  --secondary: #52525b;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #111827;
    --primary: #cbd5e1;
    --secondary: #94a3b8;
  }
}
```

Secondly. Tailwind allows you to declare custom utility classes using the value of these CSS variables. The declaration for this is in the `tailwind.config.js` file:

```js
module.exports = {
  // ...other config here...
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)'
      }
    }
  }
};
```

Once this was done, I could use `primary` and `secondary` as colours in my app with no problem at all - and they would auto-switch between colour schemes. I only had to design the colours once and then I could use it forever more. What a dream.

## What about code blocks?

There was one remaining issue. Code blocks on my blog posts don't use Tailwind - they are rendered using PrismJS, and their colours handled with custom stylesheets which use old-school CSS selectors.

How on earth was I going to get a different stylesheet to load depending on whether I was in dark mode or light mode?

This time, CSS itself stepped in with some pure magic of its own. I discovered that you can _conditionally load_ different stylesheets based on a media query. How cool is that?!

The syntax looks like this:

```css
@import './prism-theme.light.css'
  (prefers-color-scheme: light);
@import './prism-theme.dark.css'
  (prefers-color-scheme: dark);
```

This code loads the light file if the user has light mode enabled (or ["has not expressed an active preference"](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)). If the user has dark mode enabled, it loads the dark file.

It was that easy!

## Conclusion

Tailwind CSS is awesome. Go check it out.

But even if you're only using plain CSS, it has some pretty neat features too - and very good dark mode support.
