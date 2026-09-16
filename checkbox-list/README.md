# Checkbox list

Native checkboxes with an icon standing in for the tick.

The input is still there — visually hidden, but focusable, tabbable, submitted with the
form and announced by assistive tech as the checkbox it is. Only its appearance is
replaced.

The interesting part is why the label carries `data-checked`. Ticking a box changes the
`checked` **property**, not the `checked` attribute, so there is nothing in the markup for
a trigger to observe. One line of wiring mirrors it into the DOM, and from there the icon
follows on its own. `aria-checked` would be wrong here: the native input already reports
its state, and duplicating it would announce the control twice.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                                           | On       |
| --------------- | ------------------------------------------------- | -------- |
| `checked-morph` | `data-checked` on `.option`, via `data-attribute` | the tick |

Same implementation as the password field's eye and the accordion's chevron — three
attributes, one behaviour.

## Worth noticing

Hiding the input moves its focus ring with it, so the ring is drawn on the icon instead.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/checkbox-list), where it sits
alongside the other demos and the triggers it uses.
