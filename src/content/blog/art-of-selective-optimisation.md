---
title: The art of selective optimisation
description: More speed doesn't always make you faster.
pubDate: 2022-09-10
---

For a while, I had a mild obsession with speeding up frontend builds. Whenever I saw a build tool in a repo I was responsible for, I'd take an afternoon or two (or ten) to figure out if it could go faster. After all, fast feedback is good for developer experience and productivity, right?

Generally the pattern would be as follows. Initially, some quick wins gave me a good speedup for relatively little pain. Then, as I kept working on it, the changes would become more intrusive, and the gains more marginal. After a while, I stopped doing it on work time and started doing it in my learning time. It became an academic exercise: _surely_ this thing should be faster than this!

I learned about concurrency in Jest, JavaScript and TypeScript ASTs, and transpilation efficiency. But the best thing I learned was that _speeding up your workflow is not all about the computer._

If you're in a similar situation, step out onto the balcony for a moment and ask yourself the following questions.

## Is this slow thing actually the bottleneck?
Imagine you're styling a dialog that is buried inside three sub-menus in your app. You start the app, wait 10 seconds for it to compile, then it shows the index page. You navigate to the dialog to see whether your CSS changes have worked.

In this case, the biggest bottleneck is not the ten-second build. It is the 20 seconds you spent _clicking to get to the dialog_.

If your app is static, hot-reloading might take care of this, but that doesn't do much if your dialog is reliant on some application state that you can only get to by interacting with the app. If edge cases take more time to reproduce, they will naturally get less developer attention and you'll end up with a buggier app.

You can solve this by moving to building your UIs in a visual testing tool like [Storybook](https://storybook.js.org/). As well as providing instant feedback as you build out a component, and making it easy to simulate any component state without clicking, it comes with the bonus discipline of helping you think through the code organisation into logical components. The resulting test files can also be published as living visual documentation, and automated into CSS regression tests.

In sum - speeding up your workflow does not have to be purely technical. It may involve the things _you_ do, as well as the things your computer does.

## Is your system doing unnecessary work?
Say you have a large React app thoroughly unit-tested throughout. Perhaps it also has end-to-end tests that render entire pages. It probably uses React Testing Library, which is a fantastic way to test React code, but is slower than a herd of turtles. Test runs of five, ten or twenty minutes are not uncommon in this scenario. 

If you are someone who likes to work incrementally and run the tests after every change, you will be on your knees - but do you really need to run _all_ the tests after every change?

Jest has a marvellous CLI option, <span style="word-break: keep-all">[`&#8209;&#8209;onlyChanged`](https://jestjs.io/docs/cli#--onlychanged)</span> , that helps out here. With this switch on, Jest will look at Git and run only tests related to files that have changed since the last commit. When working at the leaves of a large dependency tree, this will normally take the test run down to almost instantaneous. 
    
In the case that you're working on high-level components that are used everywhere, you'll find that the majority of test files will run even with `&#8209;&#8209;onlyChanged`. Again, though, do you really need to run everything here? You should be able to run only the file that you've been working on and have confidence that nothing else is broken. If you can't do that, then your code violates the dependency inversion principle and your best optimisation is to improve the separation of concerns in the test suite.

## Are you blocked by slowness, or just impatient?
Do any of your colleagues express strong opinions about the slowness? Or is it just that you are at the impatient end of the spectrum?

This is a subtle one and it's difficult to get right. Sometimes I have pushed on with an optimisation even when it seemed totally pointless to my colleagues, but after it was finished, it was worth it for everyone. Other times it was only my individual productivity that benefited. Other times still, I've cut my losses after far too much yak-shaving and nobody missed the prize that I was after.

It's well known that incremental development is far superior to large batched code changes - bugs hide in their droves in the latter - so we often talk about wanting to shorten feedback loops. This applies especially if you're someone with a naturally higher error rate (ahem), for whom the cumulative time cost of inattentive slips becomes a big efficiency dent if the feedback loop is slow.

On the other hand, there's also often a sweet spot where the cost of inappropriate error is material enough to focus the mind. For me, a small amount of delay is actually a good thing - especially when it comes to production. When deployments are sub-two-minutes, it's more tempting to end up programming by coincidence (push a hack, see if it works), and harder to be disciplined about separating Git commits into coherent, reversible chunks.

Understanding the difference between simple impatience, and a necessary adjustment to your environment for personal success, is very hard.

## What might you lose by making this faster?
In web development, build tools tend to be fast or flexible, not both. This means that the faster you want to be, the more you'll be forced into a small set of features. For instance, at the time of writing, [`esbuild`](https://esbuild.github.io/) is the fastest JavaScript bundler by a country mile, but it doesn't support dynamic imports, which are very common in larger apps.

You might be tempted to drop some features to shoehorn your app into a faster build tool. But what might you lose by doing that? If it makes the app harder to work with and debug, then the build speed bump might not be worth it.

I came across an example of this with a CSS-in-JS library called [Styled Components](https://styled-components.com/). It comes with a [Babel plugin](https://styled-components.com/docs/tooling#babel-plugin) to improve the developer experience when working locally. When I migrated the code base away from Babel, I halved the build time - but suddenly, without the dev tool plugin, finding our way around was painfully slow. The verdict from my colleagues was unanimous - good dev tooling and a slow build is better than bad dev tooling and a fast build.

## Conclusion
If a part of your workflow feels slow, it is a great time for a "balcony break", whether it's an actual balcony, or a colleague, or a rubber duck. Consider the workflow in its entirety and try to get the lowest-hanging fruit first. The biggest culprit in an inefficient workflow is often not the most obvious.
