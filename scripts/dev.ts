/**
 * Dev server for one demo. A demo is a standalone Vite project, so it gets its own root.
 *
 * Usage: npm run dev [-- <slug>]
 */
import { createServer } from 'vite';
import { listDemos } from './lib/demos.ts';
import { demoConfig } from './lib/vite-config.ts';

const slugs = listDemos();
const slug = process.argv[2] ?? slugs[0];

if (!slugs.includes(slug)) {
    console.error(`unknown demo "${slug}". Available: ${slugs.join(', ')}`);
    process.exit(1);
}

const server = await createServer(demoConfig(slug));
await server.listen();
console.log(`\n  ${slug}`);
server.printUrls();
