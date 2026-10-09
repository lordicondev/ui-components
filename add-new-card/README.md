# Add new card

A dashed tile with a plus that turns half a circle on hover. The smallest demo: the script
is `defineElement()` and nothing else.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                  | On       |
| ------- | ------------------------ | -------- |
| `hover` | the pointer, on the tile | the plus |

`target=".tile"` makes the whole tile the hover area. `state="hover-rotation"` turns the
plus half a circle, which ends where it started.

## Notes

- The hover state is five custom properties, set on `.tile` and again on `.tile:hover`.
  The icon's colour is one of them: it inherits `color` through `current-color`.
- No transition on the colours. The turning plus is the only thing with a duration.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/add-new-card) 1.0.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
