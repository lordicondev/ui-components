# Categories section

Three rows of category chips that scroll without end, the middle one the other way. Point
at a row and it stops, so you can click a chip; the chip's icon plays.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches                  | On              |
| ------- | ------------------------ | --------------- |
| `hover` | the pointer, on the chip | the chip's icon |

`target=".chip"` makes the whole chip the hover area. The icon plays its default state once.

## Notes

- Each row holds its chips three times. `shared/motion/marquee.ts` slides it by one set and
  starts over, so the loop has no seam.
- A row stops under the pointer or when a chip has keyboard focus. Focus left by a click does
  not hold it, and touch never stops it.
- The copies are hidden from screen readers and the Tab key, so each chip is met once.
- With `prefers-reduced-motion` the rows stand still.
- Fewer or narrower chips: add a copy and raise `--copies` in the CSS.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/categories-section) 1.1.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
