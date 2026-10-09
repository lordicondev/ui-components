# Search bar

A search field with two icons. The magnifier plays when the field gets focus. The cross
draws itself in once you have paused typing, and clears the field.

The field's behaviour is `shared/ui/field.ts` and its look is `shared/ui/field.css`; three
other demos use the same field. This demo is the plain case.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                  | Watches                      | On                           |
| ------------------------ | ---------------------------- | ---------------------------- |
| `follow(data-focused)`   | `data-focused` on `.field`   | the magnifier, default state |
| `follow(data-clearable)` | `data-clearable` on `.field` | the cross, state `in-reveal` |

Each plays once every time its attribute turns true. `in-reveal` is an entrance state,
which is why the cross draws itself rather than appearing.

## Notes

- `fields()` writes the attributes. `data-focused` uses `focusin`/`focusout` on the whole
  field, so moving focus to the clear button does not count as leaving.
- `data-clearable` turns true half a second after the typing stops, or when focus leaves
  with text in the field. Once true it stays until the field is empty, so the button does
  not move under the pointer.
- The cross leaves at once when the field is empty; only the arrival is animated.
- The clear button is hidden with `visibility`, so it keeps its box and the field does not
  change width. Clearing raises an `input` event by hand, for anything filtering on the
  field.
- The input is a real `<input type="search">` with a visually hidden label. The browser's
  own cancel button is turned off.
