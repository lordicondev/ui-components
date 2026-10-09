/**
 * Checks the code fragments a demo puts on show.
 *
 * The files themselves are type-checked by `tsc --noEmit`. This checks the regions the
 * portal lifts out of them: that every fragment resolves, that every region is used, and
 * that a fragment shows code rather than a comment.
 *
 *   npm run check:fragments
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { demoDir, listDemos, readManifest } from './lib/demos.ts';
import { extractRegion, listRegions, RegionError } from './lib/regions.ts';

/**
 * A code fragment longer than this usually means logic that belongs in a trigger. Markup
 * gets more room: its length comes from one attribute per line, not from complexity.
 */
const COMFORTABLE = { ts: 25, css: 25, html: 32 };
const TOO_LONG = { ts: 40, css: 40, html: 48 };

/** A fragment with fewer code lines than this is a comment with a line of code under it. */
const TOO_LITTLE_CODE = 2;

/**
 * A demo's own code never touches an icon; only the setup fragment defines the element.
 * If one of these names shows up in another code fragment, the point of the demo is lost.
 */
const ICON_API = /\blord-icon\b|defineElement|playState|LordIconElement/;

const COMMENTS = {
    ts: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
    css: /\/\*[\s\S]*?\*\//g,
    html: /<!--[\s\S]*?-->/g,
};

function codeLines(code: string, lang: keyof typeof COMMENTS): number {
    return code
        .replace(COMMENTS[lang], '')
        .split('\n')
        .filter((line) => line.trim()).length;
}

const errors: string[] = [];
const warnings: string[] = [];

for (const slug of listDemos()) {
    const manifest = readManifest(slug);

    for (const fragment of manifest.fragments) {
        const where = `${slug}/${fragment.id}`;
        const file = resolve(demoDir(slug), fragment.file);

        let code: string;
        try {
            code = extractRegion(
                readFileSync(file, 'utf8'),
                fragment.region,
                `demos/${slug}/${fragment.file}`,
                fragment.lang,
            );
        } catch (error) {
            errors.push(`${where}: ${error instanceof RegionError ? error.message : error}`);
            continue;
        }

        if (!code.trim()) {
            errors.push(`${where}: the region is empty`);
            continue;
        }

        const lines = code.split('\n').length;
        const comfortable = COMFORTABLE[fragment.lang];
        if (lines > TOO_LONG[fragment.lang]) {
            errors.push(`${where}: ${lines} lines — far past the ${comfortable}-line guide`);
        } else if (lines > comfortable) {
            warnings.push(`${where}: ${lines} lines, over the ${comfortable}-line guide`);
        }

        if (codeLines(code, fragment.lang) < TOO_LITTLE_CODE) {
            errors.push(`${where}: mostly comment — a fragment shows code`);
        }

        if (fragment.id !== 'setup' && ICON_API.test(code)) {
            // Markup is where an icon is supposed to appear; code is not.
            if (fragment.lang !== 'html') {
                errors.push(`${where}: reaches for the icon API in a "basic" demo`);
            }
        }

        console.log(`  ${where.padEnd(30)} ${String(lines).padStart(2)} lines  ${fragment.lang}`);
    }

    // Every region in the demo's own files has to be a fragment. A region nobody shows is
    // either a fragment that fell out of the manifest or a marker that should go.
    const shown = new Set(
        manifest.fragments.map((fragment) => `${fragment.file}#${fragment.region}`),
    );

    for (const file of ['main.ts', 'index.html', `${slug}.css`]) {
        const path = resolve(demoDir(slug), file);
        if (!existsSync(path)) continue;

        const seen = new Set<string>();
        for (const region of listRegions(readFileSync(path, 'utf8'))) {
            if (seen.has(region)) {
                errors.push(`${slug}/${file}: two regions named "${region}"`);
            }
            seen.add(region);

            if (!shown.has(`${file}#${region}`)) {
                errors.push(`${slug}/${file}: "#region ${region}" is not a fragment`);
            }
        }
    }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
}

console.log('\nfragments look fine');
