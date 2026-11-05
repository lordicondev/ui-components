import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './config.ts';
import { demoDir, readManifest } from './demos.ts';
import { demoSources, type SourceFile } from './sources.ts';

/**
 * Where an icon in shared/public/icons came from.
 *
 * `portal` — pulled from the Lordicon icon set as published.
 * `manual` — put there by hand, and left alone by anything that syncs icons.
 */
export type IconSource = 'portal' | 'manual';

export type IconEntry = {
    alias: string;
    source: IconSource;
    sha256: string;
    bytes: number;
    /** Present for portal icons; absent for hand-placed ones. */
    family?: string;
    style?: string;
    name?: string;
    index?: number;
    states?: number;
    note?: string;
};

export type Lockfile = { comment: string; icons: IconEntry[] };

/**
 * Icons the portal itself uses in its chrome. They belong to no demo, but they come from
 * the same set and are checked and fetched the same way.
 */
export const PORTAL_ICONS = [
    'system-outline-751-arrow-out-square',
    'system-regular-379-menu-hamburger',
    'system-outline-38-cross',
    'system-outline-31-chevron-right',
    'system-outline-367-info-circle',
];

/**
 * Icons the arrows of shared/ui/pager.ts use. A demo with a pager loads them without
 * declaring them: they switch between the demo's parts and are not part of its component,
 * so the portal does not list them.
 */
export const PAGER_ICONS = ['system-outline-32-chevron-left'];

/** The icons a demo ships: the ones it declares, plus the pager's if it imports the pager. */
export function shippedIcons(declared: string[], files: SourceFile[]): string[] {
    const paged = files.some((file) => file.exportPath === 'shared/ui/pager.ts');
    return [...new Set([...declared, ...(paged ? PAGER_ICONS : [])])];
}

export const iconsDir = resolve(repoRoot, 'shared/public/icons');

/**
 * The files from shared/public/icons a demo ships: its icons and the placeholders its markup
 * shows. The portal build and the export copy these and nothing else.
 */
export function demoIconFiles(slug: string): string[] {
    const manifest = readManifest(slug);
    const sources = demoSources(
        slug,
        manifest.fragments.map((fragment) => fragment.file),
    );
    const html = readFileSync(resolve(demoDir(slug), 'index.html'), 'utf8');

    return [
        ...shippedIcons(manifest.icons, sources).map((alias) => `${alias}.json`),
        ...placeholdersIn(html).map((name) => `${name}.svg`),
    ];
}

/**
 * The icons a demo's files name as `icons/<alias>.json` or `.svg`. A name built at run time
 * is not seen.
 */
export function referencedIcons(files: SourceFile[]): string[] {
    const aliases = files.flatMap((file) =>
        [
            ...readFileSync(file.path, 'utf8').matchAll(
                /icons\/([a-z0-9-]+)(?:\.[a-z0-9-]+)?\.(?:json|svg)/g,
            ),
        ].map((match) => match[1]),
    );
    return [...new Set(aliases)].sort();
}
export const lockfilePath = resolve(repoRoot, 'shared/icons.json');

export const LOCKFILE_COMMENT =
    'Where each icon came from. Portal entries track the published Lordicon icon; manual ' +
    'entries were placed by hand and are never overwritten. Run `npm run check:icons -- --record` after editing a file.';

export function readLockfile(): IconEntry[] {
    const { icons } = JSON.parse(readFileSync(lockfilePath, 'utf8')) as Lockfile;
    return icons;
}

export function writeLockfile(icons: IconEntry[]): void {
    const sorted = [...icons].sort((a, b) => a.alias.localeCompare(b.alias));
    const body = JSON.stringify({ comment: LOCKFILE_COMMENT, icons: sorted }, null, 4);
    writeFileSync(lockfilePath, `${body}\n`, 'utf8');
}

export function fingerprint(content: string): Pick<IconEntry, 'sha256' | 'bytes'> {
    return {
        sha256: createHash('sha256').update(content).digest('hex'),
        bytes: Buffer.byteLength(content),
    };
}

/** Aliases actually present on disk. */
export function iconFiles(): string[] {
    return readdirSync(iconsDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace(/\.json$/, ''))
        .sort();
}

/**
 * The placeholder SVGs a page shows inside its icons, as `<alias>` (the rest frame) or
 * `<alias>.<state>` (a morph's second look), without `.svg`.
 */
export function placeholdersIn(html: string): string[] {
    const names = [...html.matchAll(/src="icons\/([^"/]+)\.svg"/g)].map((match) => match[1]);
    return [...new Set(names)].sort();
}

/** The icon a placeholder is drawn from: `system-outline-237-star.morph-select` is `system-outline-237-star`. */
export function placeholderAlias(name: string): string {
    return name.split('.')[0];
}

/** A cheap sanity check that a file really is a Lottie animation. */
export function looksLikeLottie(content: string): boolean {
    try {
        const data = JSON.parse(content) as Record<string, unknown>;
        return (
            typeof data.v === 'string' && Array.isArray(data.layers) && typeof data.op === 'number'
        );
    } catch {
        return false;
    }
}

/** The path of the icon's page on lordicon.com, for icons we know the origin of. */
export function iconPath(entry: IconEntry): string | undefined {
    if (!entry.name) return undefined;
    return `/icons/${entry.family}/${entry.style}/${entry.index}-${entry.name}`;
}

/** The icon's Lordicon name, as lordicon.com gives it: `system-outline-94-lock`. */
export function iconLabel(entry: IconEntry): string {
    return entry.name
        ? `${entry.family}-${entry.style}-${entry.index}-${entry.name}`
        : 'hand-placed';
}

export type IconStates = {
    /** Every state in the file, without the morph ratio: `morph-select`, not `morph-select:0.5`. */
    names: string[];
    /** The state the element plays when the markup names none. */
    default: string;
};

/** The states an icon's file carries, read from its Lottie markers. */
export function iconStates(alias: string): IconStates {
    const data = JSON.parse(readFileSync(resolve(iconsDir, `${alias}.json`), 'utf8')) as {
        markers?: { cm: string }[];
    };
    const markers = (data.markers ?? []).map((marker) => marker.cm);
    const names = markers.map((marker) => marker.replace(/^default:/, '').split(':')[0]);
    const index = markers.findIndex((marker) => marker.startsWith('default:'));

    return { names, default: names[index] ?? names[0] ?? '' };
}
