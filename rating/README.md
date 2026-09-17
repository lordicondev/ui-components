# Rating

Five stars. Point at one and the row lights up towards you, one star after the next; click
and they fill the same way, spreading out from the one you pressed.

Two things are being said at once, and the demo keeps them apart. `data-chosen` is the
rating as it stands. `data-lit` is what the pointer is promising — the rating, until
someone hovers and offers another. The shape follows the first, the colour follows the
second, and the icon answers both.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                        | On                             |
| --------------- | ------------------------------ | ------------------------------ |
| `preview-morph` | `data-chosen` on `.star`       | the star, state `morph-select` |
| `preview-morph` | `data-lit` on the same `.star` | the star's default state       |

`previewMorph` is `booleanMorph` with a second answer. The morph half is unchanged — both
are built on the same `MorphTrigger` — and the addition is a nudge: when the promise
arrives, the icon borrows its own default state, plays it once and gives the player back.

That nudge only happens on the way in, and only from the resting look. A star already
filled has nothing to preview: it is showing more than a nudge could say, and playing the
default state would take the fill away in order to say it. Withdrawing the promise is
silent for the same reason — nothing is being offered, only taken back.

## Worth noticing

The delay lives in the state, not in the icons and not in the stylesheet. `spread()` sets
one attribute every 80ms and everything downstream is instant: the colour is a plain CSS
rule with no transition, and the nudge starts the moment its attribute lands. Two different
effects run as one wave without either knowing the other is there — which is also why the
wave costs nothing to change. The 80ms is one constant.

Every run goes right to left, and it is the same rule doing two jobs. The first star to
change is always the rightmost one that has to change at all: pointing at the third star,
that is the third star, and the light runs back towards one; dropping a rating from four to
one, it is the fourth, and the stars come off the end as the rating falls. Nothing is
counted from where you clicked.

Offering and withdrawing are not mirrors. Lighting the row is an event worth spreading out;
darkening it is not an event at all, so those stars go grey at once. Changing the rating
does move the shape both ways, so that one runs in both directions.

Lighting and filling keep separate lists of timers, which is not tidiness. They are
cancelled by different things — a pointer moving cancels the light, a new rating cancels
the fill — and sharing one list meant that moving the pointer during a fill cancelled the
rest of it, leaving a row filled at one and four with a hole in between.

A star that is filled but no longer promised goes grey while keeping its shape. That is not
a special case: the shape is the rating and the colour is the promise, and previewing two
stars when four are chosen is exactly when those two answers differ.

Stars that already agree are never in a run. They cost no delay, they do not re-nudge, and
the run is only as long as the number of stars that actually change.

## The control underneath

It is a radio group, hidden but entirely real: arrow keys move the rating, the choice
submits with a form, and each star has a name to be read out. `change` fires for a click
and for an arrow key alike, so there is one path into `choose()` rather than two.

A radio cannot be unchecked by clicking it again, which on its own leaves the group able to
go down to one star but never back to none. Pressing the star that is already the whole
rating clears it, and that has to be acted on after the click rather than during it: a
label re-checks its radio on the way out, after the listener has run, so a radio unchecked
any earlier is simply checked straight back again.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/rating), where it sits
alongside the other demos and the triggers it uses.
