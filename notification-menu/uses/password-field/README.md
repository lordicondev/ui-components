# Password field

A password input whose three icons each follow a different piece of control state.

- The **lock** answers focus. Arriving in the field is the event; typing in it is not, so
  it plays once as you enter and then leaves you alone. It keeps its resting grey even when
  the field is wrong — the border and the message already say so.
- The **eye** follows the reveal toggle's `aria-pressed`, morphing open ⇄ closed.
- The **warning circle** draws itself in as the hint arrives, playing the icon's own
  `in-reveal` state.

Nothing in the demo's own code touches an icon. It flips `aria-pressed`, `data-focused` and
`data-shown`, and the icons react.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger            | Watches                            | On                             |
| ------------------ | ---------------------------------- | ------------------------------ |
| `pressed-morph`    | `aria-pressed` on `.field__toggle` | the eye, state `morph-close`   |
| `focus-attention`  | `data-focused` on `.field`         | the lock                       |
| `raised-attention` | `data-raised` on `.field__error`   | the warning, state `in-reveal` |

`focus-attention` is `booleanAttention`: it plays the icon once each time its attribute
turns true — a reaction rather than a state, which is the whole difference between it and
`booleanMorph`.

`raised-attention` counts instead of flipping, because the hint has two arrivals to tell
apart. `data-raised` going up from zero is the message appearing, and the icon plays the
`in-reveal` its markup asks for. Going up again while the message is still on screen is the
same message repeated: the icon drops to its default state and nudges instead. The count is
what makes those distinguishable — a boolean that is already true has nothing left to say.

## Worth noticing

`minlength` only reports `tooShort` for a value the user has actually edited. This field
arrives pre-filled with a seven-character password, so `checkValidity()` calls it valid
until someone touches it — which is why the length is measured against the attribute
instead of asked of the browser. The attribute still owns the number.

The hint answers a question asked at submit, so it stops being an answer the moment the
value changes: a keystroke dismisses it, and the next Sign in asks again. Dismissing is
idempotent — holding Backspace asks for it once per character, and the exit has to run
once rather than restart under each one.

Signing in again while the hint is up does not replay its arrival: the hint stays where it
is and only its icon answers. Leaning on the button does not get you more than that. While
the arrival is still running there is no nudge at all — it is already saying what a nudge
would say — and a nudge that is still playing is left to finish rather than cut off and
started again. Both drops live in the trigger, which is the only thing that knows whether
the icon is still busy.

The hint does not arrive and leave by the same route. It slides in from the right while its
icon draws itself and its words land one after another, on the same wave the accordion
opens with. It leaves by dropping and fading, all at once. Arriving is something to read;
leaving is something to get out of the way.
