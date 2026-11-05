import { describe, expect, it } from 'vitest';
import { extractFragment, extractRegion } from './regions.ts';

const html = `<main>
    <!-- #region markup -->
    <ul>
        <li>One</li>
        <!-- #skip -->
        <li>Two</li>
        <li>Three</li>
        <!-- #endskip -->
    </ul>
    <!-- #endregion -->
</main>`;

describe('extractFragment', () => {
    it('splits the region at each skip and keeps where the skip sits', () => {
        const { parts, skips } = extractFragment(html, 'markup', 'test');
        expect(parts).toEqual(['<ul>\n    <li>One</li>', '</ul>']);
        expect(skips).toEqual(['    ']);
    });

    it('gives the whole region, skipped lines included, for copying', () => {
        expect(extractFragment(html, 'markup', 'test').full).toBe(
            '<ul>\n    <li>One</li>\n    <li>Two</li>\n    <li>Three</li>\n</ul>',
        );
    });

    it('is one part when nothing is skipped', () => {
        const source = '// #region setup\nconst a = 1;\n// #endregion';
        expect(extractFragment(source, 'setup', 'test')).toEqual({
            parts: ['const a = 1;'],
            skips: [],
            full: 'const a = 1;',
        });
    });
});

describe('extractRegion', () => {
    it('writes a skip as a comment the language understands', () => {
        const css =
            '/* #region a */\n.a {\n    /* #skip */\n    color: red;\n    /* #endskip */\n}\n/* #endregion */';
        expect(extractRegion(css, 'a', 'test', 'css')).toBe('.a {\n    /* … */\n}');
        expect(extractRegion(html, 'markup', 'test', 'html')).toContain('    <!-- … -->');
    });
});
