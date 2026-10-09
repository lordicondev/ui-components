/**
 * Builds every demo under dist/demos/<slug>/app/.
 *
 * Usage: npm run build:demos [-- <slug> ...]
 */
import { build } from 'vite';
import { demoConfig } from './lib/vite-config.ts';
import { listDemos } from './lib/demos.ts';

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : listDemos();

for (const slug of slugs) {
    console.log(`\nbuilding ${slug}`);
    await build(demoConfig(slug, { embed: true }));
}

console.log(`\ndone: ${slugs.length} demo(s)`);
