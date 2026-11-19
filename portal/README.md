# Portal

The site that presents the demos. It never builds a demo: everything it renders comes from
`src/_data/demos.json`, which `npm run prepare:portal` generates.

[Lume](https://lume.land) on Deno, Vento templates.

`src/images/` holds the logo (the Lottie file and its first frame as an SVG placeholder) and
`og.png`, the 1200×630 link preview. `src/thumbnails/` holds each demo's card video for the index,
`<slug>.mp4` (4:3, a seamless loop), and its first frame as `<slug>.webp`:

```sh
ffmpeg -i <slug>.mp4 -frames:v 1 -c:v libwebp -quality 90 <slug>.webp
```

A demo without a video gets its icon on the card instead.

`src/og/<slug>.png` is a demo's own link preview (1200×630); without one the page uses `og.png`.
`src/gifs/` holds the GIF next to each demo's "When to use" text, named in `demo.json`
(`whenToUse.gif`), and its first frame as a `.webp` of the same name, shown under reduced motion:

```sh
magick '<name>.gif[0]' -quality 85 <name>.webp
``` `src/favicon/` holds the favicons and the
web manifest; `src/favicon.ico` sits at the root, where browsers look for it. The icons, fonts and
tokens in `src/` are copied in from `shared/` by `prepare:portal`; edit them there.

## Running it

The portal needs the demos built first. From the repo root:

```sh
npm run build:demos && npm run prepare:portal
```

Then here:

```sh
deno task serve     # localhost:3000, live reload
deno task build     # _site/
deno task preview   # _site/ as built, at localhost:3000 (npm start at the root)
```

`deno task serve` reloads on any change to a template, stylesheet or the data file. It does not
rebuild the demos — after changing one, re-run the two commands above and the watcher picks the new
data up.

While working on a demo itself, `npm run dev -- <slug>` at the root is the faster loop.

## Hosting

`SITE_URL` is the only thing tying the output to a host, and it may name a subdirectory:

```sh
SITE_URL="https://ui-components.example.com/" deno task build
SITE_URL="https://example.com/ui-components/" deno task build
```

If it carries a pathname, Lume prefixes every internal link with it. Demos are built with a relative
base, so they need no rebuild to move.

Every page links to its own address as canonical, except the 404. A demo app links to its demo page
instead; that link is added to the portal's copy only, so exported code never points here.

## Layout

| Path                        | What it is                                                |
| --------------------------- | --------------------------------------------------------- |
| `_config.ts`                | Lume setup: highlighting, CSS, the demo-app copier        |
| `src/_includes/layouts/`    | `base.vto`, `demo.vto`                                    |
| `src/_components/`          | `card.vto` for the listing, `code.vto` for one code block |
| `src/demos/index.page.ts`   | One page per demo                                         |
| `src/_plugins/demo-apps.ts` | Copies `dist/demos/*/app` into `_site` after the build    |
| `src/styles/style.css`      | The portal's own styles                                   |

Generated and git-ignored, do not edit: `src/_data/`, `src/fonts/`, `src/styles/palette.css`,
`src/styles/tokens.css`, `_site/`.

## Conventions

`deno fmt` and `deno lint` cover this folder; the root's Prettier and ESLint skip it. A Vento
component is named after its file, so the name has to be a valid identifier — `card.vto`, not
`demo-card.vto`.
