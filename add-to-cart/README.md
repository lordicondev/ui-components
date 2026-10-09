# Add to cart

Two toggle buttons on one attribute each. The cart button opens to say "Added to cart"
while its basket morphs into a tick. The heart beside it fills in and stays filled.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                | Watches                       | On                              |
| ---------------------- | ----------------------------- | ------------------------------- |
| `follow(aria-pressed)` | `aria-pressed` on `.cart`     | the basket, state `morph-add`   |
| `follow(aria-pressed)` | `aria-pressed` on `.favorite` | the heart, state `morph-select` |

The same trigger on both. The `state` attribute in the markup picks which morph each icon
plays.

## Notes

- The cart opens by transitioning three properties: the width of the box holding the
  words, the gap before it, and the button's padding. Closing is the same transitions in
  reverse; the words are clipped by the narrowing box and not animated.
- Width cannot transition to `auto`, so `measure()` writes the label's width into
  `--said-width` once the font has loaded. The label has `width: max-content`, which lets
  it be measured while the box is closed.
- The words arrive with `revealText()` from `shared/motion/text-reveal.ts`, starting 100ms
  into the opening so they land as the button stops.
- The pair is anchored on its right, so the cart opens leftward and the heart never moves.
- Both buttons rename themselves on press. The name is the `.tooltip` span inside the
  button, which `shared/ui/tooltip.ts` shows on hover, so the visible and the spoken name
  are the same text. The words inside the open button are `aria-hidden`: `aria-pressed`
  already says the same thing.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/add-to-cart) 1.0.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
