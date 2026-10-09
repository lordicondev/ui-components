import type Site from 'lume/core/site.ts';

/**
 * Copies each built demo into the site: the app itself, and the zip beside it. The app gets
 * the site's favicon; the export stays without it.
 *
 * These are produced outside Lume by `npm run build:demos` and `npm run export`, and they
 * must not go through the page pipeline — a demo's index.html is an application, not a
 * template.
 */
export default function demoApps(from = '../dist/demos') {
    return (site: Site) => {
        site.addEventListener('afterBuild', async () => {
            const source = new URL(`${from}/`, import.meta.resolve('../../'));

            let demos: Deno.DirEntry[];
            try {
                demos = [...Deno.readDirSync(source)].filter((entry) => entry.isDirectory);
            } catch {
                console.warn('demo-apps: no built demos found — run `npm run build:demos` first');
                return;
            }

            const favicon = `<link rel="icon" href="${site.url('/favicon.ico')}" />`;

            for (const demo of demos) {
                await copyTree(
                    new URL(`${demo.name}/`, source),
                    site.dest(`demos/${demo.name}`),
                );

                const page = site.dest(`demos/${demo.name}/app/index.html`);
                const html = await Deno.readTextFile(page);
                await Deno.writeTextFile(page, html.replace('</head>', `${favicon}\n</head>`));
            }

            console.log(`demo-apps: copied ${demos.length} demo(s)`);
        });
    };
}

async function copyTree(from: URL, to: string) {
    await Deno.mkdir(to, { recursive: true });

    for (const entry of Deno.readDirSync(from)) {
        const source = new URL(entry.name, from);
        const target = `${to}/${entry.name}`;

        if (entry.isDirectory) {
            await copyTree(new URL(`${entry.name}/`, from), target);
        } else {
            await Deno.copyFile(source, target);
        }
    }
}
