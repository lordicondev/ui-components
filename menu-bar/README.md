# Menu bar

A toolbar. The four tools on the left are a radio group: pick one and its icon morphs into
place while the previous one morphs back. The three buttons on the right are actions: the
icon plays once on press. Every button shows its name in a tooltip.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                 | Watches                    | On                            |
| ----------------------- | -------------------------- | ----------------------------- |
| `follow(data-selected)` | `data-selected` on `.tool` | the tool, its `morph-*` state |
| `click`                 | a `click` on `.action`     | the button, its default state |

`click` plays the icon on every click, Enter and Space included.

## Notes

- The tools are a real radio group, hidden but intact: one tab stop, arrow keys move the
  choice, `change` fires for clicks and keys alike.
- A radio's `checked` is a property, and a MutationObserver cannot watch a property, so
  `follow()` copies it onto each label as `data-selected`. The icon and the stylesheet read
  that. Changing tool moves two icons at once, each watching its own label. That is why
  the tools load at once, while the actions wait for the first pointer, click or focus
  (`loading="interaction"`): the tool you leave changes without being touched.
- The brush uses `state="morph-change"`, the other tools `morph-select`. The names come
  from the icons; the markup is where they are set.
- Two icon files were hand-edited to add the `:0.5` ratio to their morph marker, which the
  trigger needs to split the animation into the way in and the way back.
  `shared/icons.json` records it.
- Tooltips are `shared/ui/tooltip.ts` and `tooltip.css`. The `.tooltip` span inside each
  button is its accessible name; the stylesheet keeps it at `opacity: 0` until `data-tip`
  is set. The first tooltip waits 400ms; once one has shown, the next opens at once.
  Keyboard focus shows it at once; Escape hides it.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/menu-bar), where it sits
alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
