# Pagination

Four pages and two step buttons. A frame marks the current page; when you pick another
one it stretches to reach it and then catches up with itself. Three rows show the same
control with three kinds of button.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger | Watches              | On                             |
| ------- | -------------------- | ------------------------------ |
| `click` | a `click` on `.step` | the arrow, state `hover-slide` |
| `click` | a `click` on `.step` | the chevron, its default state |

Plays the icon once per press. Which animation plays is the `state` attribute on the icon:
the arrow has a `hover-slide` state, the chevron uses its default.

## Notes

- `aria-current="page"` says which page is current, and is set on click. The frame is
  decoration and is `aria-hidden`.
- The frame is one element for the whole row, not a border on the current page: a border
  cannot travel between buttons. `place()` measures the target button and writes
  `--frame-left` and `--frame-right`; `data-going` says which way, and the stylesheet
  picks which edge moves first. The times and curves come from the reference recording.
- There is one arrow icon and two arrow buttons. The next button flips its icon with
  `scale: -1 1`, which flips the animation too.
- A step with nowhere to go is `disabled`. A disabled button fires no click, so its icon
  holds still without any extra code.
- The three rows are three separate controls and each remembers its own page. The dots
  are `shared/ui/pager.ts`. Every row is measured before the first one is hidden, because a
  hidden row has no widths to measure.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/pagination) 1.0.0,
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
