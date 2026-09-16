# Alerts

Four alert kinds, each with an icon that holds still until its card has finished sliding
in — then plays once. Two animations in sequence read as one arrival; two at the same time
read as noise.

The card animates itself with plain CSS. The `after-enter` trigger waits on
`getAnimations()` for the element named by `target`, so it works with any entrance the
card happens to have, and with none at all.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger            | Watches                             | On              |
| ------------------ | ----------------------------------- | --------------- |
| `after-enter`      | the card's own animations finishing | the status icon |
| `hover` (built-in) | the dismiss button                  | the close icon  |

## Worth noticing

Entrance states start from an empty frame, so under `prefers-reduced-motion` the trigger
jumps the icon to its finished frame rather than leaving a blank space.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/alert), where it sits
alongside the other demos and the triggers it uses.
