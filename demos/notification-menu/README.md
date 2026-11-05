# Notification menu

A bell with a count badge, and a panel that unrolls under it. The count is the number of
unread rows in the panel, up to its four. The bell rings when the count goes up and stays
quiet when it goes down. The panel is the browser's popover with an entrance animation on
top.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger              | Watches                        | On                 |
| -------------------- | ------------------------------ | ------------------ |
| `follow(data-count)` | `data-count` on `.bell`        | the bell           |
| `hover`              | the pointer and keyboard focus | the four row icons |

`data-count` is a number, so `follow` counts. Up from zero plays the icon's `state` (here
its default); up again plays a nudge; down plays nothing. The count the page starts with
plays nothing either.

## Notes

- The unread rows are the state, and the count is how many there are. `setUnread(n)` makes
  the newest `n` rows unread; the field under the demo calls it, capped at the four rows.
- Opening the panel reads nothing, so the badge stays. Clicking a row reads that row; Mark
  as read reads them all, one after another, and is `aria-disabled` when there is nothing
  to read.
- `showCount()` writes `data-count`, which the icon watches, the bell's label, and the
  badge: a pop with overshoot on the way in, a quick shrink on the way out. The bell loads
  at once rather than on interaction: the count can change before anyone touches it.
- The panel is a browser popover. `shared/ui/popover.ts` places it under the bell, writes
  `aria-expanded`, unrolls the height and brings each `data-rise` row in 40ms apart.
- `popovers()` calls `onRise(row, delay)` for each row. The demo uses that delay to start
  the tint behind an unread row, so the row, its words and its tint move as one cascade.
- The tint is a `background-image` animated through `background-size`, because a colour
  has no width to grow. The stylesheet only says what colour it is.
- Leaving is CSS: `popover.css` uses `transition-behavior: allow-discrete` to keep the
  panel visible while it fades, because a closing popover leaves the top layer at once.
- `data-unread` on a row shows the tint and the dot. A row read with the panel open keeps
  its tint until the tint has unrolled off to the right.
