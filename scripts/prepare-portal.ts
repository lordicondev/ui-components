/**
 * Writes everything the portal renders: the demo data as one JSON file, plus the tokens,
 * fonts and icons it shares with the demos. All of it is generated and git-ignored.
 *
 * Usage: npm run prepare:portal
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig, repoRoot } from './lib/config.ts';
import { demoDir, listDemos, readManifest, type Fragment } from './lib/demos.ts';
import { PORTAL_ICONS, iconLabel, iconUrl, readLockfile } from './lib/icons.ts';
import { demoLinks, repoUrl } from './lib/links.ts';
import { extractRegion, withoutMarkers } from './lib/regions.ts';
import { demoSources } from './lib/sources.ts';
import { toJavaScript } from './lib/transpile.ts';

type Code = { ts: string; js: string } | { code: string };

type PortalFragment = {
    id: string;
    title: string;
    note?: string;
    lang: string;
    /** Fragments always start folded. */
    collapsed: boolean;
} & Code;

const target = resolve(repoRoot, 'portal/src/_data/demos.json');
const config = loadConfig();
const { version } = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8')) as {
    version: string;
};
const lockfile = new Map(readLockfile().map((entry) => [entry.alias, entry]));

async function code(source: string, filePath: string, lang: string): Promise<Code> {
    if (lang !== 'ts') return { code: source };
    return { ts: source, js: await toJavaScript(source, filePath) };
}

async function demoFragment(slug: string, fragment: Fragment): Promise<PortalFragment> {
    const filePath = resolve(demoDir(slug), fragment.file);
    const source = extractRegion(
        readFileSync(filePath, 'utf8'),
        fragment.region,
        `demos/${slug}/${fragment.file}`,
        fragment.lang,
    );

    return {
        id: fragment.id,
        title: fragment.title,
        note: fragment.note,
        lang: fragment.lang,
        collapsed: true,
        ...(await code(source, filePath, fragment.lang)),
    };
}

/** Whole files: the demo's own, then the shared ones it imports. Paths are the export's. */
async function files(slug: string) {
    const manifest = readManifest(slug);
    const fragmentFiles = manifest.fragments.map((fragment) => fragment.file);

    const listed = await Promise.all(
        demoSources(slug, fragmentFiles).map(async ({ path, exportPath, lang, shared }) => {
            const source = withoutMarkers(readFileSync(path, 'utf8'));

            return {
                path: exportPath,
                lang,
                shared,
                lines: source.trimEnd().split('\n').length,
                ...(await code(source, path, lang)),
            };
        }),
    );

    return {
        own: listed.filter((file) => !file.shared),
        imported: listed.filter((file) => file.shared),
    };
}

/**
 * The icon each card on the index shows is the demo's first, except where another card
 * shows that one already.
 */
const COVERS: Record<string, string> = {
    'command-menu': 'file-text',
    'input-form': 'microphone',
};

const demos = [];

for (const slug of listDemos()) {
    const { $schema: _schema, ...manifest } = readManifest(slug) as Record<string, unknown> &
        ReturnType<typeof readManifest>;

    demos.push({
        ...manifest,
        icons: manifest.icons.map((alias) => {
            const entry = lockfile.get(alias);
            return {
                alias,
                id: entry ? iconLabel(entry) : 'unrecorded',
                url: entry ? iconUrl(entry) : undefined,
            };
        }),
        cover: COVERS[slug] ?? manifest.icons[0],
        links: demoLinks(config, slug),
        fragments: await Promise.all(
            manifest.fragments.map((fragment) => demoFragment(slug, fragment)),
        ),
        ...(await files(slug)),
    });

    console.log(`  ${slug}`);
}

/** Every tag a demo can be filtered by. Each one is a chip on the index. */
const tags = [...new Set(demos.flatMap((demo) => demo.tags))].sort();

mkdirSync(resolve(repoRoot, 'portal/src/_data'), { recursive: true });
writeFileSync(
    target,
    `${JSON.stringify(
        {
            site: {
                title: config.title,
                description: config.description,
                version,
                tags,
                standaloneBranch: config.repo.exportBranch,
                repo: repoUrl(config),
            },
            demos,
        },
        null,
        2,
    )}\n`,
    'utf8',
);

console.log(`\nwrote ${target}`);

// The portal uses the same tokens and typeface as the demos.
for (const [from, to] of [
    ['shared/styles/palette.css', 'portal/src/styles/palette.css'],
    ['shared/styles/tokens.css', 'portal/src/styles/tokens.css'],
    ['shared/fonts', 'portal/src/fonts'],
] as const) {
    mkdirSync(resolve(repoRoot, to, '..'), { recursive: true });
    cpSync(resolve(repoRoot, from), resolve(repoRoot, to), { recursive: true });
}

// The portal's chrome uses a couple of icons of its own.
mkdirSync(resolve(repoRoot, 'portal/src/icons'), { recursive: true });
for (const alias of PORTAL_ICONS) {
    for (const file of [`${alias}.json`, `${alias}.svg`]) {
        cpSync(
            resolve(repoRoot, 'shared/public/icons', file),
            resolve(repoRoot, 'portal/src/icons', file),
        );
    }
}

console.log('copied shared tokens, fonts and portal icons');
