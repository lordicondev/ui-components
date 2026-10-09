# Menu bar

A toolbar. The four tools on the left are a radio group: pick one and its icon morphs into
place while the previous one morphs back. The two list buttons are toggles that morph the
same way, one at a time or none. The last button is an action: its icon plays once on
press. Every button shows its name in a tooltip.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                 | Watches                    | On                            |
| ----------------------- | -------------------------- | ----------------------------- |
| `follow(data-selected)` | `data-selected` on `.tool` | the tool, its `morph-*` state |
| `follow(aria-pressed)`  | `aria-pressed` on `.list`  | the list, its `morph-*` state |
| `click`                 | a `click` on `.action`     | the button, its default state |

`click` plays the icon on every click, Enter and Space included.

## Notes

- The tools are a real radio group, hidden but intact: one tab stop, arrow keys move the
  choice, `change` fires for clicks and keys alike.
- A radio's `checked` is a property, and a MutationObserver cannot watch a property, so
  `follow()` copies it onto each label as `data-selected`. The icon and the stylesheet read
  that. Changing tool moves two icons at once, each watching its own label. That is why
  the tools and the list buttons load at once, while the action waits for the first
  pointer, click or focus (`loading="interaction"`): the button you leave changes without
  being touched.
- The list buttons need no copying: `aria-pressed` is an attribute, and the script only
  sets it. Pressing one releases the other, because a paragraph is one kind of list or
  none.
- The brush and the checklist use `state="morph-change"`, the rest `morph-select`. The
  names come from the icons; the markup is where they are set.
- Two icon files were hand-edited to add the `:0.5` ratio to their morph marker, which the
  trigger needs to split the animation into the way in and the way back.
  `shared/icons.json` records it.
- Tooltips are `shared/ui/tooltip.ts` and `tooltip.css`. The `.tooltip` span inside each
  button is its accessible name; the stylesheet keeps it at `opacity: 0` until `data-tip`
  is set. The first tooltip waits 400ms; once one has shown, the next opens at once.
  Keyboard focus shows it at once; Escape hides it.
