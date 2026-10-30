import { describe, expect, it } from 'vitest';
import { packCss, packDemo, rewriteAssets } from './codepen.ts';
import type { SiteConfig } from './config.ts';
import { listDemos } from './demos.ts';

const config: SiteConfig = {
    name: 'ui-components',
    title: 'UI Components',
    description: '',
    siteUrl: 'https://example.com/',
    repo: { owner: 'owner', name: 'repo', branch: 'main', exportBranch: 'standalone' },
};

const BASE = 'https://cdn.jsdelivr.net/gh/owner/repo@main/';

describe('rewriteAssets', () => {
    it('points icons at the public folder and local files at the demo', () => {
        const html = '<lord-icon src="icons/lock.json"><img src="./logo.svg" /></lord-icon>';

        expect(rewriteAssets(html, 'alert', BASE)).toBe(
            `<lord-icon src="${BASE}shared/public/icons/lock.json">` +
                `<img src="${BASE}demos/alert/logo.svg" /></lord-icon>`,
        );
    });

    it('rewrites a path built in a template literal', () => {
        expect(rewriteAssets('`icons/${name}.json`', 'alert', BASE)).toBe(
            `\`${BASE}shared/public/icons/\${name}.json\``,
        );
    });

    it('leaves scripts and stylesheets alone', () => {
        const html = '<script src="./main.ts"></script><link href="./demo.css" />';
        expect(rewriteAssets(html, 'alert', BASE)).toBe(html);
    });
});

describe('packCss', () => {
    it('inlines the imports in cascade order, with absolute font urls', () => {
        const css = packCss('menu-bar', BASE);
        const sections = [...css.matchAll(/\/\* ---- (\S+) ---- \*\//g)].map((match) => match[1]);

        expect(sections).toEqual([
            'shared/styles/palette.css',
            'shared/styles/tokens.css',
            'shared/styles/base.css',
            'shared/ui/tooltip.css',
            'menu-bar.css',
        ]);
        expect(css).toContain(`url('${BASE}shared/fonts/figtree-latin.woff2')`);
        expect(css).not.toContain('@import');
    });
});

describe('packDemo', () => {
    it.each(listDemos())('%s has no repo paths or module syntax left', async (slug) => {
        const pen = await packDemo(slug, config);
        const all = `${pen.html}${pen.css}${pen.js}`;

        expect(all).not.toMatch(/@shared\/|#region|#endregion/);
        expect(all).not.toMatch(/["'`(]\.?\/?icons\//);
        expect(pen.js).not.toMatch(/^export /m);
        expect(pen.js).not.toMatch(/from '[^h]/);
    });

    it('gives each helper a scope of its own, so repeated names do not clash', async () => {
        const { js } = await packDemo('dropdown-menu', config);

        expect(js.match(/^ {4}(?:let|const) wired\b/gm)).toHaveLength(2);
        expect(js).toContain('const { popovers } = (() => {');
        expect(js).toContain('const { menus } = (() => {');
    });

    it('imports the element once, at the top, with what the helpers need', async () => {
        const { js } = await packDemo('rating', config);
        const imports = js.match(/^import [\s\S]*?;$/gm) ?? [];

        expect(imports).toHaveLength(1);
        expect(imports[0]).toContain('BaseTrigger');
        expect(imports[0]).toContain('defineElement');
        expect(imports[0]).toContain('https://cdn.jsdelivr.net/npm/@lordicon/element@3/+esm');
        expect(js.indexOf(imports[0]!)).toBeLessThan(js.indexOf('// ---- '));
    });

    it('serves the files next to a demo from the repo', async () => {
        const { html, css } = await packDemo('mega-menu', config);

        expect(html).toContain(`src="${BASE}demos/mega-menu/logo.svg"`);
        expect(css).toContain(`url('${BASE}demos/mega-menu/featured.webp')`);
    });
});
