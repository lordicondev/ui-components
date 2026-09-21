# Accordion

A disclosure list where the chevron follows `aria-expanded` on the button it sits in.

`chevron-down` carries a `morph-direction` state, so the turn is the icon's own animation
played forward to open and backward to close — there is no CSS rotation left in the demo.
The same `booleanMorph` implementation drives the password field's eye; only the attribute
differs. Colour is the one thing the stylesheet still says about the icon, and it says it
without a transition: open or closed is a state, not a movement.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger          | Watches                             | On                                     |
| ---------------- | ----------------------------------- | -------------------------------------- |
| `expanded-morph` | `aria-expanded` on `.item__trigger` | the chevron, `state="morph-direction"` |

## Worth noticing

**The panel animates its own height.** There is no transition from `0` to `auto`, so
`main.ts` measures `scrollHeight` and hands that to the Web Animations API. The animation
fills forwards and then cancels itself once it has finished, which is what keeps a
one-frame flash out of the end of a collapse _and_ leaves no inline `style.height` behind —
an open panel is back on `height: auto` and reflows with the window. `hidden` stays the
source of truth for assistive technology; it comes off before the box is measured and goes
back on after the box has closed.

**Opening and closing are not mirror images, on purpose.** Closing slides the paragraph
down under the shrinking clip without fading it, so every word stays readable right up to
the edge it disappears under. Opening leaves the paragraph where it is and fades the words
in one after another. They read differently because they mean different things: one is
text being taken away, the other is text arriving.

**The wave takes the same 500ms for three words or for thirty.** Each word's fade is a
fixed share of the run and the stagger absorbs the count, so a long answer arrives as a
denser wave rather than a slower one.

That effect lives in `shared/motion/text-reveal.ts` rather than in a trigger: it is not
icon behaviour, and the next demo that wants it imports the same file.

**`prefers-reduced-motion` is handled in JavaScript here, not in CSS.** A media query
switches off a CSS transition, but it has no say over an animation started from script —
so the panel and the text both ask before they move, and the icon's trigger does the same.
A stylesheet rule would have looked like it was doing the work without doing any of it.
