# Accordion

A disclosure list. The chevron follows `aria-expanded` on the button it sits in, and the
panel below animates its own height.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                 | Watches                             | On                                   |
| ----------------------- | ----------------------------------- | ------------------------------------ |
| `follow(aria-expanded)` | `aria-expanded` on `.item__trigger` | the chevron, state `morph-direction` |

The icon's `morph-direction` state plays forwards to open and backwards to close, so there
is no CSS rotation in the demo. The stylesheet only sets the chevron's colour.

## Notes

- `height` cannot transition to `auto`, so `setPanel()` measures `scrollHeight` and animates
  with the Web Animations API. The animation fills forwards, and once it has finished the
  panel is hidden (or not) and the animation cancelled, so no inline height is left behind.
- `hidden` stays the source of truth for assistive technology. It comes off before the box
  is measured and goes back on after the box has closed.
- Opening and closing differ on purpose. Opening fades the words in one after another with
  `revealText()`; closing slides the paragraph down under the shrinking panel with
  `concealText()`, so every word stays readable until it is clipped. Both are in
  `shared/motion/text-reveal.ts`.
- Reduced motion is checked in script, because a media query cannot switch off an
  animation started from script. The panel, the text and the trigger all check it.
