/**
 * Writes everything the portal renders: the demo data as one JSON file, plus the tokens,
 * fonts and icons it shares with the demos. All of it is generated and git-ignored.
 *
 * Usage: npm run prepare:portal
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig, repoRoot } from './lib/config.ts';
import { demoDir, listDemos, readManifest, type Fragment } from './lib/demos.ts';
import { PORTAL_ICONS, iconLabel, iconUrl, readLockfile } from './lib/icons.ts';
import { demoLinks, repoUrl } from './lib/links.ts';
import { extractFragment, withoutMarkers } from './lib/regions.ts';
import { demoSources } from './lib/sources.ts';
import { toJavaScript } from './lib/transpile.ts';

type Code = { ts: string; js: string } | { code: string };

/** A stretch of code, or the mark for lines the fragment leaves out. */
type Segment = { code: string } | { skip: string };

/** What a fragment shows, and what Copy copies: the region with nothing left out. */
type FragmentCode =
    | { ts: Segment[]; js: Segment[]; tsFull: string; jsFull: string }
    | { code: Segment[]; full: string };

type PortalFragment = {
    id: string;
    title: string;
    note?: string;
    lang: string;
    /** Fragments always start folded. */
    collapsed: boolean;
} & FragmentCode;

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

/** The parts between skips, with a mark at each skip. */
function segments(parts: string[], skips: string[]): Segment[] {
    return parts.flatMap((code, index) =>
        index < skips.length ? [{ code }, { skip: skips[index] }] : [{ code }],
    );
}

/** Stands in for a skip while the TypeScript is turned into JavaScript. */
const SKIP_LINE = '// @@skip@@';

async function fragmentCode(
    parts: string[],
    skips: string[],
    full: string,
    filePath: string,
    lang: string,
): Promise<FragmentCode> {
    if (lang !== 'ts') return { code: segments(parts, skips), full };

    // The parts go through the compiler as one program, so each keeps its context.
    const joined = parts.join(`\n${SKIP_LINE}\n`);
    const jsParts = (await toJavaScript(joined, filePath))
        .split(/^[ \t]*\/\/ @@skip@@[ \t]*$/m)
        .map((part) => part.replace(/^\s*\n|\n\s*$/g, ''));

    return {
        ts: segments(parts, skips),
        js: segments(jsParts, skips),
        tsFull: full,
        jsFull: await toJavaScript(full, filePath),
    };
}

async function demoFragment(slug: string, fragment: Fragment): Promise<PortalFragment> {
    const filePath = resolve(demoDir(slug), fragment.file);
    const { parts, skips, full } = extractFragment(
        readFileSync(filePath, 'utf8'),
        fragment.region,
        `demos/${slug}/${fragment.file}`,
    );

    return {
        id: fragment.id,
        title: fragment.title,
        note: fragment.note,
        lang: fragment.lang,
        collapsed: true,
        ...(await fragmentCode(parts, skips, full, filePath, fragment.lang)),
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

/** The sections of the index, in order. A demo names its own in `group`. */
const GROUPS = [
    { id: 'buttons', title: 'Buttons' },
    { id: 'inputs', title: 'Forms and inputs' },
    { id: 'menus', title: 'Menus' },
    { id: 'navigation', title: 'Navigation' },
    { id: 'feedback', title: 'Feedback and progress' },
    { id: 'cards', title: 'Cards' },
    { id: 'text', title: 'Text' },
];

/**
 * A card on the index shows the demo's thumbnail video. Without one, it shows an icon: the
 * demo's first, except where another card shows that one already.
 */
const COVERS: Record<string, string> = {
    'command-menu': 'file-text',
    'input-form': 'microphone',
};

/** The video and its first frame, from portal/src/thumbnails/, if the demo has them. */
function thumbnail(slug: string) {
    const dir = resolve(repoRoot, 'portal/src/thumbnails');
    if (!existsSync(resolve(dir, `${slug}.mp4`))) return undefined;
    if (!existsSync(resolve(dir, `${slug}.webp`))) {
        throw new Error(`portal/src/thumbnails/${slug}.mp4 has no ${slug}.webp poster`);
    }
    return { video: `/thumbnails/${slug}.mp4`, poster: `/thumbnails/${slug}.webp` };
}

const demos = [];

for (const slug of listDemos()) {
    const { $schema: _schema, ...manifest } = readManifest(slug) as Record<string, unknown> &
        ReturnType<typeof readManifest>;

    // A group with no section would leave the demo off the index.
    if (!GROUPS.some((group) => group.id === manifest.group)) {
        throw new Error(`demos/${slug}/demo.json: no index section for group "${manifest.group}"`);
    }

    demos.push({
        ...manifest,
        stage: manifest.stage ?? 'large',
        icons: manifest.icons.map((alias) => {
            const entry = lockfile.get(alias);
            return {
                alias,
                id: entry ? iconLabel(entry) : 'unrecorded',
                url: entry ? iconUrl(entry) : undefined,
            };
        }),
        cover: COVERS[slug] ?? manifest.icons[0],
        thumbnail: thumbnail(slug),
        links: demoLinks(config, slug),
        fragments: await Promise.all(
            manifest.fragments.map((fragment) => demoFragment(slug, fragment)),
        ),
        ...(await files(slug)),
    });

    console.log(`  ${slug}`);
}

mkdirSync(resolve(repoRoot, 'portal/src/_data'), { recursive: true });
writeFileSync(
    target,
    `${JSON.stringify(
        {
            site: {
                title: config.title,
                description: config.description,
                version,
                standaloneBranch: config.repo.exportBranch,
                repo: repoUrl(config),
            },
            groups: GROUPS,
            demos,
        },
        null,
        2,
    )}\n`,
    'utf8',
);

console.log(`\nwrote ${target}`);

// The portal uses the same tokens as the demos. Its fonts sit next to theirs: Inter and the
// mono face are the portal's own.
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
