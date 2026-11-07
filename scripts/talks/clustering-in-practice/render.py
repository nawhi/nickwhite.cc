"""Turns computed numbers into the SVG and HTML fragments the slides contain.

Nothing here decides anything. Every function takes values that are already
settled - from toymath.compute() or from constants.py - and writes them out as
markup. The animation itself is CSS: these fragments carry the before and after
positions as custom properties (--x0/--x1, --c0/--c1/--c2/--cf, --b1/--b2/--b3)
and template.html.j2 has the rules that switch between them as each fragment
becomes visible.
"""

import constants as K

# --------------------------------------------------------------------- pieces


def xmark(colour, path_scale=1.0, cls=None, variables=None, translate=None):
    """A centroid cross: a thick page-coloured stroke under a coloured one.

    The halo underneath is what keeps the cross readable when it sits on top of
    a dense patch of dots.
    """
    s = 14 * path_scale
    d = f"M{-s:.0f},{-s:.0f} L{s:.0f},{s:.0f} M{-s:.0f},{s:.0f} L{s:.0f},{-s:.0f}"
    attrs = ""
    if cls is not None:
        attrs += f' class="{cls}"'
    if variables:
        attrs += ' style="' + "".join(f"{k}:{v};" for k, v in variables.items()) + '"'
    if translate is not None:
        attrs += f' transform="translate({translate[0]:.0f} {translate[1]:.0f})"'
    return (f"<g{attrs}>"
            f'<path d="{d}" stroke="{K.HALO}" stroke-width="{13 * path_scale:.0f}" '
            f'stroke-linecap="round" fill="none"/>'
            f'<path d="{d}" stroke="{colour}" stroke-width="{7 * path_scale:.0f}" '
            f'stroke-linecap="round" fill="none"/></g>')


def meter(pairs):
    """The running total-distance table. Rows reveal one per click."""
    return "".join(
        f'<div class="mrow mr{i + 1}"><span class="mk">{label}</span>'
        f'<span class="mvv">{value:,}</span></div>'
        for i, (label, value) in enumerate(pairs)
    )


def axis(x0, x1, y, ticks, label_of, font_size, text_dy=36):
    """A horizontal axis with labelled ticks, as a list of fragments."""
    parts = [f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" '
             f'stroke="{K.AXIS}" stroke-width="3"/>']
    for x, value in ticks:
        parts.append(
            f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y + 10}" '
            f'stroke="{K.AXIS}" stroke-width="3"/>'
            f'<text x="{x}" y="{y + text_dy}" font-size="{font_size}" '
            f'fill="{K.INK_SOFT}" text-anchor="middle">{label_of(value)}</text>'
        )
    return parts


# ------------------------------------------------------- slide 2: the personas


def field_recap():
    """The dot field: one positioned div per journey, coloured by persona."""
    return "\n".join(
        f'<div class="{" ".join(c for c in ["gdot", shape] if c)}" '
        f'style="left:{left}px;top:{top}px;--k4:{K.PERSONAS[persona]["colour"]};"></div>'
        for left, top, shape, persona in K.FIELD_DOTS
    )


def persona_cards():
    """One card per persona, with a bar scaled against the best booking rate."""
    best = max(p["booked_pct"] for p in K.PERSONAS)
    cards = []
    for p in K.PERSONAS:
        variables = f'--pc:{p["colour"]};'
        if p["text"]:
            variables += f'--pc-text:{p["text"]};'
        variables += f'--bw:{K.PERSONA_BAR_MAX * p["booked_pct"] / best:.0f}px'
        cards.append(
            f'<div class="pcard" style="{variables}">\n'
            f'  <div class="pname">{p["name"]}</div>\n'
            f'  <div class="ptraits">{p["traits"]}</div>\n'
            f'  <div class="pbar"></div>'
            f'<div class="prate">{p["booked_pct"]}% booked</div>\n'
            f"</div>"
        )
    return "\n".join(cards)


# ------------------------------------------------- slide 3: the Lloyd walkthrough


def lloyd_walkthrough(dots, states, final):
    """The whole walkthrough in one SVG.

    Document order matters: the measurement lines go down first so the dots and
    the crosses paint over them. Every pass is present in the markup at once -
    each dot carries the colour it wears at each pass, each cross the position
    it occupies - and the CSS picks which one is live.
    """
    xy = [(d["x"], d["y"]) for d in dots]
    parts = []

    for si, st in enumerate(states):
        lines = "".join(
            f'<line x1="{x:.0f}" y1="{y:.0f}" '
            f'x2="{st["centres"][st["labels"][i]][0]:.0f}" '
            f'y2="{st["centres"][st["labels"][i]][1]:.0f}" '
            f'stroke="{K.MEASURE_LINE}" stroke-width="1.6"/>'
            for i, (x, y) in enumerate(xy)
        )
        parts.append(f'<g class="lset ls{si}">{lines}</g>')

    for i, (x, y) in enumerate(xy):
        variables = "".join(f"--c{si}:{K.CLUSTER[st['labels'][i]]};"
                            for si, st in enumerate(states))
        variables += f"--cf:{K.CLUSTER[final['labels'][i]]}"
        parts.append(f'<circle class="tdot" cx="{x}" cy="{y}" r="8" style="{variables}"/>')

    parts.append(candidate_lines(xy, states[0]))

    for c in range(3):
        variables = {}
        for si, st in enumerate(states):
            variables[f"--x{si}"] = f"{st['centres'][c][0]:.0f}px"
            variables[f"--y{si}"] = f"{st['centres'][c][1]:.0f}px"
        variables["--xf"] = f"{final['centres'][c][0]:.0f}px"
        variables["--yf"] = f"{final['centres'][c][1]:.0f}px"
        parts.append(xmark(K.CLUSTER[c], cls="tmark", variables=variables))

    return "\n".join(parts)


def candidate_lines(xy, state):
    """One genuinely torn dot, measuring to all three centroids at once.

    Picked, not placed: of the dots far enough from everything to draw cleanly,
    take the one whose nearest two centroids are closest to a tie. That is the
    dot where "keep the nearest" is a real decision rather than a formality.
    """
    centres = state["centres"]
    chosen, best_ratio = None, float("inf")
    for i, (x, y) in enumerate(xy):
        ds = sorted(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 for cx, cy in centres)
        if ds[0] > 140 and ds[1] / ds[0] < best_ratio:
            chosen, best_ratio = i, ds[1] / ds[0]
    dx, dy = xy[chosen]
    winner = state["labels"][chosen]

    parts = []
    for c, (cx, cy) in enumerate(centres):
        if c == winner:
            parts.append(f'<line x1="{dx}" y1="{dy}" x2="{cx:.0f}" y2="{cy:.0f}" '
                         f'stroke="{K.CLUSTER[winner]}" stroke-width="4"/>')
        else:
            parts.append(f'<line x1="{dx}" y1="{dy}" x2="{cx:.0f}" y2="{cy:.0f}" '
                         f'stroke="{K.MEASURE_LINE}" stroke-width="2" '
                         f'stroke-dasharray="8 8"/>')
    parts.append(f'<circle cx="{dx}" cy="{dy}" r="15" fill="none" '
                 f'stroke="{K.INK}" stroke-width="3"/>')
    return f'<g class="candg">{"".join(parts)}</g>'


# -------------------------------------------- slide 4: mean against medoid


PRIMER_X0, PRIMER_X1, PRIMER_Y, PRIMER_MAX = 60.0, 1420.0, 150.0, 700.0


def _primer_x(day):
    return PRIMER_X0 + day * (PRIMER_X1 - PRIMER_X0) / PRIMER_MAX


def medoid_1d(values):
    """The member minimising total distance to the rest.

    In one dimension that is the middle value when ordered, taking the lower of
    the two middles for an even count. Not np.median, which can average two
    neighbours into a value nobody in the data actually has.
    """
    return sorted(values)[(len(values) - 1) // 2]


def primer():
    """The lead-time strip, with the mean and the medoid marked.

    The two tail values are drawn as fragments; as they arrive the mean slides
    right and the medoid does not move at all. Each marker carries all three of
    its positions as custom properties and the CSS steps through them.
    """
    parts = axis(PRIMER_X0, PRIMER_X1, PRIMER_Y,
                 [(_primer_x(t), t) for t in range(0, 701, 100)],
                 str, font_size=22)

    # stack coincident values into short columns so the pile-up stays readable
    placed = []

    def place(x):
        stack = sum(1 for qx, _ in placed if abs(qx - x) < 17)
        y = PRIMER_Y - 12 - stack * 18
        placed.append((x, y))
        return y

    for day in K.PRIMER_CLUMP:
        x = _primer_x(day)
        parts.append(f'<circle cx="{x:.0f}" cy="{place(x):.0f}" r="8" '
                     f'fill="{K.STRIP_DOT}"/>')
    for i, day in enumerate(K.PRIMER_TAIL, start=1):
        x = _primer_x(day)
        parts.append(f'<circle class="tdotp td{i}" cx="{x:.0f}" cy="{place(x):.0f}" '
                     f'r="8" fill="{K.STRIP_DOT}" stroke="{K.ALERT}" stroke-width="3"/>')

    # the running mean and medoid: before, after one tail value, after both
    seq = list(K.PRIMER_CLUMP)
    means, medoids = [sum(seq) / len(seq)], [medoid_1d(seq)]
    for day in K.PRIMER_TAIL:
        seq.append(day)
        means.append(sum(seq) / len(seq))
        medoids.append(medoid_1d(seq))

    mean_vars = "".join(f"--px{i}:{_primer_x(m):.0f}px;" for i, m in enumerate(means))
    med_vars = "".join(f"--qx{i}:{_primer_x(m):.0f}px;" for i, m in enumerate(medoids))
    mean_texts = "".join(
        f'<text class="mval v{i}" x="0" y="62" font-size="25" font-weight="700" '
        f'fill="{K.MEAN_MARK}" text-anchor="middle">mean {round(m, 1):g}</text>'
        for i, m in enumerate(means)
    )
    med_texts = "".join(
        f'<text class="mval v{i}" x="0" y="128" font-size="25" font-weight="700" '
        f'fill="{K.ACCENT}" text-anchor="middle">medoid {m:g}</text>'
        for i, m in enumerate(medoids)
    )
    parts.append(
        f'<g transform="translate(0 {PRIMER_Y})">'
        f'<g class="mmark mmean" style="{mean_vars}">'
        f'<polygon points="0,4 -13,30 13,30" fill="{K.MEAN_MARK}"/>{mean_texts}</g></g>'
    )
    parts.append(
        f'<g transform="translate(0 {PRIMER_Y})">'
        f'<g class="mmark mmed" style="{med_vars}">'
        f'<line x1="0" y1="4" x2="0" y2="86" stroke="{K.ACCENT}" stroke-width="2.5" '
        f'stroke-dasharray="4 5"/>'
        f'<circle cx="0" cy="96" r="10" fill="{K.ACCENT}"/>{med_texts}</g></g>'
    )
    return "\n".join(parts)


def drag(d):
    """The same point about extreme values, in two dimensions.

    Rings before crosses, because SVG paints in document order and where the
    two overlap the mean's X should sit on top of the medoid's O.
    """
    parts = [
        f'<circle class="tdot" cx="{dot["x"]}" cy="{dot["y"]}" r="8" '
        f'style="fill:{K.CLUSTER[d["labels"][i]]}"/>'
        for i, dot in enumerate(d["dots"])
    ]
    for c in range(3):
        parts.append(
            f'<g class="mring" style="--x0:{d["medoids0"][c][0]:.0f}px;'
            f'--y0:{d["medoids0"][c][1]:.0f}px;--x1:{d["medoids1"][c][0]:.0f}px;'
            f'--y1:{d["medoids1"][c][1]:.0f}px">'
            f'<circle r="17" fill="none" stroke="{K.HALO}" stroke-width="10"/>'
            f'<circle r="17" fill="none" stroke="{K.CLUSTER[c]}" stroke-width="5.5"/></g>'
        )
    for c in range(3):
        parts.append(xmark(K.CLUSTER[c], cls="dmark", variables={
            "--x0": f'{d["centres0"][c][0]:.0f}px', "--y0": f'{d["centres0"][c][1]:.0f}px',
            "--x1": f'{d["centres1"][c][0]:.0f}px', "--y1": f'{d["centres1"][c][1]:.0f}px',
        }))
    for o in d["outliers"]:
        parts.append(
            f'<circle class="odot" cx="{o["x"]}" cy="{o["y"]}" r="11" '
            f'fill="{K.GREY_DOT}" stroke="{K.ALERT}" stroke-width="3.5" '
            f'stroke-dasharray="5 5"/>'
        )
    return "\n".join(parts)


# ------------------------------------------- slide 5: what a summary hides


VALUE_X0, VALUE_X1, VALUE_Y, VALUE_MAX = 80.0, 1420.0, 250.0, 2000.0


def _value_x(v):
    return VALUE_X0 + min(v, VALUE_MAX) / VALUE_MAX * (VALUE_X1 - VALUE_X0)


def value_strip():
    """Fifty booking values on one axis, with the mean and median marked."""
    parts = axis(VALUE_X0, VALUE_X1, VALUE_Y,
                 [(_value_x(t), t) for t in range(0, 2001, 250)],
                 lambda t: f"${t:,}", font_size=23, text_dy=38)

    # stack repeats into columns of eight so the pile at $0 stays on canvas
    placed = {}
    for v in sorted(K.BOOKING_VALUES):
        x = round(_value_x(v))
        column, row = divmod(placed.get(x, 0), 8)
        placed[x] = placed.get(x, 0) + 1
        parts.append(f'<circle cx="{x + column * 21:.0f}" '
                     f'cy="{VALUE_Y - 13 - row * 19:.0f}" r="8.5" '
                     f'fill="{K.STRIP_DOT}"/>')

    median = medoid_1d(K.BOOKING_VALUES)
    average = round(sum(K.BOOKING_VALUES) / len(K.BOOKING_VALUES))
    parts.append(
        f'<g class="vmark" transform="translate({_value_x(median):.0f} {VALUE_Y})">'
        f'<line x1="0" y1="4" x2="0" y2="86" stroke="{K.ACCENT}" stroke-width="2.5" '
        f'stroke-dasharray="4 5"/>'
        f'<circle cx="0" cy="96" r="11" fill="{K.ACCENT}"/>'
        f'<text x="0" y="140" font-size="27" font-weight="700" fill="{K.ACCENT}" '
        f'text-anchor="middle">median ${median}</text></g>'
    )
    parts.append(
        f'<g class="vmark" transform="translate({_value_x(average):.0f} {VALUE_Y})">'
        f'<polygon points="0,4 -14,32 14,32" fill="{K.MEAN_MARK}"/>'
        f'<text x="34" y="62" font-size="27" font-weight="700" fill="{K.MEAN_MARK}" '
        f'text-anchor="middle">mean ${average}</text></g>'
    )
    return "\n".join(parts)


# --------------------------------------- slide 6: it never says no (k = 3..7)


def colour_slots(final, ksweep):
    """Keep clusters on the same colour as k grows.

    At each k, every cluster takes the slot most of its members wore at the
    previous k, largest cluster first; a half that has split off finds the next
    unused slot. Without this the whole field reshuffles its colours on every
    click and the splitting - which is the entire point - is invisible.
    """
    per_point = [list(final["labels"])]
    specs = [{"labels": final["labels"], "centres": final["centres"], "k": 3,
              "slot_of": {c: c for c in range(3)}}]
    for k in range(4, 8):
        spec = ksweep[k]
        labels, previous = spec["labels"], per_point[-1]
        sizes = {c: labels.count(c) for c in range(k)}
        slot_of, taken = {}, set()
        for c in sorted(range(k), key=lambda c: -sizes[c]):
            votes = {}
            for i, label in enumerate(labels):
                if label == c:
                    votes[previous[i]] = votes.get(previous[i], 0) + 1
            want = max(votes, key=votes.get)
            if want in taken:
                want = next(s for s in range(len(K.CLUSTER)) if s not in taken)
            slot_of[c] = want
            taken.add(want)
        per_point.append([slot_of[label] for label in labels])
        specs.append({"labels": labels, "centres": spec["centres"], "k": k,
                      "slot_of": slot_of})
    return per_point, specs


def never_says_no(dots, per_point, specs):
    """Every k from 3 to 7 in one SVG, switched by CSS one click at a time."""
    parts = []
    for i, dot in enumerate(dots):
        variables = "".join(f"--s{si}:{K.CLUSTER[slots[i]]};"
                            for si, slots in enumerate(per_point))
        parts.append(f'<circle class="tdot" cx="{dot["x"]}" cy="{dot["y"]}" r="8" '
                     f'style="{variables}"/>')
    for si, spec in enumerate(specs):
        marks = "".join(
            xmark(K.CLUSTER[spec["slot_of"][c]], translate=spec["centres"][c])
            for c in range(spec["k"])
        )
        parts.append(f'<g class="mgrp mg{si}">{marks}</g>')
    return "\n".join(parts)


KC_X0, KC_X1, KC_Y0, KC_Y1 = 46.0, 350.0, 36.0, 206.0


def k_chart(totals):
    """The total falling as k rises, revealed a point at a time.

    This is the chart that makes the slide's argument: the number always goes
    down, so the number alone can never tell you to stop.
    """
    lo, hi = min(totals), max(totals)

    def x_at(idx):
        return KC_X0 + idx / 4 * (KC_X1 - KC_X0)

    def y_at(v):
        return KC_Y1 - (v - lo) / (hi - lo) * (KC_Y1 - KC_Y0)

    parts = [f'<line x1="{KC_X0 - 10}" y1="{KC_Y1 + 12}" x2="{KC_X1 + 10}" '
             f'y2="{KC_Y1 + 12}" stroke="{K.AXIS}" stroke-width="3"/>']
    for idx, k in enumerate(range(3, 8)):
        parts.append(f'<text x="{x_at(idx):.0f}" y="{KC_Y1 + 44}" font-size="21" '
                     f'fill="{K.INK_SOFT}" text-anchor="middle">k = {k}</text>')
    for idx in range(1, 5):
        parts.append(
            f'<line class="cs cs{idx}" x1="{x_at(idx - 1):.0f}" '
            f'y1="{y_at(totals[idx - 1]):.0f}" x2="{x_at(idx):.0f}" '
            f'y2="{y_at(totals[idx]):.0f}" stroke="{K.INK_SOFT}" stroke-width="4"/>'
        )
    for idx in range(5):
        parts.append(
            f'<g class="cp cp{idx}"><circle cx="{x_at(idx):.0f}" '
            f'cy="{y_at(totals[idx]):.0f}" r="7" fill="{K.INK_SOFT}"/>'
            f'<text x="{x_at(idx):.0f}" y="{y_at(totals[idx]) - 16:.0f}" '
            f'font-size="21" font-weight="700" fill="{K.INK}" '
            f'text-anchor="middle">{totals[idx]:,}</text></g>'
        )
    return "\n".join(parts)


# ------------------------------------------------ slide 7: finding the knee


CURVE_X0, CURVE_X1, CURVE_Y0, CURVE_Y1 = 70.0, 920.0, 30.0, 236.0


def knee_curve(curve):
    """The full k = 1..7 sweep, with the knee and the overfit end ringed."""
    ks = sorted(curve)
    lo, hi = min(curve.values()), max(curve.values())

    def x_at(k):
        return CURVE_X0 + (k - ks[0]) / (ks[-1] - ks[0]) * (CURVE_X1 - CURVE_X0)

    def y_at(v):
        return CURVE_Y1 - (v - lo) / (hi - lo) * (CURVE_Y1 - CURVE_Y0)

    parts = [
        f'<line x1="{CURVE_X0 - 10}" y1="{CURVE_Y1 + 12}" x2="{CURVE_X1 + 10}" '
        f'y2="{CURVE_Y1 + 12}" stroke="{K.AXIS}" stroke-width="3"/>',
        '<polyline points="'
        + " ".join(f"{x_at(k):.0f},{y_at(curve[k]):.0f}" for k in ks)
        + f'" fill="none" stroke="{K.INK_SOFT}" stroke-width="4.5"/>',
    ]
    for k in ks:
        parts.append(f'<circle cx="{x_at(k):.0f}" cy="{y_at(curve[k]):.0f}" r="7" '
                     f'fill="{K.INK_SOFT}"/>')
        parts.append(f'<text x="{x_at(k):.0f}" y="{CURVE_Y1 + 46}" font-size="24" '
                     f'fill="{K.INK_SOFT}" text-anchor="middle">k = {k}</text>')
    for k, colour, label in ((3, K.ACCENT, "the knee"), (7, K.ALERT, "overfit")):
        parts.append(
            f'<g class="bring{k}"><circle cx="{x_at(k):.0f}" cy="{y_at(curve[k]):.0f}" '
            f'r="18" fill="none" stroke="{colour}" stroke-width="5"/>'
            f'<text x="{x_at(k):.0f}" y="{y_at(curve[k]) - 30:.0f}" font-size="26" '
            f'font-weight="700" fill="{colour}" text-anchor="middle">{label}</text></g>'
        )
    return "\n".join(parts)


def mini_field(dots, labels, centres, colour_of):
    """A small static field, for showing two values of k side by side."""
    parts = [f'<circle cx="{d["x"]}" cy="{d["y"]}" r="10" fill="{colour_of(labels[i])}"/>'
             for i, d in enumerate(dots)]
    parts += [xmark(colour_of(c), path_scale=1.15, translate=centre)
              for c, centre in enumerate(centres)]
    return "\n".join(parts)


# ------------------------------------- slide 8: clusters in a cloud with none


def noise_fit(noise):
    """Pure noise, coloured in on one click by a fit that is perfectly happy."""
    parts = [f'<circle class="tdot" cx="{d["x"]}" cy="{d["y"]}" r="8" '
             f'style="--nf:{K.CLUSTER[noise["labels"][i]]}"/>'
             for i, d in enumerate(noise["dots"])]
    marks = "".join(xmark(K.CLUSTER[c], translate=centre)
                    for c, centre in enumerate(noise["centres"]))
    parts.append(f'<g class="nfmarks">{marks}</g>')
    return "\n".join(parts)


# ------------------------------------------- slide 9: resample, refit, compare


def shake_field(dots, reference, rounds):
    """Three bootstrap rounds held in one SVG, one per click.

    Per round a dot carries its refitted colour, an opacity that fades out the
    points this resample never drew, and a stroke width that rings the ones it
    drew more than once - so the resampling itself is visible, not just its
    result.
    """
    parts = []
    for i, d in enumerate(dots):
        variables = f"--b0:{K.CLUSTER[reference[i]]};"
        for r, rnd in enumerate(rounds, start=1):
            count = rnd["counts"][i]
            variables += (f"--b{r}:{K.CLUSTER[rnd['labels'][i]]};"
                          f"--o{r}:{1 if count > 0 else 0.15};"
                          f"--w{r}:{3.5 if count >= 2 else 0};")
        parts.append(f'<circle class="tdot" cx="{d["x"]}" cy="{d["y"]}" r="11" '
                     f'style="{variables}"/>')
    return "\n".join(parts)


def _jaccard_bar(labels):
    n = len(labels)
    return '<div class="jbar">' + "".join(
        f'<span style="width:{100 * labels.count(c) / n:.1f}%;'
        f'background:{K.CLUSTER[c]}"></span>'
        for c in sorted(set(labels))
    ) + "</div>"


def jaccard_table(reference, rounds):
    """The cluster-size bars for the original fit and each refit, plus scores.

    The scores are held back until the last click: the bars are meant to be
    read as shapes first, before anybody starts comparing decimals.
    """
    parts = [f'<div class="jline">{_jaccard_bar(reference)}<span class="jsc"></span></div>']
    for r, rnd in enumerate(rounds, start=1):
        parts.append(f'<div class="jline jv jv{r}">{_jaccard_bar(rnd["labels"])}'
                     f'<span class="jsc jnum">{rnd["jaccard"]:.2f}</span></div>')
    return "".join(parts)
