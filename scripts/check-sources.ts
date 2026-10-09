/**
 * Follows every reference out of every demo and fails if one leads nowhere. The portal
 * lists these files and the export ships them.
 *
 *   npm run check:sources
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './lib/config.ts';
import { listDemos, readManifest } from './lib/demos.ts';
import { demoSources } from './lib/sources.ts';

/** How a demo loads an icon: <lord-icon src="icons/lock.json">. */
const ICON_REFERENCE = /icons\/([\w-]+)\.json/g;

const problems: string[] = [];
const notes: string[] = [];
const reached = new Set<string>();

for (const slug of listDemos()) {
    const manifest = readManifest(slug);

    let files;
    try {
        files = demoSources(
            slug,
            manifest.fragments.map((fragment) => fragment.file),
        );
    } catch (error) {
        problems.push(`${slug}: ${(error as Error).message}`);
        continue;
    }

    for (const file of files) reached.add(file.exportPath);

    // Icons are loaded by URL and the export only ships the declared ones, so an
    // undeclared icon is a hole in the exported demo.
    const own = files
        .filter((file) => !file.shared)
        .map((file) => readFileSync(file.path, 'utf8'))
        .join('\n');

    const loaded = new Set([...own.matchAll(ICON_REFERENCE)].map(([, alias]) => alias));

    for (const alias of loaded) {
        if (!manifest.icons.includes(alias)) {
            problems.push(
                `${slug}: loads icons/${alias}.json but does not declare "${alias}" — ` +
                    'the export would ship without it',
            );
        }
    }

    // The other way round is only a note: a demo may declare an icon before it is used.
    // A src built at runtime does not match the pattern, so any mention counts as used.
    for (const alias of manifest.icons) {
        if (!own.includes(alias)) notes.push(`${slug} declares "${alias}" but never names it`);
    }

    const shared = files.filter((file) => file.shared).length;
    console.log(`  ${slug.padEnd(20)} ${files.length - shared} own + ${shared} shared`);
}

/** A trigger no demo reaches is dead code. */
const orphans = readdirSync(resolve(repoRoot, 'shared/triggers'))
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .filter((file) => !reached.has(`shared/triggers/${file}`));

if (orphans.length) {
    notes.push(`shared/triggers: ${orphans.join(', ')} not reached by any demo`);
}

if (notes.length) {
    console.log('\nworth a look:');
    for (const note of notes) console.log(`  ${note}`);
}

if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
}

console.log(`\nevery reference resolves`);
