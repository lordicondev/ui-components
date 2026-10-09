/**
 * Turns each demo into a standalone project: the demo's own files as they are, the
 * shared files it imports, the fonts, the icons it declares and the placeholder SVGs its
 * markup shows, and generated config files.
 *
 * Output: export/<slug>/ and dist/demos/<slug>/<slug>.zip
 *
 * Usage: npm run export [-- <slug> ...]
 */
import { zipSync, type Zippable } from 'fflate';
import { readdirSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { loadConfig, repoRoot } from './lib/config.ts';
import { demoDir, listDemos, readManifest } from './lib/demos.ts';
import { placeholdersIn } from './lib/icons.ts';
import { demoLinks } from './lib/links.ts';
import { hasMarkers, withoutMarkers } from './lib/regions.ts';
import { demoSources } from './lib/sources.ts';

const config = loadConfig();
const exportRoot = resolve(repoRoot, 'export');

/** Not shipped: tests, test helpers and the manifest. */
const NOT_SHIPPED = /\.test\.ts$|\/testing\/|demo\.json$/;

/** Files that may carry region markers, which are the portal's and not for the reader. */
const SOURCE = /\.(ts|css|html)$/;

const rootPackage = JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8')) as {
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
};

/** The version the repo uses, so the export builds against the same one. */
function version(name: string): string {
    const found = rootPackage.dependencies[name] ?? rootPackage.devDependencies[name];
    if (!found) throw new Error(`${name} is not a dependency of the repo`);
    return found;
}

function packageJson(slug: string): string {
    return `${JSON.stringify(
        {
            name: slug,
            version: rootPackage.version,
            private: true,
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview',
            },
            dependencies: {
                '@lordicon/element': version('@lordicon/element'),
            },
            devDependencies: {
                // vite.config.ts uses import.meta.dirname, so the editor needs Node types.
                '@types/node': version('@types/node'),
                typescript: version('typescript'),
                vite: version('vite'),
            },
        },
        null,
        4,
    )}\n`;
}

const VITE_CONFIG = `import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    // A relative base, so the build works from any path.
    base: './',
    resolve: {
        alias: { '@shared': resolve(import.meta.dirname, 'shared') },
    },
});
`;

const GITIGNORE = `node_modules/
dist/
`;

const TSCONFIG = `{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "bundler",
        "moduleDetection": "force",
        "allowImportingTsExtensions": true,
        "isolatedModules": true,
        "noEmit": true,
        "skipLibCheck": true,
        "useDefineForClassFields": true,

        /* Strip the types and this is still readable JavaScript. */
        "erasableSyntaxOnly": true,
        "verbatimModuleSyntax": true,

        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,

        "types": ["node", "vite/client"],
        "paths": { "@shared/*": ["./shared/*"] }
    },
    "include": ["*.ts", "shared/**/*.ts"]
}
`;

async function readme(slug: string): Promise<string> {
    const body = await readFile(resolve(demoDir(slug), 'README.md'), 'utf8');
    const links = demoLinks(config, slug);

    return `${body.trimEnd()}

---

Exported from [${config.repo.owner}/${config.repo.name}](${links.source}) ${rootPackage.version},
where it sits alongside the other demos.

The code is MIT. The icons are under the [Lordicon License Terms](https://lordicon.com/licenses);
see [LICENSE.md](LICENSE.md).
`;
}

async function exportDemo(slug: string): Promise<string> {
    const manifest = readManifest(slug);
    const target = resolve(exportRoot, slug);

    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });

    await cp(demoDir(slug), target, {
        recursive: true,
        filter: (source) => !NOT_SHIPPED.test(source),
    });

    // The shared files reached by following the demo's imports.
    const fragmentFiles = manifest.fragments.map((fragment) => fragment.file);
    for (const file of demoSources(slug, fragmentFiles)) {
        if (!file.shared) continue;

        const to = resolve(target, file.exportPath);
        await mkdir(dirname(to), { recursive: true });
        await cp(file.path, to);
    }

    await copyFonts(target);
    await stripMarkers(target);

    // Only the icons this demo declares.
    await mkdir(resolve(target, 'public/icons'), { recursive: true });
    for (const alias of manifest.icons) {
        await cp(
            resolve(repoRoot, 'shared/public/icons', `${alias}.json`),
            resolve(target, 'public/icons', `${alias}.json`),
        );
    }

    // The placeholder SVGs its markup shows.
    const html = await readFile(resolve(demoDir(slug), 'index.html'), 'utf8');
    for (const name of placeholdersIn(html)) {
        await cp(
            resolve(repoRoot, 'shared/public/icons', `${name}.svg`),
            resolve(target, 'public/icons', `${name}.svg`),
        );
    }

    await writeFile(resolve(target, 'package.json'), packageJson(slug));
    await writeFile(resolve(target, 'vite.config.ts'), VITE_CONFIG);
    await writeFile(resolve(target, 'tsconfig.json'), TSCONFIG);
    await writeFile(resolve(target, 'README.md'), await readme(slug));
    await cp(resolve(repoRoot, 'LICENSE.md'), resolve(target, 'LICENSE.md'));
    await writeFile(resolve(target, '.gitignore'), GITIGNORE);

    return target;
}

/** Only the font files base.css loads, with their licences. The mono face is the portal's. */
async function copyFonts(target: string): Promise<void> {
    const fontsDir = resolve(repoRoot, 'shared/fonts');
    const base = await readFile(resolve(repoRoot, 'shared/styles/base.css'), 'utf8');
    const used = [...base.matchAll(/fonts\/([\w.-]+\.woff2)/g)].map((match) => match[1]);

    await mkdir(resolve(target, 'shared/fonts'), { recursive: true });

    for (const file of new Set(used)) {
        await cp(resolve(fontsDir, file), resolve(target, 'shared/fonts', file));
    }

    // Match a licence to a family by name, ignoring hyphens.
    const flattened = used.map((file) => file.replaceAll('-', '').toLowerCase());
    for (const licence of readdirSync(fontsDir).filter((file) => file.startsWith('OFL-'))) {
        const family = licence.slice(4, -4).toLowerCase();
        if (flattened.some((file) => file.startsWith(family))) {
            await cp(resolve(fontsDir, licence), resolve(target, 'shared/fonts', licence));
        }
    }
}

/** Takes the `#region` markers out of every source file under `dir`. */
async function stripMarkers(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            await stripMarkers(path);
        } else if (SOURCE.test(entry.name)) {
            const stripped = withoutMarkers(await readFile(path, 'utf8'));
            if (hasMarkers(stripped)) throw new Error(`${path}: a region marker survived`);
            await writeFile(path, stripped);
        }
    }
}

async function collect(dir: string, base: string, into: Zippable): Promise<void> {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            await collect(path, base, into);
        } else {
            into[relative(base, path)] = new Uint8Array(await readFile(path));
        }
    }
}

async function zip(slug: string, from: string): Promise<number> {
    const to = resolve(repoRoot, 'dist/demos', slug, `${slug}.zip`);
    await mkdir(resolve(to, '..'), { recursive: true });

    // One folder inside the zip.
    const files: Zippable = {};
    await collect(from, resolve(from, '..'), files);

    const archive = zipSync(files, { level: 9 });
    await writeFile(to, archive);

    return archive.byteLength;
}

const requested = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const slugs = requested.length ? requested : listDemos();

for (const slug of slugs) {
    const target = await exportDemo(slug);
    const bytes = await zip(slug, target);
    console.log(`  ${slug.padEnd(20)} export/${slug}/  +  ${(bytes / 1024).toFixed(0)} kB zip`);
}

console.log(`\n${slugs.length} demo(s) exported`);
