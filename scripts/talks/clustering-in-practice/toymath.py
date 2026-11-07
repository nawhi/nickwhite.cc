"""The clustering that the deck actually shows running.

Everything in here is computed from scratch at build time out of three
hand-specified Gaussian blobs and a t(3) noise cloud drawn from a seeded
numpy generator. There is no input file and no dataset: the "data" is three
lines of `rng.normal(...)`, and every number that appears on the slides -
the running total-distance meter, the centroid positions, the k = 1..7 sweep,
the bootstrap Jaccard scores - falls out of running plain Lloyd's algorithm
over those points.

The seeds are searched rather than hand-picked. `make_groups` is swept until
a (data seed, fit seed) pair produces a fit that converges in 4-8 passes,
recovers the three planted blobs, and reassigns a visible number of points on
the first pass - i.e. a walkthrough that is worth watching. The result is
deterministic, so the build is reproducible.
"""

from itertools import permutations

import numpy as np

# the toy canvas every set of coordinates is projected onto, in SVG user units
TOY_W, TOY_H = 980.0, 560.0
PAD = 50.0


# --------------------------------------------------------------- Lloyd's algorithm

def lloyd(points, k, seed):
    """Plain Lloyd with recorded history.

    history[i] holds the centres used at pass i and the assignment they
    produce, which is exactly what the slide animates: measure, assign, move,
    repeat. The 60-pass ceiling is never reached: these fits converge in
    single digits.
    """
    r = np.random.default_rng(seed)
    centres = points[r.choice(len(points), k, replace=False)].copy()
    history, labels = [], np.full(len(points), -1)
    for _ in range(60):
        d = ((points[:, None, :] - centres[None]) ** 2).sum(axis=2)
        new = d.argmin(axis=1)
        history.append({"labels": new.copy(), "centres": centres.copy()})
        if (new == labels).all():
            break
        labels = new
        for c in range(k):
            if (labels == c).any():
                centres[c] = points[labels == c].mean(axis=0)
    return labels, history


def plain_total(points, labels, centres):
    """Total straight-line distance from every point to its own centre.

    Plain distance, not the squared distance k-means actually minimises: the
    meter on the slide is there to be read by eye, and metres beat metres
    squared for that.
    """
    return float(np.linalg.norm(points - centres[labels], axis=1).sum())


def best_lloyd(points, k, n_init=8, seed0=0):
    """Best of n_init random restarts, judged on total plain distance."""
    best, best_total = None, float("inf")
    for s in range(n_init):
        labels, hist = lloyd(points, k, seed0 + s)
        t = plain_total(points, labels, hist[-1]["centres"])
        if t < best_total:
            best, best_total = (labels, hist), t
    return best


def match_perm(reference, candidate, k):
    """The relabelling of `candidate` that agrees most with `reference`.

    Cluster numbers are arbitrary, so a refit has to be matched back to the
    original colours before the two can be compared at all.
    """
    best, agree = None, -1
    for p in permutations(range(k)):
        a = int((reference == np.array(p)[candidate]).sum())
        if a > agree:
            best, agree = np.array(p), a
    return best


def canvas_mapper(points):
    """Scale `points` to fill the toy canvas, y flipped for SVG.

    Returns the mapping rather than the mapped points, because centroids live
    in data space too and have to go through the same one or they would not
    land where the eye expects.
    """
    lo, hi = points.min(axis=0), points.max(axis=0)

    def project(other):
        unit = (np.atleast_2d(other) - lo) / (hi - lo)
        return np.column_stack([PAD + unit[:, 0] * (TOY_W - 2 * PAD),
                                TOY_H - PAD - unit[:, 1] * (TOY_H - 2 * PAD)])

    return project


# --------------------------------------------------------------- the three blobs

def make_groups(seed):
    """Three round, well-separated blobs. Invented, not measured."""
    r = np.random.default_rng(seed)
    return np.vstack([
        r.normal([-2.2, 1.2], 0.62, (40, 2)),
        r.normal([2.3, 1.0], 0.68, (40, 2)),
        r.normal([0.1, -1.9], 0.55, (25, 2)),
    ])


GROUP_SIZES = (40, 40, 25)
TRUTH = np.array([0] * GROUP_SIZES[0] + [1] * GROUP_SIZES[1] + [2] * GROUP_SIZES[2])


def find_walkthrough():
    """Search seeds for a fit that makes a good walkthrough.

    Wanted: it recovers the planted blobs (so the slide can honestly say the
    algorithm works), takes between four and eight passes (long enough to show
    the loop, short enough to sit through), and reassigns at least six points
    on the first pass (so the first click visibly does something).
    """
    for data_seed in range(30):
        points = make_groups(data_seed)
        for fit_seed in range(60):
            labels, hist = lloyd(points, 3, fit_seed)
            agree = max(int((TRUTH == np.array(p)[labels]).sum())
                        for p in permutations(range(3)))
            flips1 = int((hist[1]["labels"] != hist[0]["labels"]).sum())
            if agree >= 100 and 4 <= len(hist) <= 8 and flips1 >= 6:
                return data_seed, fit_seed, points, labels, hist
    raise RuntimeError("no seed produced a usable walkthrough")


# the outliers that get dragged in on the extreme-values slide. Placed by hand
# out to the right of the field, far enough to move a centre visibly.
DRAG_POINTS = np.array([[4.7, 1.2], [5.2, 2.0], [4.9, 2.8],
                        [5.6, 1.6], [5.0, 0.6], [5.5, 2.5]])


def medoid(points):
    """The member minimising total plain distance to the others.

    The resistance a medoid has to extreme values comes from using plain
    distances rather than squared ones, which is why this is not just an
    argmin over a different norm.
    """
    d = np.linalg.norm(points[:, None, :] - points[None], axis=2)
    return int(d.sum(axis=1).argmin())


# --------------------------------------------------------------- bootstrap

def shake(points, ref_labels, k, seed):
    """Resample with replacement, refit, and map the refit back onto the
    original points by nearest new centre, relabelled to match the reference.

    Returns the per-point labels plus how many times each original point was
    drawn (0 means it sat this round out).
    """
    r = np.random.default_rng(seed)
    idx = r.integers(0, len(points), len(points))
    counts = np.bincount(idx, minlength=len(points))
    _, bhist = best_lloyd(points[idx], k, n_init=6, seed0=seed)
    bc = bhist[-1]["centres"]
    full = ((points[:, None, :] - bc[None]) ** 2).sum(axis=2).argmin(axis=1)
    perm = match_perm(ref_labels, full, k)
    return perm[full], counts


def round_jaccard(ref_labels, boot_labels, counts, k):
    """Mean best-match Jaccard between the reference clusters and a refit.

    Points the resample never drew are excluded: they were not part of this
    round's fit, so scoring them would measure nothing.
    """
    seen = counts > 0
    vals = []
    for c in range(k):
        a = (ref_labels == c) & seen
        if not a.any():
            continue
        best = 0.0
        for c2 in range(k):
            m = (boot_labels == c2) & seen
            best = max(best, (a & m).sum() / (a | m).sum())
        vals.append(best)
    return float(np.mean(vals))


def shake_rounds(points, ref_labels, k, seed0=77):
    """The three resample-and-refit rounds, each with its own Jaccard score."""
    rounds = []
    for r in range(3):
        bl, counts = shake(points, ref_labels, k, seed0 + 13 * r)
        rounds.append({
            "labels": bl.tolist(),
            "counts": counts.tolist(),
            "jaccard": round(round_jaccard(ref_labels, bl, counts, k), 2),
        })
    return rounds


# --------------------------------------------------------------- noise cloud

def find_noise_cloud():
    """A cloud with no clusters in it at all: 105 draws from a 2-D t(3).

    Heavy tails give it the lumpy look of something that might have structure.
    The seed search only rejects draws with a point so far out that the canvas
    projection squashes everything else into the middle.
    """
    for noise_seed in range(30):
        r = np.random.default_rng(noise_seed)
        points = r.standard_t(3, (105, 2))
        if np.abs(points).max() < 7:
            return noise_seed, points
    raise RuntimeError("no seed produced a usable noise cloud")


# --------------------------------------------------------------- the whole build

def compute():
    """Run every fit the deck shows and return the results as plain data."""
    data_seed, fit_seed, g_xy, g_labels, g_hist = find_walkthrough()
    project = canvas_mapper(g_xy)
    g_disp = project(g_xy)

    # --- the walkthrough: the first three passes, each drawn with its
    # measurement lines, and then the converged state
    states = []
    for h in g_hist[:3]:
        cc = project(h["centres"])
        states.append({
            "labels": h["labels"].tolist(),
            "centres": cc.round(1).tolist(),
            "total": round(plain_total(g_disp, h["labels"], cc)),
        })
    final_cc = project(g_hist[-1]["centres"])
    final = {
        "labels": g_labels.tolist(),
        "centres": final_cc.round(1).tolist(),
        "total": round(plain_total(g_disp, g_labels, final_cc)),
    }
    totals = [s["total"] for s in states] + [final["total"]]
    assert all(a >= b for a, b in zip(totals, totals[1:])), f"meter must fall: {totals}"

    # --- extreme values: six outliers join, one update-and-reassign pass
    aug_xy = np.vstack([g_xy, DRAG_POINTS])
    drag_join = (((DRAG_POINTS[:, None, :] - g_hist[-1]["centres"][None]) ** 2)
                 .sum(axis=2).argmin(axis=1))
    aug_labels = np.concatenate([g_labels, drag_join])
    new_centres = np.vstack([aug_xy[aug_labels == c].mean(axis=0) for c in range(3)])
    reassigned = ((aug_xy[:, None, :] - new_centres[None]) ** 2).sum(axis=2).argmin(axis=1)
    drag_flips = int((reassigned[:len(g_xy)] != g_labels).sum())
    dragged_cluster = int(np.bincount(drag_join, minlength=3).argmax())

    # the medoid of each cluster, before and after - the whole point of the
    # slide is that only the mean moves
    medoids0, medoids1 = [], []
    for c in range(3):
        members = g_xy[g_labels == c]
        medoids0.append(project(members[medoid(members)])[0])
        if c == dragged_cluster:
            withs = np.vstack([members, DRAG_POINTS])
            medoids1.append(project(withs[medoid(withs)])[0])
        else:
            medoids1.append(medoids0[-1])
    medoids0, medoids1 = np.array(medoids0), np.array(medoids1)

    drag = {
        "dots": [{"x": round(float(x), 1), "y": round(float(y), 1)} for x, y in g_disp],
        "outliers": [{"x": round(float(x), 1), "y": round(float(y), 1)}
                     for x, y in project(DRAG_POINTS)],
        "labels": g_labels.tolist(),
        "centres0": project(g_hist[-1]["centres"]).round(1).tolist(),
        "centres1": project(new_centres).round(1).tolist(),
        "medoids0": medoids0.round(1).tolist(),
        "medoids1": medoids1.round(1).tolist(),
        "dragged": dragged_cluster,
        "flips": drag_flips,
    }

    # --- it never says no: k = 4..7 forced onto three real groups
    ksweep = {}
    for k in range(4, 8):
        kl, kh = best_lloyd(g_xy, k)
        ksweep[k] = {"labels": kl.tolist(),
                     "centres": project(kh[-1]["centres"]).round(1).tolist(),
                     "total": round(plain_total(g_disp, kl, project(kh[-1]["centres"])))}
    sweep_totals = [final["total"]] + [ksweep[k]["total"] for k in range(4, 8)]
    assert all(a >= b for a, b in zip(sweep_totals, sweep_totals[1:]))
    k4_labels = np.array(ksweep[4]["labels"])
    assert max(len(set(k4_labels[TRUTH == t])) for t in range(3)) > 1, "k=4 must split a group"

    # --- the knee chart: the same meter, swept over k = 1..7
    curve = {}
    for k in range(1, 8):
        kl, kh = best_lloyd(g_xy, k)
        curve[k] = round(plain_total(g_disp, kl, project(kh[-1]["centres"])))

    # --- a cloud with nothing in it, fitted just as confidently
    noise_seed, n_xy = find_noise_cloud()
    n_labels, n_hist = best_lloyd(n_xy, 4)
    n_project = canvas_mapper(n_xy)
    n_disp = n_project(n_xy)
    n_cc = n_project(n_hist[-1]["centres"])

    noise = {
        "dots": [{"x": round(float(x), 1), "y": round(float(y), 1)} for x, y in n_disp],
        "labels": n_labels.tolist(),
        "centres": n_cc.round(1).tolist(),
        "total": round(plain_total(n_disp, n_labels, n_cc)),
    }

    # --- resample and refit, on the real structure and on the noise
    #
    # seed 1 on the blobs is chosen so each round lands at 0.96-0.97: a single
    # boundary point changes hands and nothing else. These blobs are separated
    # enough that a resample almost never dislodges two points at once, so this
    # is about as unstable as honest structure gets. The noise cloud needs no
    # such help - it falls apart on its own.
    toy_rounds = shake_rounds(g_xy, g_labels, 3, seed0=1)
    noise_rounds = shake_rounds(n_xy, n_labels, 4)

    return {
        "seeds": {"data": data_seed, "fit": fit_seed, "noise": noise_seed,
                  "passes": len(g_hist)},
        "dots": [{"x": round(float(x), 1), "y": round(float(y), 1)} for x, y in g_disp],
        "states": states,
        "final": final,
        "ksweep": ksweep,
        "curve": curve,
        "rounds": toy_rounds,
        "drag": drag,
        "noise": noise,
        "noise_rounds": noise_rounds,
    }
