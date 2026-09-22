# Sidebar navigation

Seven destinations in a column. Each icon plays when you reach its row, with the pointer
or with the keyboard. `aria-current` says where you are; the stylesheet tints that row.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                      | On                                 |
| --------------------- | ---------------------------- | ---------------------------------- |
| `hover-focus`         | the pointer and the keyboard | the seven list icons, and the dots |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier                      |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal`       |

`hover-focus` is the built-in `hover` plus keyboard focus (`:focus-visible`), so tabbing
down the list plays the icons too. `target=".nav__item"` makes the whole row the hover
area, not just the icon.

## Notes

- Each icon plays its default state; the cog names `state="hover-mechanic"` instead,
  because a cog should turn.
- Hovering a row changes two custom properties, the fill and the icon colour. The label
  stays as it is. No transition: this is a state, not a movement.
- The current page has the same tint as hover. Clicking a link moves `aria-current` to it
  and removes it from the rest. The links have no pages behind them, so the click is
  prevented.
- The search field is the search bar demo's: `shared/ui/field.ts` and `field.css`, with the
  resting border made transparent because the card already has an edge.
- The sidebar has no natural height. It is drawn at 814px, never shorter than its contents
  and never taller than the screen; `min-height` beats `max-height` in CSS.
- The logo is an inline SVG and the avatar is a letter in a circle. Neither is an icon.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/sidebar-navigation), where it sits
alongside the other demos and the triggers it uses.
