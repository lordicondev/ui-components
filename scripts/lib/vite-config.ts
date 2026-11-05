import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { InlineConfig, Plugin } from 'vite';
import { repoRoot } from './config.ts';
import { demoDir, readManifest } from './demos.ts';
import { demoIconFiles, iconsDir } from './icons.ts';

const shared = resolve(repoRoot, 'shared');

/**
 * Reports the demo's height to the portal, which sizes the iframe from it. Injected into
 * the portal build only, never into the source or the export.
 */
const REPORT_HEIGHT = `
(() => {
    document.documentElement.style.overflow = 'hidden';

    const send = () => parent.postMessage(
        { type: 'demo-height', height: Math.ceil(document.body.getBoundingClientRect().height) },
        '*',
    );
    new ResizeObserver(send).observe(document.body);
    addEventListener('load', send);
})();
`.trim();

function reportHeight(): Plugin {
    return {
        name: 'demo-report-height',
        transformIndexHtml: () => [{ tag: 'script', children: REPORT_HEIGHT, injectTo: 'body' }],
    };
}

/**
 * Asks for the basic Latin Figtree file with the page, so the text starts in it rather than
 * in the fallback. Only the portal build knows the file's hashed name.
 */
function preloadFont(): Plugin {
    return {
        name: 'demo-preload-font',
        transformIndexHtml: {
            order: 'post',
            handler: (_html, { bundle }) => {
                const font = Object.values(bundle ?? {}).find(
                    (file) =>
                        file.type === 'asset' &&
                        file.originalFileNames.some((name) =>
                            name.endsWith('/figtree-latin.woff2'),
                        ),
                );
                if (!font) return [];
                const attrs = {
                    rel: 'preload',
                    href: `./${font.fileName}`,
                    as: 'font',
                    type: 'font/woff2',
                    crossorigin: '',
                };
                return [{ tag: 'link', attrs, injectTo: 'head' }];
            },
        },
    };
}

/** The built page is only ever shown, never read, so its HTML comments go. */
function stripComments(): Plugin {
    return {
        name: 'demo-strip-comments',
        transformIndexHtml: (html) => html.replace(/[ \t]*<!--[\s\S]*?-->\n?/g, ''),
    };
}

/**
 * A built demo ships only its own icons and placeholders, not all of shared/public. The dev
 * server still serves everything. In the portal the demo's page and its card also show each
 * declared icon's rest frame from the app folder.
 */
function demoIcons(slug: string, embed: boolean): Plugin {
    return {
        name: 'demo-icons',
        apply: 'build',
        config: () => ({ publicDir: false }),
        generateBundle() {
            const files = new Set(demoIconFiles(slug));
            if (embed) for (const alias of readManifest(slug).icons) files.add(`${alias}.svg`);

            for (const file of files) {
                this.emitFile({
                    type: 'asset',
                    fileName: `icons/${file}`,
                    source: readFileSync(resolve(iconsDir, file)),
                });
            }
        },
    };
}

export type DemoConfigOptions = {
    /** True when the build is for the portal, which embeds the demo in an iframe. */
    embed?: boolean;
};

/**
 * The Vite config for one demo. There is no vite.config.ts in the repo; the export
 * generates one. `base: './'` keeps a built demo working at any path.
 */
export function demoConfig(slug: string, options: DemoConfigOptions = {}): InlineConfig {
    return {
        configFile: false,
        root: demoDir(slug),
        base: './',
        // shared/public/icons is served to every demo as ./icons/*.json. A build narrows it.
        publicDir: resolve(shared, 'public'),
        resolve: { alias: { '@shared': shared } },
        plugins: [
            demoIcons(slug, Boolean(options.embed)),
            ...(options.embed ? [reportHeight(), preloadFont(), stripComments()] : []),
        ],
        build: {
            outDir: resolve(repoRoot, 'dist/demos', slug, 'app'),
            emptyOutDir: true,
        },
    };
}
