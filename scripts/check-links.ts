/**
 * Follows every link in the built site and fails if one leads nowhere. Run it after a build.
 * The site's own address is read from the build's sitemap, so it checks whatever was built.
 *
 *   npm run check:links                  # internal links and #anchors, offline
 *   npm run check:links -- --release     # also: built for the address in site.config.json
 *   npm run check:links -- --external    # also: every outside link answers
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { loadConfig, repoRoot } from './lib/config.ts';

const siteDir = resolve(repoRoot, 'portal/_site');
const release = process.argv.includes('--release');
const external = process.argv.includes('--external');

/** Files that can point somewhere. Scripts are left out: what they load is built at runtime. */
const LINKING = /\.(html|xml|txt|webmanifest|css)$/;

/** Attributes that carry a URL. Code samples are escaped, so they never match. */
const ATTRIBUTE = /\s(?:href|src|content)="([^"]+)"/g;
const CSS_URL = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
const SITEMAP_LOC = /<loc>([^<]+)<\/loc>/g;
const ROBOTS_SITEMAP = /^Sitemap:\s*(\S+)/gm;

/** Meta `content` values that are URLs; the rest are text. */
const META_URL = /^(?:https?:)?\/\//;

if (!existsSync(resolve(siteDir, 'sitemap.xml'))) {
    console.error('No built site in portal/_site. Run `npm run build` first.');
    process.exit(1);
}

const sitemap = readFileSync(resolve(siteDir, 'sitemap.xml'), 'utf8');
const base = new URL([...sitemap.matchAll(SITEMAP_LOC)][0]?.[1] ?? 'http://localhost:3000/');

const problems: string[] = [];
const outside = new Map<string, Set<string>>();
const ids = new Map<string, Set<string>>();

if (release) {
    const wanted = loadConfig().siteUrl;
    if (base.href !== wanted) {
        problems.push(
            `the build is for ${base.href}, not ${wanted}: run \`npm run build:release\``,
        );
    }
}

for (const file of walk(siteDir)) {
    const text = readFileSync(file, 'utf8');
    const page = pageUrl(file);
    const where = relative(siteDir, file);

    if (release && /localhost|127\.0\.0\.1/.test(text)) {
        problems.push(`${where}: mentions localhost`);
    }

    for (const raw of references(file, text)) {
        const ref = decodeEntities(raw);
        if (/^(?:mailto|tel|data|javascript):/.test(ref)) continue;

        const url = new URL(ref, page);

        if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
            if (url.protocol.startsWith('http')) {
                const pages = outside.get(url.href) ?? new Set();
                outside.set(url.href, pages.add(where));
            }
            continue;
        }

        const target = fileFor(url);
        if (!target) {
            problems.push(`${where}: ${ref} leads nowhere`);
            continue;
        }

        // A demo app is an application: a #link on its own page stands for a route the
        // script handles, as the sidebar's do.
        const ownRoute = target === file && /(^|\/)app\//.test(where);

        if (url.hash.length > 1 && target.endsWith('.html') && !ownRoute) {
            const id = decodeURIComponent(url.hash.slice(1));
            if (!idsIn(target).has(id)) problems.push(`${where}: ${ref} has no #${id} to land on`);
        }
    }
}

if (external) {
    const results = await mapLimited([...outside.keys()], 8, check);
    for (const [href, status] of results) {
        if (status === 'ok') continue;
        const pages = [...(outside.get(href) ?? [])];
        const shown = pages.slice(0, 3).join(', ') + (pages.length > 3 ? ', …' : '');
        problems.push(`${href} answers ${status} (on ${shown})`);
    }
}

const outsideNote = external ? 'checked' : 'not checked, add --external';
console.log(`${base.href}: ${outside.size} outside links (${outsideNote})`);

if (problems.length) {
    console.error(`\n${problems.length} broken:\n${problems.map((p) => `  ${p}`).join('\n')}`);
    process.exit(1);
}

console.log('every link leads somewhere');

function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = resolve(dir, entry.name);
        if (entry.isDirectory()) yield* walk(path);
        else if (LINKING.test(entry.name)) yield path;
    }
}

/** The address a built file is served at. */
function pageUrl(file: string): URL {
    const path = relative(siteDir, file).split('\\').join('/');
    return new URL(path.replace(/(^|\/)index\.html$/, '$1'), base);
}

/** The built file an address on this site serves, if any. */
function fileFor(url: URL): string | undefined {
    const path = resolve(siteDir, decodeURIComponent(url.pathname.slice(base.pathname.length)));
    if (!path.startsWith(siteDir)) return undefined;

    for (const candidate of [path, resolve(path, 'index.html')]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return undefined;
}

function references(file: string, text: string): string[] {
    if (file.endsWith('.webmanifest')) {
        const manifest = JSON.parse(text) as { start_url?: string; icons?: { src: string }[] };
        return [manifest.start_url ?? '', ...(manifest.icons ?? []).map((icon) => icon.src)].filter(
            Boolean,
        );
    }
    if (file.endsWith('.xml')) return [...text.matchAll(SITEMAP_LOC)].map((m) => m[1]);
    if (file.endsWith('.txt')) return [...text.matchAll(ROBOTS_SITEMAP)].map((m) => m[1]);
    if (file.endsWith('.css')) return [...text.matchAll(CSS_URL)].map((m) => m[1]);

    return [...text.matchAll(ATTRIBUTE)]
        .filter((m) => !m[0].trimStart().startsWith('content=') || META_URL.test(m[1]))
        .map((m) => m[1]);
}

function idsIn(file: string): Set<string> {
    let found = ids.get(file);
    if (!found) {
        const html = readFileSync(file, 'utf8');
        found = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
        ids.set(file, found);
    }
    return found;
}

function decodeEntities(text: string): string {
    return text
        .replaceAll('&amp;', '&')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

/** 'ok', or what went wrong. Some hosts refuse HEAD, so a refusal is retried with GET. */
async function check(href: string): Promise<string> {
    for (const method of ['HEAD', 'GET']) {
        try {
            const response = await fetch(href, {
                method,
                redirect: 'follow',
                signal: AbortSignal.timeout(15_000),
                headers: { 'user-agent': 'ui-components link check' },
            });
            await response.body?.cancel();
            if (response.ok) return 'ok';
            if (method === 'GET') return String(response.status);
        } catch (error) {
            if (method === 'GET') return (error as Error).message;
        }
    }
    return 'no answer';
}

async function mapLimited<T, R>(
    items: T[],
    limit: number,
    run: (item: T) => Promise<R>,
): Promise<[T, R][]> {
    const results: [T, R][] = [];
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const item = items[next++];
            results.push([item, await run(item)]);
        }
    });
    await Promise.all(workers);
    return results;
}
