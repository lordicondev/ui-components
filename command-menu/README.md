# Command menu

A command palette. Open it with the button or ⌘K, type to filter, walk the rows with the
arrow keys while the caret stays in the field. Each row's icon plays as the cursor reaches
it.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                      | On                            |
| --------------------- | ---------------------------- | ----------------------------- |
| `active-attention`    | `data-active` on `.row`      | all seven row icons           |
| `focus-attention`     | `data-focused` on `.field`   | the magnifier                 |
| `clearable-attention` | `data-clearable` on `.field` | the cross, state `in-reveal`  |
| `shown-attention`     | `data-shown` on `.empty`     | the cross-circle, `in-reveal` |

All four are `booleanAttention`, one name per attribute.

## Notes

- The cursor is `data-active` on a row plus `aria-activedescendant` on the input, written
  by `shared/ui/menu.ts`. Focus stays in the field. The pointer writes the same attribute,
  so hover and arrow keys are one state, and the icon plays for either.
- `data-keys` on the input is what makes it the controller for the arrow keys. Home and End
  are left to the caret.
- The panel is a browser popover; `shared/ui/popover.ts` places it, animates it open and
  closes it when a `data-choose` row is chosen. The button carries `aria-keyshortcuts`.
- The filter sets `hidden` on rows. A group with no visible rows is hidden by CSS with
  `:has()`. The empty state needs `hidden` and `data-shown`, because its icon cannot
  animate out of `display: none`.
- The palette opens empty: the search is cleared on `beforetoggle`, before the panel is
  painted.
- The field is `shared/ui/field.ts` and `field.css`, with no border at rest because it
  sits on a panel that already has an edge. Focused, it lights up like every other field.
- Choosing a row only closes the palette. No fuzzy matching, no scrolling.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/command-menu), where it sits
alongside the other demos and the triggers it uses.
