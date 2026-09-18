# Add to cart

Two buttons, and between them the whole difference between doing something and keeping
something. The cart opens to say what it did and the basket becomes a tick; the heart beside
it fills in and stays filled. Both of them run the same trigger, watching the same attribute,
and neither of them knows the other is there.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                       | On                              |
| --------------- | ----------------------------- | ------------------------------- |
| `pressed-morph` | `aria-pressed` on `.cart`     | the basket, state `morph-add`   |
| `pressed-morph` | `aria-pressed` on `.favorite` | the heart, state `morph-select` |

One registration covers both. `booleanMorph('aria-pressed')` is the press toggle the star
button already uses, and what makes the two icons behave differently here is not the code
but the `state` attribute in the markup — `morph-add` tips something into the basket and
draws a tick round it, `morph-select` fills the heart. The trigger never learns which is
which, and neither does `main.ts`.

## Worth noticing

The two icons are answering different questions, and it shows in how long they take. The
heart is a fact: you have favourited this, and the filled shape is what that fact looks
like. The basket is an event: something went in, and the tick is the receipt. So the heart
morphs in the time a state change takes and the basket takes a whole second, most of which
is spent on the thing dropping in — because there is something to watch, and the icon is
the only part of the button that is telling you what happened rather than that it happened.

Which means the button stops moving before the icon does, by about half a second, and that
is on purpose. The box is the sentence and the icon is the story; a box that waited for the
story would read as slow.

Opening is three properties moving together — the width of the box holding the words, the
gap in front of it, and the button's own padding — and none of them is the button's width.
The button has no width of its own at all, which is why nothing in the stylesheet knows how
long "Added to cart" is, and why the whole thing would still work in a language where it is
twice as long.

One number does have to be found, and CSS cannot find it: there is no transition from `0`
to `auto`. So the words are asked. `width: max-content` keeps the label at its natural size
inside a box that is currently zero wide, which means it can be measured without opening
anything, and the answer goes into `--said-width` for the stylesheet to travel to. It is
measured after the font has loaded, because Figtree arrives a moment late and is not the
width of the fallback it replaces.

Closing has no animation of its own, and that is the point of the box being the thing that
moves. The words are not faded, not moved, not told anything: the box narrows, and they go
under its right edge one letter at a time. Fading them out as well would be saying the same
thing twice, more slowly.

The pair is anchored on its right, so the cart opens into the space on the left and the
heart never moves. That is not a composition choice — the heart is the next thing your hand
is reaching for, and a button that slides out from under the pointer because the one beside
it grew is a button you have to go and find again.

## The words

The wave is the accordion's, out of `shared/motion/text-reveal.ts`, and this demo is why it
learned a `delay`. The button takes 400ms to open, and the first 100ms of that is spent with
nowhere to put a word — one fading in against the edge of a box that has not arrived yet
reads as the box being late rather than the word being early. The rest is timed so that the
last word lands as the button stops.

## The control underneath

Both are toggle buttons, and `aria-pressed` is the whole of their state: the icons read it
through `target`, the stylesheet colours and opens on it, and `main.ts` sets it and stops.

Both buttons rename themselves when you press them, and the rule is the same for both: a
button is called what pressing it would do next. A full basket offers to be emptied, a
filled heart offers to be emptied too, and neither of them should still be offering to be
filled. That name is the tooltip element — the same span `shared/ui/tooltip.ts` shows on
hover — so one line changes what is drawn and what is read out at once, because they were
never two different pieces of text.

Which leaves the words inside the open button, and those are hidden from a screen reader.
They are not the name and they are not a second name: they say what the button has already
done, and `aria-pressed` has said that. The two halves are "Remove from cart, toggle
button, pressed" and the word _Added_ sitting there on the orange — the same fact, once for
each way of reading a page.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/add-to-cart), where it sits
alongside the other demos and the triggers it uses.
