/**
 * Every file a demo is made of, found by following the references in its own files.
 * The portal lists them and the export ships them.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { repoRoot } from './config.ts';
import { demoDir } from './demos.ts';

export type Lang = 'ts' | 'css' | 'html';

export type SourceFile = {
    /** Absolute path in this repo. */
    path: string;
    /** Where the file sits in an export — and how the portal labels it. */
    exportPath: string;
    lang: Lang;
    /** Shared code travels under shared/; a demo's own files sit at the root. */
    shared: boolean;
};

export const sharedDir = resolve(repoRoot, 'shared');

/** How each language points at another file. Anything else is an npm package. */
const REFERENCES: Record<Lang, RegExp[]> = {
    ts: [/\b(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g, /\bimport\s*['"]([^'"]+)['"]/g],
    css: [/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g],
    html: [/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/g],
};

function langOf(path: string): Lang | null {
    if (path.endsWith('.ts')) return 'ts';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    return null;
}

/** Where a reference points, or null for an npm package, a URL or an asset. */
function target(specifier: string, from: string): string | null {
    if (specifier.startsWith('@shared/')) {
        return resolve(sharedDir, specifier.slice('@shared/'.length));
    }

    if (specifier.startsWith('./') || specifier.startsWith('../')) {
        return resolve(dirname(from), specifier);
    }

    return null;
}

export type SourceOptions = {
    /** The folder the demo's own files live in. */
    root: string;
    /** Where to start; index.html unless a fragment reaches somewhere else. */
    entries: string[];
    /** For error messages: how to describe a file in this repo. */
    label?: (path: string) => string;
};

/**
 * Follows the references out of `entries` and returns every file reached, entries
 * included. Throws on a missing file or one outside the demo and shared/.
 */
export function collectSources({ root, entries, label }: SourceOptions): SourceFile[] {
    const name = label ?? ((path: string) => relative(repoRoot, path));
    const found = new Map<string, SourceFile>();
    const queue = [...entries];

    while (queue.length) {
        const path = queue.shift()!;
        if (found.has(path)) continue;

        const lang = langOf(path);
        if (!lang) continue;

        const shared = path.startsWith(`${sharedDir}/`);
        if (!shared && !path.startsWith(`${root}/`)) {
            throw new Error(
                `${name(path)} sits outside the demo and outside shared/. ` +
                    'A demo can only reach its own files and shared code — anything else ' +
                    'is left behind by the export.',
            );
        }

        if (!existsSync(path) || !statSync(path).isFile()) {
            throw new Error(`${name(path)} is referenced but does not exist`);
        }

        found.set(path, {
            path,
            exportPath: shared ? `shared/${relative(sharedDir, path)}` : relative(root, path),
            lang,
            shared,
        });

        const source = readFileSync(path, 'utf8');
        for (const pattern of REFERENCES[lang]) {
            for (const [, specifier] of source.matchAll(pattern)) {
                const next = target(specifier, path);
                if (next && langOf(next)) queue.push(next);
            }
        }
    }

    // The demo's own files first, then the shared ones.
    return [...found.values()].sort(
        (a, b) => Number(a.shared) - Number(b.shared) || a.exportPath.localeCompare(b.exportPath),
    );
}

/** Every file demo `slug` is made of. Fragment files are extra entry points. */
export function demoSources(slug: string, fragmentFiles: string[] = []): SourceFile[] {
    const root = demoDir(slug);

    return collectSources({
        root,
        entries: [resolve(root, 'index.html'), ...fragmentFiles.map((f) => resolve(root, f))],
    });
}
