"""The fixed values the deck is drawn from: its palette and its published data.

Two kinds of thing live here.

The palette and the layout colours are just the deck's design tokens.

The rest is data that is published on the page as it stands - the four example
personas, the dot field behind them, the lead-time strip on the extreme-values
slide, the booking-value sample on the sensitivity slide. These are the figures
the talk puts on screen, written down here as literals so that the build has
nothing to read and nothing to recompute. They are illustrative figures for a
worked example, not a live extract of anything: rebuilding the page gives you
the same page back.

Everything else the deck shows - the toy k-means walkthrough, the k-sweep, the
noise cloud, the bootstrap rounds - is not here, because it is not data. It is
generated at build time by toymath.py.
"""

# --------------------------------------------------------------------- palette

INK = "#27272a"            # body text, the emphasis ring on the chosen dot
INK_SOFT = "#52525b"       # captions, axis labels, chart lines
ACCENT = "#2a78d6"         # rules, links, the medoid marker, the knee ring
AXIS = "#d4d4d8"           # axis rules and tick marks
GREY_DOT = "#d4d4d8"       # an unfitted dot, before it is given a colour
MEASURE_LINE = "#a1a1aa"   # the point-to-centroid distance lines
STRIP_DOT = "#71717a"      # dots on the one-dimensional strip plots
HALO = "#fafafa"           # the page-coloured outline that keeps an X readable
ALERT = "#d03b3b"          # extreme values, the overfit ring
MEAN_MARK = "#eb6834"      # the mean marker, against ACCENT for the medoid

# Cluster colours, in slot order. A fit of k clusters uses the first k, and the
# k-sweep keeps each cluster on its slot as k grows so the eye can follow a
# group splitting rather than watching the whole field change colour.
CLUSTER = ["#2a78d6", "#eb6834", "#10b981", "#4a3aa7",
           "#e87ba4", "#eda100", "#e34948"]

# ------------------------------------------------------------------- personas

# The four example personas, ranked by the share of journeys that booked. The
# bar under each card is scaled against the best rate. `text` is a darkened
# version of `colour` for the two cards whose colour is too light to read as
# text at this size; the others use their own colour.
PERSONAS = [
    {"name": "Short-break solo flyers",
     "traits": "Oahu & Kauai · mostly travelling alone · 2 nights · ~38 d lead",
     "booked_pct": 6.8, "colour": "#eb6834", "text": "#c2410c"},
    {"name": "Inter-island pairs",
     "traits": "Oahu & Big Island · pairs · 5 nights · ~24 d lead",
     "booked_pct": 5.9, "colour": "#4a3aa7", "text": None},
    {"name": "West Coast long-stayers",
     "traits": "California & Pacific Northwest · pairs · 8 nights · ~72 d lead",
     "booked_pct": 4.7, "colour": "#2a78d6", "text": None},
    {"name": "Long-haul luxury planners",
     "traits": "mostly Japan · suites & spa · 9 nights · ~104 d lead",
     "booked_pct": 3.6, "colour": "#10b981", "text": "#047857"},
]

PERSONA_BAR_MAX = 240  # px, the bar length given to the top-ranked persona

# The dot field behind the cards: one dot per journey, as (left, top, shape,
# persona). left/top are CSS offsets in the 980x560 field, already offset by
# half a dot. Shape marks the party type - round solo, square couple, triangle
# family, diamond group - matching the legend underneath.
FIELD_DOTS = [
    (570, 298, '', 0), (764, 221, 'dia', 2), (865, 291, '', 2),
    (820, 216, '', 2), (843, 460, '', 1), (483, 249, 'tri', 1),
    (960, 338, 'sq', 2), (958, 268, 'sq', 2), (791, 204, 'dia', 2),
    (846, 429, 'sq', 1), (532, 246, 'tri', 1), (960, 306, 'sq', 2),
    (507, 290, 'sq', 1), (504, 193, 'tri', 2), (802, 496, '', 0),
    (22, 316, 'sq', 3), (776, 432, '', 1), (733, 540, 'sq', 0),
    (727, 463, 'sq', 1), (792, 420, 'sq', 1), (4, 130, 'dia', 2),
    (237, 414, 'sq', 3), (509, 240, 'tri', 1), (833, 306, 'tri', 2),
    (933, 321, 'sq', 2), (874, 523, 'sq', 1), (514, 147, 'dia', 2),
    (761, 374, 'dia', 1), (606, 313, '', 0), (67, 20, 'sq', 1),
    (727, 382, '', 0), (798, 134, 'sq', 2), (220, 465, 'sq', 3),
    (435, 277, 'sq', 1), (903, 540, 'sq', 1), (164, 455, 'sq', 3),
    (249, 446, 'sq', 3), (819, 475, 'sq', 1), (850, 266, '', 2),
    (812, 200, 'dia', 2), (224, 459, 'sq', 3), (810, 527, 'sq', 1),
    (460, 292, 'tri', 1), (938, 512, '', 1), (857, 190, 'sq', 2),
    (776, 206, 'sq', 2), (931, 521, 'sq', 1), (902, 472, 'sq', 1),
    (662, 404, '', 0), (874, 471, 'sq', 1), (837, 261, 'tri', 2),
    (913, 465, 'sq', 1), (870, 159, 'sq', 2), (866, 517, 'sq', 1),
    (746, 484, '', 0), (709, 421, '', 1), (494, 154, 'dia', 2),
    (496, 179, '', 0), (960, 264, 'dia', 2), (918, 483, 'sq', 1),
    (472, 366, 'sq', 1), (899, 462, 'sq', 1), (227, 472, '', 3),
    (638, 392, '', 0), (686, 491, '', 0), (696, 439, '', 0),
    (164, 425, 'sq', 3), (229, 4, 'tri', 3), (788, 474, 'sq', 1),
    (799, 251, 'dia', 2), (800, 511, 'sq', 1), (950, 315, 'tri', 2),
    (772, 245, 'tri', 2), (766, 524, 'sq', 0), (942, 283, 'sq', 2),
    (686, 454, '', 0), (960, 352, 'sq', 2), (821, 165, 'sq', 2),
    (938, 460, 'sq', 1), (712, 430, '', 0), (359, 61, 'sq', 2),
    (510, 124, 'tri', 0), (406, 40, 'sq', 2), (839, 238, '', 2),
    (689, 383, 'tri', 0), (194, 183, '', 0), (960, 336, 'sq', 2),
    (912, 502, 'sq', 1), (166, 356, '', 3), (874, 447, 'sq', 1),]


# ------------------------------------------------- the extreme-values primer

# Lead times in days for one cluster, as plotted on the strip. The two tail
# values arrive one at a time on the first click: they are what drags the mean
# across the chart while the medoid stays put.
PRIMER_CLUMP = [0, 0, 2, 4, 5, 6, 8, 10, 22, 32, 34, 40, 43, 48, 54, 55, 65,
                65, 71, 76, 77, 81, 83, 86, 89, 90, 94, 100, 104, 120, 124,
                130, 131, 138]
PRIMER_TAIL = [612, 641]

# -------------------------------------------------- the booking-value sample

# Fifty journeys from one persona: forty-seven that never booked and three that
# did. The point of the slide is the gap between the two summary numbers this
# produces - a median of $0 and a mean of $78, neither of which describes
# anybody in particular.
BOOKING_VALUES = [0] * 47 + [610, 1381, 1910]
