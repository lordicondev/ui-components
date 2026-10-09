# Sidebar navigation

Seven destinations in a column. Each icon plays when you reach its row, with the pointer
or with the keyboard. `aria-current` says where you are; the stylesheet tints that row.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                  | Watches                        | On                                 |
| ------------------------ | ------------------------------ | ---------------------------------- |
| `hover`                  | the pointer and keyboard focus | the seven list icons, and the dots |
| `follow(data-focused)`   | `data-focused` on `.field`     | the magnifier                      |
| `follow(data-clearable)` | `data-clearable` on `.field`   | the cross, state `in-reveal`       |

`hover` answers the pointer and keyboard focus (`:focus-visible`), so tabbing down the list
plays the icons too. `target=".nav__item"` makes the whole row the hover area, not just the
icon.

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

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/sidebar-navigation) 1.0.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
