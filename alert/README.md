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

| Trigger                                           | Watches                             | On              |
| ------------------------------------------------- | ----------------------------------- | --------------- |
| `intro="hover-pinch, after=.alert"`, then `hover` | its card arriving, then the pointer | the status icon |
| `hover`                                           | the pointer on the dismiss button   | the cross       |

`intro` plays the icon once, when its card comes into view. `after=.alert` holds it until
the card's own entrance animation has finished, so the two do not compete. After that,
`hover` plays it again whenever the pointer enters the card.

## Notes

- The first page is plain markup, so it shows before the script runs; each icon holds an
  SVG of its first frame until it is ready. The deck's cards are cloned from a
  `<template>`. A kind is `data-kind` on the card: two colours on the card and one on the
  icon, which inherits `color` through `current-color`.
- The deck is CSS driven by `--depth`, written by `restack()`. The newest card is in front;
  the ones behind recede and fade. `translate` and `scale` are separate properties, so the
  arrival can climb over 220ms while popping to full size in 60ms.
- Dismissing sets `data-leaving`, restacks at once so the deck closes up under the card,
  waits for the leaving transitions, then removes it.
- The button queues four and then rests. Which kind comes next depends on which are
  already up, so the order stays the same however you dismiss.
- The dots are `shared/ui/pager.ts`.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/alert), where it sits
alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
