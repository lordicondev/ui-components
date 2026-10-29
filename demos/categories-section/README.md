# Categories section

Three rows of category chips under a heading. The rows scroll without end: the first and the
third to the left, the middle one to the right. Each chip's icon plays when the pointer
enters the chip.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                  | On              |
| ------- | ------------------------ | --------------- |
| `hover` | the pointer, on the chip | the chip's icon |

`target=".chip"` makes the whole chip the hover area. The icon plays its default state once.

## Notes

- The scroll is CSS. A row's track holds the same set of chips three times and slides left by
  one set (`translateX(-100% / 3)`), then starts over. Only `transform` changes, so the
  browser moves it without repainting. The middle row has `animation-direction: reverse`.
- Every row takes 60 seconds a round, so the longer rows move faster. `--phase` sets how far
  into the round a row starts.
- Three copies cover screens up to about 2400px wide, which is the width of `.marquee`. Beyond
  that the rows end in a fade. Add a copy if your chips are fewer or narrower.
- The copies are `aria-hidden` and their chips have `tabindex="-1"`, so a screen reader and
  the Tab key meet each chip once.
- `glide()` from `shared/motion/glide.ts` changes the playback rate of each row's animation
  instead of pausing it. A row eases in over 1.6s on load, eases out to a stop in 0.7s under
  the pointer or when a chip has keyboard focus (`:focus-visible`), and takes 1s to get back
  to speed. A click leaves focus on the chip but does not stop the row. Touch is ignored, so
  the rows keep moving there. Change the times in the options of `glide()`.
- With `prefers-reduced-motion` the rows do not move and `glide()` does nothing.
- The icons load on the first pointer on their chip (`loading="interaction"`) and show an SVG
  of their first frame until then, white through `--filter-ink-inverse`. 78 `<lord-icon>`s on
  the page fetch nothing until you point at one.
- The chip colours are six custom properties: the brand colour and five Figma variables. The
  hover colour is the chip's colour mixed with 14% black. Chips are `<button>`s; make them
  links if they lead somewhere.
- The fade at the ends of the rows is two gradients from the page colour, so the page behind
  the rows has to be that colour.
