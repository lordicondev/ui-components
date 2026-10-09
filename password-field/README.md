# Password field

A password input with three icons, each following a different piece of state.

- The **lock** plays once when the field gets focus.
- The **eye** morphs open and closed with the reveal toggle's `aria-pressed`.
- The **warning circle** draws itself in when the error message appears, and nudges when
  the same message is raised again.

The demo's code sets `aria-pressed`, `data-focused` and `data-raised`; the icons react.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger                | Watches                            | On                             |
| ---------------------- | ---------------------------------- | ------------------------------ |
| `follow(aria-pressed)` | `aria-pressed` on `.field__toggle` | the eye, state `morph-close`   |
| `follow(data-focused)` | `data-focused` on `.field`         | the lock                       |
| `follow(data-raised)`  | `data-raised` on `.field__error`   | the warning, state `in-reveal` |

`data-raised` is a number, so `follow` counts rather than flips. Going from 0 to 1 is the
message appearing, and the icon plays its `in-reveal` entrance. Going up again while the
message is still on screen is the same message repeated: the icon plays its default state
as a nudge instead.

## Notes

- The only accepted password is `password`. The length rule is read from `minlength` on
  the input rather than through `checkValidity()`, because `tooShort` ignores a value the
  user has not edited, and this field arrives pre-filled.
- The hint answers a submit. A keystroke hides it, and the next Sign in asks again.
  `hideHint()` returns early when the hint is already gone or leaving, so holding
  Backspace does not restart the exit.
- Signing in again with the same error does not replay the arrival: the count goes up and
  only the icon nudges. While the arrival is still playing, nothing happens.
- The hint slides in from the right with its words arriving one by one
  (`shared/motion/text-reveal.ts`), and leaves by dropping and fading.
- Reduced motion is checked in script for the hint; the triggers check it themselves.

---

Exported from [lordicondev/ui-components](https://github.com/lordicondev/ui-components/tree/main/demos/password-field), where it sits
alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
