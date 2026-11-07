# clustering-in-practice

Builds [`src/pages/talks/clustering-in-practice.html`](../../../src/pages/talks/clustering-in-practice.html),
the reveal.js deck behind [nickwhite.cc/talks/clustering-in-practice](https://nickwhite.cc/talks/clustering-in-practice/).

Most of the deck's diagrams are not drawings. The k-means walkthrough is a real
fit of Lloyd's algorithm, animated pass by pass; the distance meter beside it is
that fit's actual running total; the k-sweep, the noise cloud, and the bootstrap
rounds are all genuinely computed. This builds them, which seemed worth keeping
in the open given it is a coding blog.

## Running it

From this directory, the one that holds the dependency manifest:

```sh
cd scripts/talks/clustering-in-practice && uv run assemble.py
```

Dependencies - `numpy` and `jinja2` - are declared in
[`pyproject.toml`](./pyproject.toml) here, and `uv` fetches them on first run.
`python3 assemble.py` works too if both are already available. The script
writes the page straight to its live location, so the run is the edit - check
the diff and commit the result.

It is deterministic: the seeds are searched, not sampled, so the same page comes
out every time.

This is a content step, not part of `pnpm build`. Astro serves the generated
file verbatim.

## Layout

| file | what it holds |
| --- | --- |
| `assemble.py` | entry point: runs the fits, renders the fragments, fills the template, writes the page |
| `toymath.py` | the clustering itself - Lloyd's algorithm, the k-sweep, the bootstrap |
| `render.py` | turns computed numbers into SVG and HTML fragments |
| `constants.py` | the palette, and the figures the page states outright |
| `template.html` | the slide markup and all the CSS, a Jinja2 template with `{{ ... }}` holes where fragments go |

The deck animates in CSS, not JavaScript. Each generated fragment carries every
state it will ever be in - a dot holds the colour it wears at each pass, a
centroid cross holds each position it moves through - as custom properties, and
`template.html` has sibling-selector rules (`.k3.visible ~ .toysvg .tdot { fill:
var(--c0) }`) that switch between them as each reveal.js fragment becomes
visible. So a new animation step usually means adding a custom property in
`render.py` and a rule in `template.html`, not writing any script.

## Self-contained

Everything the build needs is in this directory. There are no inputs: no data
files, no fetches, no imports from outside. `toymath.py` makes its own points
from a seeded generator, and the handful of figures that are quoted rather than
computed are written out as literals in `constants.py`.

The page itself loads reveal.js 5.1.0 from unpkg and uses the system font stack,
so there is nothing to inline and no assets to ship alongside it.
