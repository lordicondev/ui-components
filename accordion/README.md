# Accordion

A disclosure list where the chevron follows `aria-expanded` on the button it sits in.

This one is worth reading for what it does **not** do. `chevron-down` has no morph state —
it only points one way — so the 180° turn is a CSS transition, and the trigger contributes
the small nudge that acknowledges the click. Splitting it that way keeps each part doing
what it is good at.

The same `booleanMorph` implementation drives the password field's eye; only the attribute
differs.

## Run it

```sh
npm install
npm run dev
```

## Triggers

| Trigger          | Watches                             | On          |
| ---------------- | ----------------------------------- | ----------- |
| `expanded-morph` | `aria-expanded` on `.item__trigger` | the chevron |

## Worth noticing

The panel is a plain `hidden` toggle rather than an animated height. Animating height
honestly is a lot of work, and it is not what this demo is about.

---

Exported from [lordicondev/system-showcase](https://github.com/lordicondev/system-showcase/tree/main/demos/accordion), where it sits
alongside the other demos and the triggers it uses.
