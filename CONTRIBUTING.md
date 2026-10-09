# Contributing

How the repo is built and how a demo is added. For what the project is, see
[README.md](README.md).

## Getting started

Node 24+ and Deno 2.

```sh
npm install
npm run dev -- password-field   # Vite dev server for one demo
npm test
npm run check                   # types, lint, icons, manifests, imports, fragments
npm run build                   # demos, exports, portal data, then the portal
npm run build:release           # the same, for https://components.lordicon.com/
npm run check:links             # every link in the built site; see docs/deploy.md
npm start                       # the built portal at localhost:3000
```

`npm run dev:portal` serves the portal with live reload instead. See
[portal/README.md](portal/README.md) and [docs/deploy.md](docs/deploy.md).

`@lordicon/element` comes from npm, for Node and for the portal's Deno build alike. Keep the
version in `package.json` and `portal/deno.json` in step.

## Layout

| Path               | What it is                                                                           |
| ------------------ | ------------------------------------------------------------------------------------ |
| `demos/<slug>/`    | One demo: `index.html`, `main.ts`, `<slug>.css`, `README.md`, `demo.json`            |
| `shared/`          | Triggers, motion, shared UI, styles, icons. See [shared/README.md](shared/README.md) |
| `scripts/`         | Build, export, portal data and check scripts                                         |
| `portal/`          | The Lume site                                                                        |
| `site.config.json` | Project name and the addresses derived from it                                       |

Each demo is its own Vite project; `scripts/lib/vite-config.ts` builds one config per demo.

## Adding a demo

1. Create `demos/<slug>/` with `index.html`, `main.ts`, `<slug>.css` and `README.md`.
2. In `main.ts`, call `defineElement()` in the `setup` region; other imports go below it.
   What each icon does is its `trigger` attribute in the markup.
3. Write `demo.json`. It points at `schemas/demo.schema.json`, so an editor helps.
4. Mark the parts worth reading with `#region` / `#endregion` and list them as
   `fragments`. Every region must be a fragment. `#skip` … `#endskip` inside a region
   collapses a stretch to an ellipsis.
5. Declare the icons by alias, put the Lottie JSON in `shared/public/icons/`, then run
   `npm run check:icons -- --record`.
6. `npm run check && npm test`.

## Conventions

**Code**

- TypeScript that is still readable JavaScript once the types are stripped
  (`erasableSyntaxOnly`): no enums, namespaces or parameter properties. The portal's JS
  view is made by stripping types.
- Icon behaviour lives in a trigger, never in a demo. Use a built-in one (`follow`,
  `hover`, `click`); write your own on `BaseTrigger` only when none fits. A trigger reads
  the target's attributes or native events and knows nothing about the application.
- A demo imports its own files and `shared/`, nothing else. `check:sources` follows the
  imports; what it finds is what the portal lists and the export ships.
- Icons carry the `current-color` attribute and inherit `color`.
- An icon visible before any interaction holds its placeholder:
  `<lord-icon …><img alt="" src="icons/star.svg" /></lord-icon>`. The SVG is black; set
  `--icon-filter: var(--filter-…)` next to `color` in every rule that can match at load.
  Hover rules need none: the icon is ready by then.
- Such an icon loads on the first pointer, click or focus on its target
  (`loading="interaction"`), unless something else changes it: another control (the rating,
  the menu-bar tools), a timer (the bell), or an `intro`. Those load at once.
- Nothing moves when the script runs: pages a script switches between ship `hidden`, and
  markup that could be static is in the HTML.
- Controls carry their own ARIA state, work from the keyboard and respect
  `prefers-reduced-motion`.

**Comments and docs**, written for someone copying the code into their own project

- A comment says what the code does, or why when that is not obvious. It does not argue
  with other files, list what the code does not do, or restate the line below.
- A module docblock: what it does, what it reads, plus an example. For a trigger, how to
  register it.
  Inline comments: one or two lines. Plain sentences, no metaphors.
- A demo `README.md` ships with the export and is not shown in the portal. It is short:
  what the demo is, how to run it, the triggers and attributes, a few notes. It does not
  document `shared/` modules.

**Fragments**, the portal's "How it works"

Four to seven per demo, in reading order: `setup`, the markup, the code that sets the
state, then what makes this demo different. Titles say what the reader will see.
Fragments come from the demo's own files; `shared/` code is listed whole under "What it
imports".

## Icons

`shared/public/icons/` holds only the icons the demos use, as Lottie JSON. A demo declares
them by alias: `lock` is `system-outline-94-lock`, `lock-solid` is `system-solid-94-lock`.
`shared/icons.json` records where each came from. Swapping a file by hand is normal:

```sh
cp better-lock.json shared/public/icons/lock.json
npm run check:icons -- --record
```

Each icon has black SVG placeholders next to its JSON:

- `<alias>.svg`, the first frame of its default state: what the icon shows at rest;
- `<alias>.<state>.svg`, the second look of a morph, only where a demo starts in it
  (`star.morph-select.svg` for a filled star).

They are rendered with `@lordicon/renderer`, then run through SVGO:

```js
render(icon, { format: 'svg', sequence: 'show start', colors: { primary: '#000000' } });
render(icon, {
    format: 'svg',
    sequence: 'show morph-select there',
    colors: { primary: '#000000' },
});
```

Render them again after swapping an icon's JSON. `check:icons` fails when a demo shows a
placeholder that is missing, and warns about an icon without one.

## Deploying

The build is a folder of static files; [docs/deploy.md](docs/deploy.md) has how to build,
check and ship it. CI runs the checks and tests on every push, and on `main` it
also installs and builds every export.
