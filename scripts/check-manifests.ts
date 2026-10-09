/**
 * Validates every demo.json against schemas/demo.schema.json.
 *
 *   npm run check:manifests
 */
// The schema is draft 2020-12, which is a separate entry point in ajv.
import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './lib/config.ts';
import { demoDir, listDemos, type DemoManifest } from './lib/demos.ts';

const schema = JSON.parse(readFileSync(resolve(repoRoot, 'schemas/demo.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

function describe(error: ErrorObject): string {
    const where = error.instancePath || '(root)';
    const extra = error.params.additionalProperty
        ? `: ${String(error.params.additionalProperty)}`
        : error.params.allowedValues
          ? ` (${(error.params.allowedValues as string[]).join(', ')})`
          : '';
    return `${where} ${error.message}${extra}`;
}

const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf8');

const problems: string[] = [];

for (const slug of listDemos()) {
    const manifest = JSON.parse(
        readFileSync(resolve(demoDir(slug), 'demo.json'), 'utf8'),
    ) as DemoManifest;

    if (!validate(manifest)) {
        for (const error of validate.errors ?? []) {
            problems.push(`${slug}: ${describe(error)}`);
        }
        continue;
    }

    // Things a schema cannot express.
    if (manifest.slug !== slug) {
        problems.push(`${slug}: declares slug "${manifest.slug}"`);
    }

    // The demo table in README.md is kept by hand.
    if (!readme.includes(`(demos/${slug}/)`)) {
        problems.push(`${slug}: not listed in README.md`);
    }

    const ids = manifest.fragments.map((fragment) => fragment.id);
    const duplicate = ids.find((id, at) => ids.indexOf(id) !== at);
    if (duplicate) {
        problems.push(`${slug}: two fragments share the id "${duplicate}"`);
    }

    console.log(`  ${slug.padEnd(20)} ${manifest.fragments.length} fragment(s)`);
}

if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
}

console.log(`\n${listDemos().length} manifest(s) valid`);
