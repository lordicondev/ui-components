# Button progress

Press the button and the work starts: the bar fills behind the words, the icon loops, the
label changes, and a receipt slides out underneath. All of it reads one attribute,
`data-stage`, which is `idle`, `busy` or `done`.

Two pages: the same button as a download and as an upload. They differ only in markup.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                                                 | Watches                    | On                          |
| ------------------------------------------------------- | -------------------------- | --------------------------- |
| `follow(data-stage, busy=loop-cycle, done=morph-check)` | `data-stage` on the button | the download icon           |
| `follow(data-shown)`                                    | `data-shown` on the toast  | the tick, state `in-reveal` |

A value map: `busy` loops `loop-cycle`, `done` plays the first half of `morph-check`, and
any other value (idle) plays the second half back. A finish that lands mid-loop waits for
the loop to come round, so the icon never stops halfway through a turn. The upload icon
maps `done` to its `morph-select`.

## Notes

- `data-progress` is the other half of the API: 0 to 100, written by `report()`. The
  stylesheet reads `--progress`, which `report()` keeps in step, because CSS cannot take a
  number out of an attribute.
- The bar is the full width of the button, scaled by `--progress`. Progress arrives in
  steps and a 220ms linear transition covers the distance in between. When done, the bar
  fades instead of running back.
- The three labels sit on a strip that only slides up. Going back to the first one, the
  strip slides on to a copy past the end and then jumps back with transitions off.
- The toast opens from the middle of the button to its left edge. `--toast-width` is
  measured once after the font loads, because width cannot transition to `auto`. Leaving
  is a fade and a drop; the `0s 150ms` transitions snap the box back once it is invisible.
- While busy the button is `disabled` and `aria-busy`. The toast is `role="status"`.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/button-progress), where it sits
alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
