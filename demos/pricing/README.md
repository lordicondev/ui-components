# Pricing

Three plans side by side, in four layouts. A plan's icon plays when the pointer enters its
card. The ticks are plain SVG.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                  | On              |
| ------- | ------------------------ | --------------- |
| `hover` | the pointer, on the card | the plan's icon |

`target=".plan"` makes the whole card the hover area. The icon plays its default state
once.

## Notes

- A plan's icon loads on the first pointer on its card (`loading="interaction"`) and holds
  an SVG of its first frame until then.
- The ticks are `<img>` of the same black SVG, coloured with a CSS filter:
  `--filter-ink-subtle`, and `--filter-accent-strong` on the featured card.
- The layouts are one card with a modifier on the row: `plans--raised` puts the icon on the
  top border, `plans--compact` drops it and puts name and price in one row. The badge is
  one more element in the card.
- Three columns from 920px, one below. The middle column is a little wider.
- The dots are `shared/ui/pager.ts`.
