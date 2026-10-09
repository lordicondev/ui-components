import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { collectSources, demoSources } from './sources.ts';

let root = '';

function fixture(files: Record<string, string>): string {
    root = mkdtempSync(join(tmpdir(), 'sources-'));
    for (const [name, content] of Object.entries(files)) {
        writeFileSync(resolve(root, name), content);
    }
    return root;
}

function collect(files: Record<string, string>) {
    const dir = fixture(files);
    return collectSources({ root: dir, entries: [resolve(dir, 'index.html')] });
}

afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = '';
});

describe('collectSources', () => {
    it('follows html into scripts and stylesheets, and on through their imports', () => {
        const files = collect({
            'index.html': `<link rel="stylesheet" href="./demo.css" />
                <script type="module" src="./main.ts"></script>
                <lord-icon src="icons/lock.json"></lord-icon>`,
            'demo.css': "@import './extra.css';",
            'extra.css': '.a { color: red }',
            'main.ts': "import { helper } from './helper.ts';\nimport 'some-package';",
            'helper.ts': 'export const helper = 1;',
        });

        expect(files.map((file) => file.exportPath)).toEqual([
            'demo.css',
            'extra.css',
            'helper.ts',
            'index.html',
            'main.ts',
        ]);
    });

    it('labels shared code by where it lands in an export', () => {
        const files = collect({
            'index.html': '<script type="module" src="./main.ts"></script>',
            'main.ts': "import { PreviewMorph } from '@shared/triggers/preview-morph.ts';",
        });

        expect(files.map((file) => file.exportPath)).toContain('shared/triggers/preview-morph.ts');
        expect(files.find((file) => file.shared)?.lang).toBe('ts');
    });

    it('refuses a reference to a file that is not there', () => {
        expect(() =>
            collect({
                'index.html': '<script type="module" src="./main.ts"></script>',
                'main.ts': "import './gone.ts';",
            }),
        ).toThrow(/gone\.ts is referenced but does not exist/);
    });

    // A sibling demo's file would not be in the export.
    it('refuses a reference outside the demo and shared/', () => {
        expect(() =>
            collect({
                'index.html': '<script type="module" src="./main.ts"></script>',
                'main.ts': "import '../elsewhere/main.ts';",
            }),
        ).toThrow(/outside the demo and outside shared\//);
    });
});

describe('demoSources', () => {
    it('reaches the shared files a real demo imports, and only those', () => {
        const paths = demoSources('rating').map((file) => file.exportPath);

        expect(paths).toContain('shared/triggers/preview-morph.ts');
        expect(paths).toContain('shared/styles/palette.css');
        expect(paths).not.toContain('shared/triggers/testing/player-stub.ts');
    });
});
