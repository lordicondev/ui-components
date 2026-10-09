# Deploying

The build is a folder of static files and assumes no particular host.

## Build it

The site lives at **https://components.lordicon.com/**. A release is built for that address:

```sh
npm ci
npm run build:release
```

`build:release` is `npm run build` with `SITE_URL` set to the address above. A plain
`npm run build` is for local work: it builds for `http://localhost:3000/`, which is wrong in
link previews and the sitemap of a public site. To build for another host, set `SITE_URL`
yourself:

```sh
SITE_URL="https://staging.example.com/" npm run build
```

`SITE_URL` is the only thing that ties the output to an address. If it carries a path
(`https://example.com/ui-components/`), every internal link is prefixed with it. Demos are
built with a relative base, so they work at any depth without a rebuild.

Use the real public address. Link previews (`og:image`, `og:url`), `sitemap.xml` and
`robots.txt` carry it in full, so a build for one address shows the wrong one anywhere else.

The result is `portal/_site/`. CI runs `build:release` and uploads the result as a build
artefact named `site`, ready to ship.

## Check the links

```sh
npm run check:links -- --release --external
```

Run on the built site. It follows every link, `#anchor`, sitemap entry and meta URL, and
fails on one that leads nowhere. `--release` also fails if the build is not for the address
above or mentions `localhost`. `--external` asks every outside link (GitHub, StackBlitz,
lordicon.com) for an answer.

CI runs it on every build without `--external`. Outside links are checked by hand before a
release: the GitHub links of a new demo only work once CI has published the standalone branch.

## Ship it

```sh
rsync -az --delete portal/_site/ deploy@server:/var/www/components/
```

`--delete`, because the site is generated in full every time.

Any static server will do. What it should know:

- A page is `<path>/index.html`, asked for as `<path>/`.
- A missing page gets `404.html`, with status 404.
- Only `demos/<slug>/app/assets/` has a content hash in its file names, so only that can be
  cached for good. Everything else keeps its name between releases and has to be
  revalidated.
- `.webmanifest` is `application/manifest+json`.

## In a subdirectory

Build with the path in `SITE_URL`, then put the files in a folder of the same name under the
server's root:

```sh
SITE_URL="https://example.com/ui-components/" npm run build
rsync -az --delete portal/_site/ deploy@server:/var/www/html/ui-components/
```

The folder name and the path in `SITE_URL` must match, and the server has to serve that
folder at that path.

Crawlers read `robots.txt` only at the root of a domain, so the one the build writes into
the folder is ignored. To list the pages, add its `Sitemap:` line to the domain's own
`robots.txt`.

Each demo is also served on its own at `/demos/<slug>/app/`, which is what the portal
embeds and what the full-screen link opens. Nothing there needs special handling.

## The standalone branch

Separate from the site, and needed for the StackBlitz and `giget` links on every demo
page: `npm run publish:export -- --push` puts the contents of `export/` at the root of
the `standalone` branch — one folder per demo, each running on its own. CI does this on
every push to `main`. The branch name comes from `site.config.json`.

That branch is a build artefact, rewritten in full each time. Nothing else should be
committed to it.
