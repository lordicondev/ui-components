# Mega menu

A site header whose Resources button opens a wide panel of links. A tile lights up and its
icon plays when the pointer is on it; the chevron on the button turns as the panel opens.

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

- The panel is a popover: `popovertarget` on the button opens and closes it, and the browser
  closes it on Escape or a click away. No script places it; the CSS puts it under the header,
  the full width of the screen.
- `main.ts` writes the panel's state onto the button as `aria-expanded`, so the chevron can
  follow it.
- The panel only clips; the sheet inside slides down from under the header in 340ms, and
  slides back up in 200ms. The tiles drop in a row at a time and keep settling for about
  half a second after the sheet has stopped. On closing they do not change: they leave with
  the sheet, in one movement. Only `transform` and `opacity` change, so nothing
  is repainted. It is CSS: `@starting-style`, and `allow-discrete` to keep the closing panel
  on screen. With
  `prefers-reduced-motion` it opens and closes at once.
- `will-change` keeps the sheet and the tiles on their own layers while the panel is open.
  Without it the browser moves them back into the page as each one stops, redraws them, and
  the panel flickers.
- The chevron has its own layer too, so its frames do not repaint the page.
- The tiles are links. The tile under the pointer or with keyboard focus gets the same fill.
- The icons are hidden until the panel opens, then load on the first pointer on their tile
  (`loading="interaction"`) and show an SVG of their first frame until then.
- From 1024px the tiles sit in three columns beside the featured card. Below that they take
  two columns with the card under them, and on a phone one column, with Product, Pricing and
  Log in left out of the header.
