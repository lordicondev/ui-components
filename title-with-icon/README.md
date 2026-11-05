# Title with icon

A heading with icons between its words, in two versions: plain icons in the accent colour,
and white icons in a box. The icons play by themselves, one after another.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                                | Watches | On        |
| -------------------------------------- | ------- | --------- |
| `sequence(play, wait 4500)`            | a timer | the email |
| `sequence(wait 1500, play, wait 3000)` | a timer | the graph |
| `sequence(wait 3500, play, wait 1000)` | a timer | the medal |

Each script lasts 5.5 s and repeats. `play` plays the icon's default state, 1 s long, so the
icons play one after another, with a 0.5 s pause after the email and 1 s after the graph
and the medal. For an icon of another length, change its waits so the script still lasts
5.5 s.

## Notes

- The icons sit in the text, so the heading wraps like any text and each icon stays with
  its words. It works the same in a paragraph or a caption.
- Sizes are in `em`, so the icons follow the font size.
- The icons are `aria-hidden`: a screen reader reads plain text.
- When the viewer asks for less motion, the icons stay still.
- The dots and arrows are `shared/ui/pager.ts`.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/title-with-icon) 1.1.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
