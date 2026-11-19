import lume from 'lume/mod.ts';
import codeHighlight from 'lume/plugins/code_highlight.ts';
import esbuild from 'lume/plugins/esbuild.ts';
import lightningcss from 'lume/plugins/lightningcss.ts';
import metas from 'lume/plugins/metas.ts';
import robots from 'lume/plugins/robots.ts';
import sitemap from 'lume/plugins/sitemap.ts';
import demoApps from './src/_plugins/demo-apps.ts';

/**
 * Presentation only. The demos are built by the Node side of the repo; this reads the
 * JSON that build produced and copies the built apps in next to the pages.
 *
 * SITE_URL is the only thing that ties the output to a host. If it carries a pathname,
 * Lume prefixes every internal URL with it, so the site can live in a subdirectory.
 */
const site = lume({
    src: './src',
    location: new URL(Deno.env.get('SITE_URL') ?? 'http://localhost:3000/'),
});

site.use(
    codeHighlight({
        // The theme CSS is written into our own stylesheet at the placeholder below.
        theme: { name: 'github', cssFile: '/style.css', placeholder: '/* highlight */' },
    }),
);
site.use(lightningcss());
site.use(esbuild());
site.use(demoApps());

// Link previews, robots.txt and the sitemap. The sitemap adds its own line to robots.txt.
type SiteData = {
    title?: string;
    description?: string;
    demos: { site: { title: string; description: string } };
};
site.data('metas', {
    site: (data: SiteData) => data.demos.site.title,
    title: (data: SiteData) =>
        data.title ? `${data.title} — ${data.demos.site.title}` : data.demos.site.title,
    description: (data: SiteData) => data.description || data.demos.site.description,
    image: '/images/og.png',
    generator: false,
});
site.use(metas());
// The metas plugin cuts titles at 65 and descriptions at 155 characters. The home page
// sets its own text in the front matter, so put that back whole.
site.process(['.html'], (pages) => {
    for (const page of pages) {
        const own = page.data.metas as { title?: unknown; description?: unknown } | undefined;
        if (typeof own?.title !== 'string' || typeof own.description !== 'string') continue;

        const set = (selector: string, content: string) =>
            page.document?.querySelector(selector)?.setAttribute('content', content);
        set('meta[property="og:title"]', own.title);
        set('meta[property="og:description"]', own.description);
        set('meta[name="description"]', own.description);
    }
});
// A redirect page is not a page to preview: it keeps only its canonical link and refresh.
site.process(['.html'], (pages) => {
    for (const page of pages) {
        if (!page.data.redirect) continue;
        page.document
            ?.querySelectorAll(
                'meta[property^="og:"], meta[name^="twitter:"], meta[name="description"]',
            )
            .forEach((meta) => meta.remove());
    }
});
site.use(robots());
// lastmod is the date of the last commit to the demo, from prepare:portal. Not a file's
// date: that says when it was checked out, not when the demo changed.
site.use(
    sitemap({
        items: {
            lastmod: (data) => {
                const updated = data.updated ??
                    (data.url === '/' ? data.demos.site.updated : undefined);
                return (updated ? new Date(updated) : undefined) as Date;
            },
        },
    }),
);

site.add('styles/style.css', '/style.css');
site.add('js/main.ts', '/main.js');
site.add('fonts');
site.add('icons');
site.add('images');
site.add('thumbnails');
site.add('gifs');
site.add('og');
site.add('favicon');
site.add('favicon.ico');

export default site;
