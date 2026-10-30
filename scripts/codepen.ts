/**
 * Packs every demo for CodePen and writes a list to publish them from. Not part of the
 * build: it is for whoever keeps the pens.
 *
 * Output: dist/codepen/index.html, the list, and dist/codepen/<slug>/index.html, each demo
 * as one page. Both open from disk.
 *
 * Usage: npm run codepen [-- <slug> ...]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { packDemo, prefill, standalonePage } from './lib/codepen.ts';
import { loadConfig, repoRoot } from './lib/config.ts';
import { listDemos, readManifest } from './lib/demos.ts';

const config = loadConfig();
const out = resolve(repoRoot, 'dist/codepen');

const requested = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const slugs = requested.length ? requested : listDemos();

function escape(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

const rows: string[] = [];
let published = 0;

for (const slug of slugs) {
    const manifest = readManifest(slug);
    const pen = await packDemo(slug, config);

    await mkdir(resolve(out, slug), { recursive: true });
    await writeFile(resolve(out, slug, 'index.html'), standalonePage(pen));

    if (manifest.codepen) published++;
    const status = manifest.codepen
        ? `<a href="${escape(manifest.codepen)}" target="_blank" rel="noopener">Published</a>`
        : '<span class="muted">Not published</span>';

    // The form opens a new, unsaved pen. Nothing is published until it is saved.
    rows.push(`<tr>
    <td><strong>${escape(manifest.title)}</strong><br /><code>${slug}</code></td>
    <td>${status}</td>
    <td><a href="${slug}/index.html" target="_blank">Preview</a></td>
    <td>
        <form action="https://codepen.io/pen/define" method="POST" target="_blank">
            <input type="hidden" name="data" value="${escape(prefill(pen, manifest))}" />
            <button type="submit">Open in CodePen</button>
        </form>
    </td>
</tr>`);

    console.log(`  ${slug.padEnd(20)} ${manifest.codepen ? 'published' : '-'}`);
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>CodePen · ${escape(config.title)}</title>
<style>
body { margin: 0 auto; max-width: 960px; padding: 32px 16px; background: #fff; color: #16181d;
    font: 15px/1.5 system-ui, sans-serif; }
h1 { margin: 0 0 8px; font-size: 24px; }
ol { padding-left: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 8px; border-bottom: 1px solid #dee1e6; text-align: left; vertical-align: middle; }
th { color: #767c89; font-size: 13px; font-weight: 600; }
code { color: #767c89; font-size: 13px; }
.muted { color: #9ba1ad; }
form { margin: 0; }
button { padding: 6px 12px; border: 1px solid #c3c7d0; border-radius: 6px; background: #fff;
    font: inherit; cursor: pointer; }
button:hover { border-color: #767c89; }
</style>
</head>
<body>
<h1>CodePen</h1>
<p>${published} of ${slugs.length} demos published.</p>
<ol>
    <li>Preview the demo and check that it works.</li>
    <li>Open in CodePen while signed in to the Lordicon account, then save.</li>
    <li>Put the pen's address in <code>"codepen"</code> in the demo's <code>demo.json</code>.</li>
</ol>
<p>To update a pen: open the demo in CodePen, copy the three panes into the published pen and save it.</p>
<table>
<thead><tr><th>Demo</th><th>Status</th><th></th><th></th></tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>
</body>
</html>
`;

await writeFile(resolve(out, 'index.html'), page);
console.log(
    `\n${published} of ${slugs.length} published · ${relative(process.cwd(), out)}/index.html`,
);
