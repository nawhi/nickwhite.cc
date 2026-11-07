"""Build the "Clustering in practice" talk page.

Runs every fit the deck shows, renders the results as SVG, drops them into
template.html.j2, and writes the finished page over
src/pages/talks/clustering-in-practice.html. It is a content step, not part of
`pnpm build`: run it when the deck changes and commit the result.

    cd scripts/talks/clustering-in-practice && uv run assemble.py
"""

import pathlib
import re

import jinja2

import constants as K
import render
import toymath

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[2] / "src" / "pages" / "talks" / "clustering-in-practice.html"


def build():
    toy = toymath.compute()
    final, noise = toy["final"], toy["noise"]

    # k = 3..7 on the same three groups, each cluster keeping its colour
    per_point, specs = render.colour_slots(final, toy["ksweep"])
    k_totals = [final["total"]] + [toy["ksweep"][k]["total"] for k in range(4, 8)]
    k7 = toy["ksweep"][7]

    return {
        "field_recap": render.field_recap(),
        "cards": render.persona_cards(),

        "toy_lloyd": render.lloyd_walkthrough(toy["dots"], toy["states"], final),
        "meter_lloyd": render.meter(
            list(zip(["pass 1", "pass 2", "pass 3", "done"],
                     [s["total"] for s in toy["states"]] + [final["total"]]))),

        "primer": render.primer(),
        "drag": render.drag(toy["drag"]),

        "value_strip": render.value_strip(),

        "never": render.never_says_no(toy["dots"], per_point, specs),
        "kchart": render.k_chart(k_totals),

        "curve": render.knee_curve(toy["curve"]),
        "label_k3": f'k = 3 · total {final["total"]:,}',
        "label_k7": f'k = 7 · total {k7["total"]:,}',
        "mini_k3": render.mini_field(
            toy["dots"], final["labels"], final["centres"],
            lambda c: K.CLUSTER[c]),
        "mini_k7": render.mini_field(
            toy["dots"], k7["labels"], k7["centres"],
            lambda c: K.CLUSTER[specs[-1]["slot_of"][c]]),

        "noisefit": render.noise_fit(noise),
        "meter_noise": render.meter([("k = 4", noise["total"])]),

        "shake_toy": render.shake_field(
            toy["dots"], final["labels"], toy["rounds"]),
        "jtab_toy": render.jaccard_table(final["labels"], toy["rounds"]),
        "shake_noise": render.shake_field(
            noise["dots"], noise["labels"], toy["noise_rounds"]),
        "jtab_noise": render.jaccard_table(
            noise["labels"], toy["noise_rounds"]),
    }, toy["seeds"]


def main():
    fragments, seeds = build()
    # autoescape stays off: every value here is pre-rendered HTML/SVG from
    # render.py, never untrusted input, so escaping it would mangle the markup.
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(HERE),
        autoescape=False,
        undefined=jinja2.StrictUndefined,  # a typo'd variable fails the build
        keep_trailing_newline=True,
    )
    html = env.get_template("template.html.j2").render(**fragments)
    stray = re.search(r"{{|}}|{%|%}", html)
    if stray:
        raise SystemExit(f"output still has Jinja syntax at offset {stray.start()}")

    OUT.write_text(html)
    print(f"blobs seed {seeds['data']}, fit seed {seeds['fit']} "
          f"({seeds['passes']} passes); noise seed {seeds['noise']}")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
