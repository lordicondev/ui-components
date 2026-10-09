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
site.use(robots());
// No lastmod: a file's date says when it was checked out, not when the demo changed.
site.use(sitemap({ items: { lastmod: '' } }));

site.add('styles/style.css', '/style.css');
site.add('js/main.ts', '/main.js');
site.add('fonts');
site.add('icons');
site.add('images');
site.add('favicon');
site.add('favicon.ico');

export default site;
