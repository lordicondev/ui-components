# Dropdown menu

Five commands under a ⋮ button, in groups, with the last one in red. Reaching a row plays
its icon, with the pointer or with the arrow keys.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger               | Watches                        | On                 |
| --------------------- | ------------------------------ | ------------------ |
| `hover`               | the pointer and keyboard focus | the ⋮              |
| `follow(data-active)` | `data-active` on `.row`        | all five row icons |

`shared/ui/menu.ts` writes `data-active` on the row under the pointer and on the row the
arrow keys moved to, so the icon plays for either and never learns which.

## Notes

- The panel is a browser popover: `popovertarget` on the button, `popover` on the panel.
  `shared/ui/popover.ts` places it, picks the direction from the room around the button,
  animates the height and brings the rows and headings in one after another.
- `role="menu"` on the panel and `tabindex="-1"` on the rows make it one tab stop.
  `data-keys` on the panel makes it the controller for the arrow keys; `data-choose` marks
  a row that can be chosen and arrowed to.
- The delete row carries `data-danger`. One rule sets its colour and hover fill; the icon
  inherits the colour through `current-color`.
- Choosing a row closes the menu and raises `popover-choose`. Nothing else happens.
- No typeahead and no submenu.
