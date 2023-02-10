---
title: A brief introduction to JavaScript build tools
pubDate: 2022-02-28
description: Confused by the world of frontend build tools? You will still be after reading this article.
---

## Introduction

Having started my career in C/C++ and server-side Java, I had a late introduction to the front-end of the web. One of the things that I found hardest to get my head around was what happened when you "ran the build" on a client-side project. Trying to understand the output of this cryptic `npm run build` command felt like learning programming all over again.

Worse was trying to understand the errors that would happen when you hadn't configured your app correctly. Hours and hours of unexpected tokens. And then when you got it to build: `Cannot find module`. Gah.

Years on and I'm starting to get a handle on how it all works, and just as important, why it is the way it is. This article is a short introduction to what I've learned.

## What's a build tool?

For the purposes of this article, a _build tool_ is a piece of software that takes a web application that you've written and organises it into a _bundle_ a way that makes it possible for browsers to understand it. (Other uses, like libraries and server-side code, are out-of-scope here - but the principles are similar.)

This decouples the development environment of the code from the way browsers and the Internet work, so that the developers can write better code, and modularise their code, more easily.

## Definitions

Here are some terms that will be useful in understanding build tools.

- **Build tool**: A piece of software that transforms source code into a bundle.
- **Bundle**: One or many files that represent all the assets needed to run the application, compressed or linked together in a way that the target browsers can execute correctly.
- **Target browsers**: The browsers (or the version of JavaScript that runs on the browsers) that the bundle should run correctly on.
- **Source code**: The code that developers edit that makes up the web application, including static assets. This is normally checked into version control, where the build is normally not.
- **Build**: This is a single run of the build tool to create a bundle. Builds should be deterministic: given the same input, a build tool should always produce the same output.
- **Asset**: One of the files that make up a bundle. Could be HTML, JavaScript, CSS, images, videos, JSON, text, or something else. Also often called a "static asset" where "static" means available on the client (e.g. via a CDN), as opposed to needing a custom application server.

## What does a build tool do?

Most build tools have a handful of different jobs.

1. **Compile**: turn entirely different languages, like TypeScript, ClojureScript or PureScript, into JavaScript

2. **Transpile**: replace language features that aren't available in the target browsers, like JSX or proposal-stage features of JavaScript, with compatible implementations

3. **Transform**: add environment variables that are only known at build time (like the build number), or ones that are kept separately as best practice or to make testing easier

4. **Bundle**: link all the files needed to run the web app together - source code, images, CSS, and third-party libraries - then output them as a single file or several files linked together in a way the target browser will understand

5. **Optimise**: Improve the performance of the bundle, for instance by minifying the code in it

6. **Obfuscate**: Make it harder to reverse-engineer any IP in the bundle

One other thing build tools do is generate **source maps**, which allow you to cross-reference errors thrown in the bundled code with the site of the error in the original source. I don't understand them well enough to write about yet. Maybe there'll be another article on it soon.

## Examples

This separation into steps is a bit academic. Each step is rarely used on its own - nearly every build tool uses a combination.

Besides, the best way to get familiar with this stuff is to explore lots of examples!

So the rest of this article takes the form of a Git repository with a bunch of examples, designed to be vaguely real-world relevant but contrived to make sure they're a bit easier to understand than the average production app.

[Visit the repository now!](https://github.com/nawhi/js-build-examples)
