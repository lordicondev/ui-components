# shared/

Code the demos have in common. A demo imports from here through the `@shared/` alias, and
the export copies exactly the files a demo reaches.

| Folder      | What is in it                                                                      |
| ----------- | ---------------------------------------------------------------------------------- |
| `triggers/` | Our own Lordicon trigger, for the one case the built-in ones do not cover          |
| `motion/`   | Page animation that is not an icon: text arriving word by word, reduced motion     |
| `ui/`       | Behaviour and look of controls several demos share: field, menu, popover, tooltip  |
| `styles/`   | Tokens, palette, fonts and the reset every demo starts from                        |
| `public/`   | The icons, as Lottie JSON with SVG placeholders; `icons.json` records their origin |

## Triggers

The demos use the triggers built into `@lordicon/element`: `hover`, `click` and above all
`follow`, which keeps an icon in step with an attribute on its target. See the package's
README for the list.

`triggers/preview-morph.ts` is the exception, for the rating: a morph on one attribute plus
a preview on a second. It extends the package's `BaseTrigger` and uses its `Morpher`, and
is registered where it is used:

```ts
defineElement({ triggers: { 'preview-morph': PreviewMorph } });
```

`triggers/testing/` holds a player stub for its test.

## ui/

`fields()`, `menus()`, `popovers()` and `tooltips()` each wire every matching element under
a root, once, and return nothing. `pager()` is demo scaffolding for demos with several
variants, not a control.
