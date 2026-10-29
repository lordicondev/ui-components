# Categories section

Three rows of category chips that scroll without end, the middle one the other way. A row
stops under the pointer so a chip can be clicked, and the chip's icon plays.

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

- A row's track holds the same chips three times. Sliding it left by one set brings it back
  to how it began, so it can loop. The CSS turns `--progress`, from 0 to 1, into that slide.
- `marquee()` from `shared/motion/marquee.ts` moves `--progress` once a frame. A round takes
  60s, so a longer row moves faster. In the CSS, `--progress` is where a row starts and
  `--direction: -1` turns it the other way.
- A row slows to a stop under the pointer or when a chip has keyboard focus, and picks up
  again afterwards. Focus left by a click does not hold it, and a tap does not stop it. A chip
  that keyboard focus lands on out of view slides into view.
- The copies are `aria-hidden` and their chips have `tabindex="-1"`, so a screen reader and
  the Tab key meet each chip once.
- The icons load when the pointer first reaches their chip (`loading="interaction"`), so the
  page fetches none of the 78 up front.
- With `prefers-reduced-motion` the rows stand still.
- Three copies fill 2400px, the width of `.marquee`. With fewer or narrower chips, add a copy
  and raise `--copies`. The ends fade with a gradient from the page colour, so keep the page
  behind the rows plain.
