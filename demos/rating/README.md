# Rating

Five stars. Point at one and the stars light up towards it, one after another. Click and
they fill the same way.

Each star carries two attributes. `data-chosen` is the rating; the icon's shape follows
it. `data-lit` is the preview, what the pointer is offering; the colour follows it, and the
icon plays a nudge when it turns true.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                                        | Watches                        | On                             |
| ---------------------------------------------- | ------------------------------ | ------------------------------ |
| `preview-morph(data-chosen, preview=data-lit)` | `data-chosen` on `.star`       | the star, state `morph-select` |
|                                                | `data-lit` on the same `.star` | the star's default state       |

The one trigger in this project that is not built in: `shared/triggers/preview-morph.ts`,
on the package's `BaseTrigger` and `Morpher`. It morphs on the first attribute like
`follow`, and plays the icon's default state once when `preview` turns true. A star that is
already filled does not nudge. `main.ts` registers it with `defineElement({ triggers })`.

## Notes

- The stagger is in the state changes, not in the icons or the stylesheet: `spread()` sets
  one attribute every 80ms, and the colour and the nudge follow at once.
- Every run goes from the highest star down. Lighting up, that is the star under the
  pointer; emptying, that is the top of the old rating.
- Lighting and filling keep separate timer lists, so a pointer move cannot cancel the rest
  of a fill.
- Going dark is not staggered: the preview is withdrawn at once.
- The control is a real radio group. Arrow keys change the rating, and `change` fires for
  clicks and keys alike. Clicking the star that is the whole rating clears it, one tick
  later, because the label would re-check the radio otherwise.
- The stars load at once, not with `loading="interaction"`: choosing one star changes the
  ones before it, which nobody touched.
