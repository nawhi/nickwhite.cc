# clustering-in-practice

Scripts that build [`src/pages/talks/clustering-in-practice.html`](../../../src/pages/talks/clustering-in-practice.html),
the reveal.js deck behind [nickwhite.cc/talks/clustering-in-practice](https://nickwhite.cc/talks/clustering-in-practice/).

This is a content step, not part of `pnpm build`. Astro serves the generated
file verbatim.

Note that these scripts are entirely AI-written, with no review of the code (instead reviewing the HTML output). AI is very very good at this stuff - it's generic ML/maths, so well-represented in its training data, and the result is very rapidly reviewable by a human (and indeed by the agent itself, via Playwright).

## Running it

From this directory, the one that holds the dependency manifest:

```sh
cd scripts/talks/clustering-in-practice && uv run assemble.py
```
