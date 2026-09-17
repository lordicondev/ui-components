# Add new card

The smallest control in the showcase, and the one with the least code behind it: a dashed
tile that answers the pointer with a plus turning half a circle.

Nothing is wired up. The icon uses the element's built-in `hover` trigger, and the colours
are ordinary CSS — so this demo's script is `defineElement()` and nothing else.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger            | Watches                  | On       |
| ------------------ | ------------------------ | -------- |
| `hover` (built-in) | the pointer, on the tile | the plus |

`target=".tile"` is what makes the whole panel the hover area. Without it the icon would
watch itself, and the plus would only turn for a pointer that found the 24 pixels it
occupies — the label and the corners around it would be dead.

The state is `hover-rotation`. A plus has four-fold symmetry, so half a turn ends exactly
where it started: the icon can spin without needing an animation back.

## Worth noticing

The hover state is five custom properties, declared on the tile and redeclared on
`.tile:hover`. Every rule underneath reads from them, so the two blocks are the design's
two columns and nothing else in the stylesheet knows there is a hover state at all. Adding
a third state — pressed, say — is a third block of the same five names.

The plus is in that set. `current-color` makes a Lordicon icon inherit `color` like any
other element, so the mark recolours from the same block as the border and the label, in
the same instant, with no trigger involved and no colour written anywhere near the icon.

None of the five transitions. A colour here is not a movement — it says which tile the
pointer is on, and that answer should not arrive late. The turning plus is the only thing
with a duration, and the icon owns it.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/add-new-card), where it sits
alongside the other demos and the triggers it uses.
