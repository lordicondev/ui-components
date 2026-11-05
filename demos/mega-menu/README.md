# Mega menu

A site header with a Resources menu that opens a wide panel of links. Point at a tile and
it lights up and its icon plays.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                 | Watches                       | On                                   |
| ----------------------- | ----------------------------- | ------------------------------------ |
| `hover`                 | the pointer, on the tile      | the tile's icon                      |
| `follow(aria-expanded)` | `aria-expanded` on the button | the chevron, state `morph-direction` |

`target=".tile"` makes the whole tile the hover area. The chevron plays `morph-direction`
forwards to open and backwards to close.

## Notes

- The panel is a popover: `popovertarget` opens and closes it, and the browser closes it on
  Escape or a click outside. CSS places it under the header.
- `main.ts` copies the panel's state to the button as `aria-expanded`, and the chevron
  follows it.
- The panel slides down and the tiles drop in a row at a time; closing slides it back up.
  It is CSS only, and turns off with `prefers-reduced-motion`.
- On narrow screens the tiles go to two columns, then one.
