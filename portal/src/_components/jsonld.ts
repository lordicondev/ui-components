/**
 * Structured data for search engines: the site on the home page; on a demo page the demo
 * as source code, and the breadcrumb back home. URLs come in absolute, from the template.
 */
type Site = { title: string; description: string };
type Demo = { title: string; description: string; links: { github: string } };

type Props = { site: Site; home: string; page: string; demo?: Demo };

// Lordicon is described on its own site; here it is only named, without UTM parameters.
const publisher = { '@type': 'Organization', name: 'Lordicon', url: 'https://lordicon.com/' };

export default function ({ site, home, page, demo }: Props) {
    const website = {
        '@type': 'WebSite',
        '@id': `${home}#website`,
        name: site.title,
        url: home,
        description: site.description,
        publisher,
    };

    const graph = demo
        ? [
            {
                '@type': 'SoftwareSourceCode',
                name: `${demo.title} component`,
                description: demo.description,
                url: page,
                codeRepository: demo.links.github,
                programmingLanguage: ['HTML', 'CSS', 'TypeScript'],
                license: 'https://opensource.org/license/mit',
                isPartOf: { '@id': website['@id'] },
                publisher,
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: site.title, item: home },
                    { '@type': 'ListItem', position: 2, name: demo.title, item: page },
                ],
            },
        ]
        : [website];

    // "<" escaped, so no text in the data can close the script element.
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll(
        '<',
        '\\u003c',
    );
    return `<script type="application/ld+json">${json}</script>`;
}
