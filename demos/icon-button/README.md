# Icon button

A bookmark button with no label. `aria-pressed` on the button is the whole state: the icon
morphs on it and the stylesheet colours by it. Saving shows a short toast under the button.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                | Watches                       | On                                 |
| ---------------------- | ----------------------------- | ---------------------------------- |
| `follow(aria-pressed)` | `aria-pressed` on `.bookmark` | the bookmark, state `morph-select` |

The morph state's first half plays on press and fills the bookmark; the second half plays
on un-press and empties it. A press that lands mid-animation reverses it in place.

## Notes

- The button has no visible text, so `aria-label="Favorite"` names it. A screen reader
  hears "Favorite, toggle button, pressed" after a press.
- The toast is `aria-hidden`: it says what `aria-pressed` already says. It is shown by
  `data-shown`, stays two seconds after saving, and hides at once on un-saving. A second
  save while it shows starts the two seconds again.
- The toast is positioned under the button, so showing it moves nothing.
- Under `prefers-reduced-motion` the toast appears and disappears without moving.
