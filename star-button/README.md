# Star button

A star you press. It fills in, the count goes up by one, and pressing again undoes both.

The whole control is one boolean. `aria-pressed` says whether you have starred this, and
three separate things read it: the icon morphs on it, the stylesheet colours on it, and
the number is derived from it. Nothing keeps a second copy, so nothing can drift.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                   | On                             |
| --------------- | ------------------------- | ------------------------------ |
| `pressed-morph` | `aria-pressed` on `.star` | the star, state `morph-select` |

`booleanMorph` again, with no change: the same trigger drives the password field's eye and
the checkbox list's ticks. A morph state carries a ratio, and the trigger splits the state
there — frames up to it are the fill, the rest are the way back — so pressing plays one
half and un-pressing plays the other.

## Worth noticing

The count is not counted. `OTHERS` is read once from the markup — the number of stars
without yours — and every render is `OTHERS + (starred ? 1 : 0)`. A counter that
incremented and decremented would be a second source of truth about the same fact, and the
first missed click would leave it one out forever.

That is also why there is no lock on the button. Clicking faster than the morph does not
need guarding against, because there is nothing to knock out of step: a click that lands
mid-fill turns the icon around rather than restarting it, the number is recomputed rather
than nudged, and where you stop clicking is what all three agree on. Guarding it would
mean the demo knowing how long the icon takes, which is exactly the coupling the rest of
this repo is written to avoid.

Colour is a fourth reader of the same attribute, and it is instant. The star has three
steps — resting, under the pointer, and starred — so hovering shows the colour a press
would leave behind, while the shape still tells you where you are: hollow against filled.

## About the icon file

`shared/public/icons/star.json` is hand-edited. Its `morph-select` marker arrived without
the `:0.5` ratio that says where the fill ends and the way back begins, and without it the
state is treated as one long transition — pressing would fill the star and immediately
empty it again. The ratio is in the artwork either way: the fill reaches full at frame 30
of 60, and the two halves are mirror images. Adding it to the marker is the edit, and
`shared/icons.json` records it.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/star-button), where it sits
alongside the other demos and the triggers it uses.
