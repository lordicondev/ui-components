# Star button

A star you press. `aria-pressed` on the button is the whole state: the icon morphs on it,
the stylesheet colours by it, and the count is derived from it.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                   | On                             |
| --------------- | ------------------------- | ------------------------------ |
| `pressed-morph` | `aria-pressed` on `.star` | the star, state `morph-select` |

`booleanMorph('aria-pressed')`. The morph state's first half plays on press and the second
half on un-press. A press that lands mid-animation reverses it in place.

## Notes

- The count is not kept as a number. `OTHERS` is read from the markup once, and every
  render is `OTHERS + (starred ? 1 : 0)`, so it cannot drift from the attribute.
- There is no lock while the star animates. A click mid-morph turns the icon around, and
  the number is recomputed, so however fast you click, all three agree at the end.
- Hover shows the colour a press would leave. The shape, hollow or filled, is what tells
  the two states apart.
- `shared/public/icons/star.json` is hand-edited: its `morph-select` marker got the `:0.5`
  ratio that tells the trigger where the fill ends and the way back begins.
  `shared/icons.json` records the edit.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/star-button), where it sits
alongside the other demos and the triggers it uses.
