import demoData from '../_data/demos.json' with { type: 'json' };

type Helpers = { url: (path: string, absolute?: boolean) => string };

/** One page per demo. Everything on it comes from the JSON the Node build produced. */
export default function* (_data: unknown, { url }: Helpers) {
    for (const demo of demoData.demos) {
        yield {
            url: `/demos/${demo.slug}/`,
            layout: 'layouts/demo.vto',
            title: demo.title,
            description: demo.description,
            // Merged with the site's metas in _config.ts.
            metas: {
                ...(demo.pageTitle ? { title: demo.pageTitle } : {}),
                ...(demo.og ? { image: demo.og } : {}),
            },
            // For the sitemap; left out when the build has no git history.
            updated: demo.updated,
            demo,
        };
    }

    // The demos are listed on the home page, so /demos/ sends visitors and crawlers there.
    // A server redirect would be better; this works on any static host.
    const home = url('/', true);
    yield {
        url: '/demos/',
        unlisted: true,
        redirect: true,
        content: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${demoData.site.title}</title>
<link rel="canonical" href="${home}" />
<meta http-equiv="refresh" content="0; url=${home}" />
</head>
<body><p>The demos are on the <a href="${home}">home page</a>.</p></body>
</html>
`,
    };
}
