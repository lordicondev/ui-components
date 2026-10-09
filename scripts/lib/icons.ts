import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './config.ts';

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
export const PORTAL_ICONS = ['arrow-out-square'];

export const iconsDir = resolve(repoRoot, 'shared/public/icons');
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

/** The icon a placeholder is drawn from: `star.morph-select` is `star`. */
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

/** The icon's page on lordicon.com, for icons we know the origin of. */
export function iconUrl(entry: IconEntry): string | undefined {
    if (!entry.name) return undefined;
    return `https://lordicon.com/icons/${entry.family}/${entry.style}/${entry.index}-${entry.name}`;
}

/**
 * How to describe an icon in a listing: its Lordicon identifier where we know one, plus a
 * note when the file has since been replaced by hand.
 */
export function iconLabel(entry: IconEntry): string {
    const id = entry.name
        ? `${entry.family}-${entry.style}-${entry.index}-${entry.name}`
        : 'hand-placed';
    return entry.source === 'manual' && entry.name ? `${id} (edited by hand)` : id;
}
