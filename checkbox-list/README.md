# Checkbox list

Native checkboxes with an icon standing in for the tick, in three styles.

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

## The three styles

The dots at the bottom swap between them. Nothing about the icon changes: the same
trigger, the same attribute, the same `state="morph-select"`.

| Style         | Input      | Icon                 |
| ------------- | ---------- | -------------------- |
| Square        | `checkbox` | `check-box-empty`    |
| Round         | `checkbox` | `check-circle-empty` |
| Single choice | `radio`    | `check-circle-empty` |

The third is a radio group, and it is the reason the wiring mirrors the **whole** group
rather than the input that changed. Selecting a radio clears its siblings silently — they
lose `checked` without an event of their own — so an input-by-input mirror would leave the
icons of the others still showing a tick. Checkboxes do not care either way, which is why
one loop covers both.

The single-choice style borrows the round icon for now; it will get its own once there is
one to use.

## Worth noticing

Hiding the input moves its focus ring with it, so the ring is drawn on the icon instead.

The icon inherits `color`, so every state it has is an ordinary CSS rule: resting, under
the pointer, chosen. Hovering shows the accent the row would take rather than a neutral
darker grey, which answers the question before the click does; the shape carries the
difference between wanting and having, an empty outline against a filled one.

None of it is transitioned. Colour here is a state, not a movement — the same call the
accordion's chevron makes.

Switching styles sets `hidden` on the groups that are not showing, which takes their
inputs out of the tab order and out of the form along with them. Three visible options at
a time, whichever style is on screen.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/checkbox-list), where it sits
alongside the other demos and the triggers it uses.
