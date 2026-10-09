import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './config.ts';

export type Fragment = {
    id: string;
    file: string;
    region: string;
    lang: 'html' | 'ts' | 'css';
    title: string;
    note?: string;
};

export type DemoManifest = {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    icons: string[];
    fragments: Fragment[];
};

export const demosDir = resolve(repoRoot, 'demos');

export function demoDir(slug: string): string {
    return resolve(demosDir, slug);
}

/** Every folder under demos/ that carries a manifest, in a stable order. */
export function listDemos(): string[] {
    return readdirSync(demosDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((slug) => {
            try {
                readFileSync(resolve(demosDir, slug, 'demo.json'));
                return true;
            } catch {
                return false;
            }
        })
        .sort();
}

export function readManifest(slug: string): DemoManifest {
    const manifest = JSON.parse(
        readFileSync(resolve(demoDir(slug), 'demo.json'), 'utf8'),
    ) as DemoManifest;

    if (manifest.slug !== slug) {
        throw new Error(`demos/${slug}/demo.json declares slug "${manifest.slug}"`);
    }

    return manifest;
}
