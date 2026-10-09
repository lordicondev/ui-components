# Input form

A message composer at the foot of the page, with a menu that opens upward from its plus
button and a submenu with a project search inside it.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                  | Watches                        | On                                         |
| ------------------------ | ------------------------------ | ------------------------------------------ |
| `hover`                  | the pointer and keyboard focus | the plus, the tools, every row icon        |
| `follow(data-focused)`   | `data-focused` on `.field`     | the magnifier in the project search        |
| `follow(data-clearable)` | `data-clearable` on `.field`   | the cross in the search, state `in-reveal` |

`hover` plays once when the pointer enters or keyboard focus lands; a hover mid-play is
dropped. The two field icons follow the attributes that `shared/ui/field.ts` writes.

## Notes

- The menu is a browser popover: `popovertarget` on the plus, `popover` on the panel.
  `shared/ui/popover.ts` places it, picks the direction from the room around the button
  (upward here, because the composer is at the bottom), unrolls the height and brings the
  rows in from the end nearest the button. `aria-expanded` on the plus is written by it too.
- The submenu is a second popover nested inside the first in the DOM. That is what makes
  the browser treat them as a pair: opening the inner does not close the outer, closing
  the outer takes the inner with it. The row that opens it has no `data-choose` and uses
  `popovertargetaction="show"`.
- The submenu opens on pointer enter and closes 150ms after the pointer has left both it
  and its row, unless focus is inside it. Strips down each side of the submenu
  (`::before`, `::after`) bridge the gap to the menu so the pointer is never over nothing.
- A `data-choose` row raises `popover-choose` and closes the whole chain; the demo only
  moves focus back to the composer.
- The project search filters rows on `input`. The clear button raises that event too.
- The microphone is wired to nothing.
