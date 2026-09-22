# Alerts

Four kinds of alert. The status icon plays as its card arrives and again on hover.

The first page shows every kind at once. On the second, a button queues alerts into a
deck, and dismissing one frees its slot.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger            | Watches                                    | On              |
| ------------------ | ------------------------------------------ | --------------- |
| `arrival-hover`    | its card coming into view, and the pointer | the status icon |
| `hover` (built-in) | the pointer on the dismiss button          | the cross       |

`arrival-hover` waits for the card's own entrance animation to finish before it plays, so
the two do not compete. It watches for the card becoming visible, not only for it being
created, so paging back to the gallery plays the icons again.

## Notes

- Both pages are built from one `<template>` and one table of content, so a kind is
  described once. A kind is `data-kind` on the card: two colours on the card and one on
  the icon, which inherits `color` through `current-color`.
- The deck is CSS driven by `--depth`, written by `restack()`. The newest card is in front;
  the ones behind recede and fade. `translate` and `scale` are separate properties, so the
  arrival can climb over 220ms while popping to full size in 60ms.
- Dismissing sets `data-leaving`, restacks at once so the deck closes up under the card,
  waits for the leaving transitions, then removes it.
- The button queues four and then rests. Which kind comes next depends on which are
  already up, so the order stays the same however you dismiss.
- The dots are `shared/ui/pager.ts`.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/alert), where it sits
alongside the other demos and the triggers it uses.
