# Password field

A password input whose two icons each follow a different piece of control state.

- The **lock** watches validity. It sits still until the field turns invalid, then flinches
  once and turns red — the colour is CSS, the movement is the trigger.
- The **eye** follows the reveal toggle's `aria-pressed`, morphing open ⇄ closed.
- The **warning circle** in the error message uses the built-in `in` trigger. No custom
  trigger is needed when the icon only has to play once as it appears.

Nothing in the demo's own code touches an icon. It flips `aria-pressed` and `aria-invalid`,
and the icons react.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger             | Watches                                                     | On                           |
| ------------------- | ----------------------------------------------------------- | ---------------------------- |
| `pressed-morph`     | `aria-pressed` on `.field__toggle`                          | the eye, state `morph-close` |
| `invalid-attention` | `aria-invalid` on `.field`, plus the native `invalid` event | the lock                     |
| `in` (built-in)     | the icon entering the viewport                              | the warning circle           |

## Worth noticing

`minlength` only reports `tooShort` for a value the user actually typed, so the field
validates on submit and then keeps itself honest on every keystroke.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/password-field), where it sits
alongside the other demos and the triggers it uses.
