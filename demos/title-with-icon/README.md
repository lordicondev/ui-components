# Title with icon

A heading with icons between its words, in two versions: plain icons in the accent colour,
and white icons in a box. Each icon plays when the pointer is on it.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                         | On       |
| ------- | ------------------------------- | -------- |
| `hover` | the pointer, on the icon or box | the icon |

A plain icon needs no `target`: it is its own hover area. In a box, `target=".title__box"`
makes the whole box the hover area. The icon plays its default state once.

## Notes

- The icons are elements in the text, so the heading wraps like any text and an icon moves
  with its words. The same works in a paragraph, a caption or a logo.
- They are `aria-hidden`: a screen reader reads the heading as plain text.
- Sizes are in `em`. A plain icon is as tall as the text and a box as tall as the line, so
  both follow the font size, which goes from 40px down to 32px on small screens.
- A plain icon sits in the middle of the line (`vertical-align: middle`). A box fills the
  line, so it is aligned to its top and does not make the line taller.
- The icons load on the first pointer on them (`loading="interaction"`) and show an SVG of
  their first frame until then.
- The dots and arrows are `shared/ui/pager.ts`.
