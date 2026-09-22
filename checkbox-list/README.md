# Checkbox list

Native checkboxes with an icon in place of the tick, in three styles.

The input is still there: visually hidden, but focusable, submitted with the form and
announced as a checkbox. Only its appearance is replaced.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger         | Watches                                           | On       |
| --------------- | ------------------------------------------------- | -------- |
| `checked-morph` | `data-checked` on `.option`, via `data-attribute` | the tick |

`booleanMorph('aria-checked')`, pointed at `data-checked` with `data-attribute` on the
icon.

## Notes

- Ticking a box changes the `checked` property, not an attribute, so there is nothing for
  the trigger to watch. `mirror()` copies it onto the label as `data-checked`.
  `aria-checked` would be wrong here: the native input already reports its state.
- The whole group is mirrored on `change`, not only the input that changed, because a
  radio clears its siblings without an event for them.
- Three styles behind the dots: square checkboxes, round checkboxes, and a radio group.
  Same trigger, same attribute, same `state="morph-select"`; only the icon file differs.
- The input is invisible, so its focus ring is drawn on the icon, rounded to match
  `data-shape` on the group.
- Colour is a plain CSS rule per state, with no transition. Hovering shows the accent the
  row would take.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/checkbox-list), where it sits
alongside the other demos and the triggers it uses.
