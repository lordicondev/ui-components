# Add to cart

Two buttons on one attribute each. The cart button opens to say "Added to cart" while its
basket morphs into a tick, then closes back to the basket on its own, like a toast. The
heart beside it is a toggle: it fills in and stays filled.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                | Watches                       | On                              |
| ---------------------- | ----------------------------- | ------------------------------- |
| `follow(data-added)`   | `data-added` on `.cart`       | the basket, state `morph-add`   |
| `follow(aria-pressed)` | `aria-pressed` on `.favorite` | the heart, state `morph-select` |

The same trigger on both, on a different attribute. The `state` attribute in the markup
picks which morph each icon plays.

## Notes

- Adding is an action, not a toggle, so the cart has no `aria-pressed`. A press sets
  `data-added="true"` and starts a 2000ms timer; the timer sets it back to `"false"`. The
  basket needs 1000ms to become a tick, so the tick shows for a second.
- A press while the button is open restarts the timer and changes nothing else, so fast
  clicking never replays the opening. A press while it is closing opens it again from where
  it is: the transitions and the morph reverse mid-way.
- The words are `aria-hidden`. A `role="status"` paragraph gets "Added to cart" so a screen
  reader hears it, and the tooltip hides while the button says the same thing.

- The cart opens by transitioning three properties: the width of the box holding the
  words, the gap before it, and the button's padding. Closing is the same transitions in
  reverse; the words are clipped by the narrowing box and not animated.
- Width cannot transition to `auto`, so `measure()` writes the label's width into
  `--said-width` once the font has loaded. The label has `width: max-content`, which lets
  it be measured while the box is closed.
- The words arrive with `revealText()` from `shared/motion/text-reveal.ts`, starting 100ms
  into the opening so they land as the button stops.
- The pair is anchored on its right, so the cart opens leftward and the heart never moves.
- The heart renames itself on press. The name is the `.tooltip` span inside the button,
  which `shared/ui/tooltip.ts` shows on hover, so the visible and the spoken name are the
  same text.
