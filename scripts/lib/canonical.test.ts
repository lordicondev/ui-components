import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packDemo } from './codepen.ts';
import { loadConfig } from './config.ts';
import { demoDir, listDemos } from './demos.ts';
import { demoSources } from './sources.ts';

/**
 * Only the portal's copy of a demo points at the portal. Code people take away, the export
 * and the pen, must not: their copy would hand its search ranking to our site.
 */
const CANONICAL = /rel=["']?canonical/;

function filesIn(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile())
        .map((entry) => resolve(entry.parentPath, entry.name));
}

describe('no canonical link in code people take away', () => {
    it.each(listDemos())('%s export', (slug) => {
        const files = [...filesIn(demoDir(slug)), ...demoSources(slug).map((file) => file.path)];
        for (const file of files) {
            expect(readFileSync(file, 'utf8'), file).not.toMatch(CANONICAL);
        }
    });

    it.each(listDemos())('%s pen', async (slug) => {
        const pen = await packDemo(slug, loadConfig());
        expect(`${pen.html}${pen.css}${pen.js}`).not.toMatch(CANONICAL);
    });
});
