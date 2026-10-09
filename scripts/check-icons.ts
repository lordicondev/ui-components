/**
 * Checks the icons the demos declare against the files in shared/public/icons.
 *
 * Fails on a declared icon with no file, a file that is not a Lottie animation, and a
 * placeholder SVG a demo shows that is missing or belongs to an icon the demo does not
 * declare. Everything else is a warning: icons are swapped by hand, and the lockfile
 * records where each came from rather than enforcing it.
 *
 *   npm run check:icons
 *   npm run check:icons -- --list     # aliases with no file yet
 *   npm run check:icons -- --record   # accept what is on disk into the lockfile
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { demoDir, listDemos, readManifest } from './lib/demos.ts';
import {
    PORTAL_ICONS,
    fingerprint,
    iconFiles,
    iconLabel,
    iconsDir,
    looksLikeLottie,
    placeholderAlias,
    placeholdersIn,
    readLockfile,
    type IconEntry,
    writeLockfile,
} from './lib/icons.ts';

const listOnly = process.argv.includes('--list');
const record = process.argv.includes('--record');

const declared = new Map<string, string[]>();
for (const slug of listDemos()) {
    for (const alias of readManifest(slug).icons) {
        declared.set(alias, [...(declared.get(alias) ?? []), slug]);
    }
}
for (const alias of PORTAL_ICONS) {
    declared.set(alias, [...(declared.get(alias) ?? []), 'the portal']);
}

const lockfile = new Map(readLockfile().map((entry) => [entry.alias, entry]));
const onDisk = iconFiles();

const errors: string[] = [];
const warnings: string[] = [];
const missing: string[] = [];
const recorded: IconEntry[] = [];

for (const [alias, slugs] of [...declared].sort()) {
    if (!onDisk.includes(alias)) {
        missing.push(alias);
        errors.push(
            `${alias}: declared by ${slugs.join(', ')} but shared/public/icons/${alias}.json is missing`,
        );
    }
}

for (const alias of onDisk) {
    const content = readFileSync(resolve(iconsDir, `${alias}.json`), 'utf8');

    if (!looksLikeLottie(content)) {
        errors.push(`${alias}: ${alias}.json is not a Lottie animation`);
        continue;
    }

    const actual = fingerprint(content);
    const entry = lockfile.get(alias);

    if (!entry) {
        warnings.push(`${alias}: on disk but not in the lockfile (hand-placed?)`);
        recorded.push({ alias, source: 'manual', ...actual });
        continue;
    }

    if (entry.sha256 !== actual.sha256) {
        warnings.push(
            `${alias}: file differs from the lockfile — edited by hand since it was fetched`,
        );
        // A changed portal icon becomes a manual one: the sync tool must stop overwriting it.
        recorded.push({ ...entry, source: 'manual', ...actual });
        continue;
    }

    recorded.push(entry);
}

for (const entry of lockfile.values()) {
    if (!onDisk.includes(entry.alias)) {
        warnings.push(`${entry.alias}: in the lockfile but the file is gone`);
    }
}

for (const alias of onDisk) {
    if (!declared.has(alias)) warnings.push(`${alias}: present but no demo declares it`);
}

// Placeholders: every icon has an SVG of its rest frame, and what a demo shows must exist.
for (const alias of onDisk) {
    if (!existsSync(resolve(iconsDir, `${alias}.svg`))) {
        warnings.push(`${alias}: no ${alias}.svg placeholder next to the JSON`);
    }
}
for (const file of readdirSync(iconsDir).filter((file) => file.endsWith('.svg'))) {
    const alias = placeholderAlias(file);
    if (!onDisk.includes(alias)) warnings.push(`${file}: a placeholder with no ${alias}.json`);
}

for (const slug of listDemos()) {
    const html = readFileSync(resolve(demoDir(slug), 'index.html'), 'utf8');
    const icons = readManifest(slug).icons;

    for (const name of placeholdersIn(html)) {
        if (!existsSync(resolve(iconsDir, `${name}.svg`))) {
            errors.push(`${slug}: shows icons/${name}.svg, which is missing`);
        } else if (!icons.includes(placeholderAlias(name))) {
            errors.push(`${slug}: shows icons/${name}.svg but does not declare its icon`);
        }
    }
}

if (listOnly) {
    console.log(missing.join('\n'));
    process.exit(0);
}

if (record) {
    writeLockfile(recorded);
    console.log(`recorded ${recorded.length} icon(s) into shared/icons.json`);
    process.exit(0);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const error of errors) console.error(`  ${error}`);
    console.error('\nAdd the missing files to shared/public/icons/, then run with --record.');
    process.exit(1);
}

for (const alias of [...declared.keys()].sort()) {
    const entry = lockfile.get(alias);
    console.log(`  ${alias.padEnd(20)} ${entry ? iconLabel(entry) : 'unrecorded'}`);
}
console.log(`\n${declared.size} icon(s) in place`);

if (warnings.length) {
    console.log('Run `npm run check:icons -- --record` to accept the changes above.');
}
