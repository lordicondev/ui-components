# Loading list

The steps of a job, one under another. A step waits, spins while it runs, and ends with a
tick or a cross. The demo plays a made-up process: the fourth step fails, and Retry runs it
again.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                                 | Watches                  | On          |
| --------------------------------------- | ------------------------ | ----------- |
| `follow(data-status, active=loop-spin)` | `data-status` on `.step` | the spinner |
| `follow(data-status, done=in-reveal)`   | `data-status` on `.step` | the tick    |
| `follow(data-status, failed=in-reveal)` | `data-status` on `.step` | the cross   |

`data-status` is `pending`, `active`, `done` or `failed`. The spinner loops while the step
is active and rests on its default look otherwise. The tick and the cross draw in when the
step gets their value.

## Adapting it

Keep the markup and the stylesheet, and call `setStatus(step, status)` from your own code
when a step starts, ends or fails. Nothing else touches the icons. `run()` and the timers
are only there to have something to show.

## Notes

- The three icons share one cell. The stylesheet shows the one for the status; the others
  are `visibility: hidden`, not `display: none`, so they load with the page and play at
  once when they show.
- `setStatus()` also writes a word for screen readers into the row, and the list is
  `aria-live="polite"`, so each change is read out.
- Only the spinner is on screen at load, so only it has a placeholder.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/loading-list), where it sits
alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
