/**
 * Builds every demo under dist/demos/<slug>/app/.
 *
 * Usage: npm run build:demos [-- <slug> ...]
 */
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { demoConfig } from './lib/vite-config.ts';
import { repoRoot } from './lib/config.ts';
import { listDemos } from './lib/demos.ts';

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : listDemos();

// A full build drops demos that were renamed or removed, or the portal would still ship them.
const outRoot = resolve(repoRoot, 'dist/demos');
if (!requested.length && existsSync(outRoot)) {
    for (const entry of readdirSync(outRoot)) {
        if (!slugs.includes(entry))
            rmSync(resolve(outRoot, entry), { recursive: true, force: true });
    }
}

for (const slug of slugs) {
    console.log(`\nbuilding ${slug}`);
    await build(demoConfig(slug, { embed: true }));
}

console.log(`\ndone: ${slugs.length} demo(s)`);
