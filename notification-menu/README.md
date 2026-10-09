# Notification menu

A bell with a count badge, and a panel that unrolls under it. The bell rings when the
count goes up and stays quiet when it goes down. The panel is the browser's popover with
an entrance animation on top.

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

- `setCount(n)` is the whole API. It writes `data-count`, which the icon watches, and
  draws the badge: a pop with overshoot on the way in, a quick shrink on the way out.
  Opening the menu sets the count to zero. The bell loads at once rather than on
  interaction: the count can change before anyone touches it.
- The panel is a browser popover: `popovertarget` on the bell, `popover` on the panel.
  `shared/ui/popover.ts` places it under the bell, writes `aria-expanded` on the bell,
  unrolls the height and brings each `data-rise` row in 40ms after the last.
- `popovers()` calls `onRise(row, delay)` for each row. The demo uses that delay to start
  the tint behind an unread row, so the row, its words and its tint move as one cascade.
- The tint is a `background-image` animated through `background-size`, because a colour
  has no width to grow. The stylesheet only says what colour it is.
- Leaving is CSS: `popover.css` uses `transition-behavior: allow-discrete` to keep the
  panel visible while it fades, because a closing popover leaves the top layer at once.
- `data-unread` on a row is the tint and the dot. The dot is there from the start.
- "Mark as read" is drawn and wired to nothing.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/notification-menu) 1.0.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
