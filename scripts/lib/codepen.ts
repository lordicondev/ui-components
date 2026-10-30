/**
 * Packs a demo into the three panes of a pen: HTML (the body), CSS and JS. Shared files are
 * inlined under a comment with their path, and assets load from jsDelivr, so the result also
 * runs as a single page opened from disk.
 */
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';
import ts from 'typescript';
import { repoRoot, type SiteConfig } from './config.ts';
import { demoDir, readManifest, type DemoManifest } from './demos.ts';
import { withoutMarkers } from './regions.ts';
import { sharedDir } from './sources.ts';
import { toJavaScript } from './transpile.ts';

export type Pen = {
    slug: string;
    title: string;
    description: string;
    /** The demo's page in the portal. */
    page: string;
    html: string;
    css: string;
    js: string;
};

const rootPackage = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8')) as {
    dependencies: Record<string, string>;
};

/** The repo on jsDelivr, at the branch the site is built from. */
export function assetBase(config: SiteConfig): string {
    const { owner, name, branch } = config.repo;
    return `https://cdn.jsdelivr.net/gh/${owner}/${name}@${branch}/`;
}

/** An npm package on jsDelivr, at the major version the repo uses. */
function packageUrl(name: string): string {
    const range = rootPackage.dependencies[name];
    if (!range) throw new Error(`${name} is not a dependency of the repo`);

    const major = /\d+/.exec(range)![0];
    return `https://cdn.jsdelivr.net/npm/${name}@${major}/+esm`;
}

/** How a file is labelled in the pen: its path in an export. */
function label(path: string, slug: string): string {
    return path.startsWith(`${sharedDir}/`)
        ? `shared/${relative(sharedDir, path)}`
        : relative(demoDir(slug), path);
}

function read(path: string): string {
    return withoutMarkers(readFileSync(path, 'utf8'));
}

/** Where an import or @import points, or null for a package. */
function localTarget(specifier: string, from: string): string | null {
    if (specifier.startsWith('@shared/')) return resolve(sharedDir, specifier.slice(8));
    if (specifier.startsWith('.')) return resolve(dirname(from), specifier);
    return null;
}

/**
 * Makes asset paths in markup and scripts absolute: `icons/…` is the public folder, and
 * `./file.svg` is a file next to the demo.
 */
export function rewriteAssets(text: string, slug: string, base: string): string {
    return text
        .replaceAll(/(["'`])icons\//g, `$1${base}shared/public/icons/`)
        .replaceAll(
            /(["'`])\.\/([\w.-]+\.(?:svg|png|jpe?g|webp|gif|avif))/g,
            `$1${base}demos/${slug}/$2`,
        );
}

/** The body of index.html, one level less indented, with a link back to the portal. */
export function packHtml(slug: string, base: string, page: string): string {
    const text = read(resolve(demoDir(slug), 'index.html'));
    const body = /<body>\n([\s\S]*?)\n\s*<\/body>/.exec(text)?.[1];
    if (!body) throw new Error(`demos/${slug}/index.html has no <body>`);

    const lines = body.split('\n');
    const indent = Math.min(
        ...lines.filter((line) => line.trim()).map((line) => /^ */.exec(line)![0].length),
    );
    const markup = lines.map((line) => line.slice(indent).trimEnd()).join('\n');

    return `${rewriteAssets(markup, slug, base)}

<!-- Not part of the demo: where it comes from. -->
<a class="source" href="${page}" target="_blank" rel="noopener">
    More animated UI components at components.lordicon.com
</a>
`;
}

const SOURCE_LINK_CSS = `/* ---- Not part of the demo: the link back ---- */

.source {
    position: fixed;
    right: 0;
    bottom: var(--space-16);
    left: 0;
    color: var(--ink-muted);
    font-size: var(--text-xs);
    line-height: var(--leading-xs);
    text-align: center;
}
`;

/**
 * The demo's stylesheet with its @imports inlined in cascade order, each file once, under
 * its path. Relative url()s become jsDelivr addresses.
 */
export function packCss(slug: string, base: string): string {
    const seen = new Set<string>();
    const parts: string[] = [];

    function visit(path: string): void {
        if (seen.has(path)) return;
        seen.add(path);

        const own: string[] = [];
        for (const line of read(path).split('\n')) {
            const specifier = /^@import '([^']+)';$/.exec(line)?.[1];
            const target = specifier && localTarget(specifier, path);
            if (target) visit(target);
            else own.push(line);
        }

        const text = own
            .join('\n')
            .trim()
            .replaceAll(/url\('(\.{1,2}\/[^']+)'\)/g, (_, url: string) => {
                const file = relative(repoRoot, resolve(dirname(path), url));
                return `url('${base}${file}')`;
            });

        // A file of imports only, such as index.css, adds no section.
        if (/^(\/\*[\s\S]*?\*\/)?$/.test(text)) return;
        parts.push(`/* ---- ${label(path, slug)} ---- */\n\n${text}\n`);
    }

    visit(resolve(demoDir(slug), `${slug}.css`));
    parts.push(SOURCE_LINK_CSS);

    return parts.join('\n');
}

type Module = {
    path: string;
    /** TypeScript without imports, exports and type declarations. */
    body: string;
    /** Local files this one imports, with the names it takes. */
    locals: Map<string, string[]>;
    /** Packages this one imports, with the names it takes. */
    packages: Map<string, string[]>;
};

/** Takes a module apart: what it imports, and its code without the module syntax. */
function parseModule(path: string): Module {
    const text = read(path);
    const tree = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const module: Module = { path, body: '', locals: new Map(), packages: new Map() };
    const cuts: { from: number; to: number }[] = [];

    for (const statement of tree.statements) {
        if (ts.isImportDeclaration(statement)) {
            const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
            const clause = statement.importClause;
            const bindings = clause?.namedBindings;
            if (!clause || clause.name || (bindings && !ts.isNamedImports(bindings))) {
                throw new Error(`${relative(repoRoot, path)}: only named imports can be packed`);
            }

            const names = clause.isTypeOnly
                ? []
                : (bindings?.elements ?? [])
                      .filter((element) => !element.isTypeOnly)
                      .map((element) => element.name.text);

            const target = localTarget(specifier, path);
            const into = target ? module.locals : module.packages;
            into.set(target ?? specifier, [...(into.get(target ?? specifier) ?? []), ...names]);

            cuts.push({ from: statement.getStart(), to: statement.getEnd() });
            continue;
        }

        if (ts.isExportDeclaration(statement) || ts.isExportAssignment(statement)) {
            throw new Error(`${relative(repoRoot, path)}: re-exports cannot be packed`);
        }

        // A type goes with the doc comment above it.
        if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
            cuts.push({ from: statement.getStart(tree, true), to: statement.getEnd() });
            continue;
        }

        const exported = ts
            .getModifiers(statement as ts.HasModifiers)
            ?.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
        if (exported) cuts.push({ from: exported.getStart(), to: exported.getEnd() + 1 });
    }

    let body = text;
    for (const cut of cuts.sort((a, b) => b.from - a.from)) {
        body = body.slice(0, cut.from) + body.slice(cut.to);
    }

    module.body = body;
    return module;
}

/**
 * main.ts and every module it reaches, as one module script. Packages are imported once at
 * the top. Each helper runs in a function of its own, because helpers reuse names such as
 * `wired`; it hands back only what is imported from it. The demo comes last, because it
 * calls the helpers as it loads.
 */
export async function packJs(slug: string, base: string, header: string): Promise<string> {
    const entry = resolve(demoDir(slug), 'main.ts');
    const modules: Module[] = [];
    const seen = new Set<string>();

    function visit(path: string): void {
        if (seen.has(path)) return;
        seen.add(path);

        const module = parseModule(path);
        for (const dependency of module.locals.keys()) visit(dependency);
        modules.push(module);
    }

    visit(entry);

    const wanted = new Map<string, Set<string>>();
    const packages = new Map<string, Set<string>>();
    for (const module of modules) {
        for (const [path, names] of module.locals) {
            wanted.set(path, new Set([...(wanted.get(path) ?? []), ...names]));
        }
        for (const [name, names] of module.packages) {
            packages.set(name, new Set([...(packages.get(name) ?? []), ...names]));
        }
    }

    const imports = [...packages]
        .filter(([, names]) => names.size)
        .map(([name, names]) => {
            const list = [...names].sort((a, b) => a.localeCompare(b)).join(', ');
            return `import { ${list} } from '${packageUrl(name)}';`;
        });

    const taken = new Set<string>();
    const sections: string[] = [];

    for (const module of modules) {
        const js = await toJavaScript(module.body, module.path);
        const heading = `// ---- ${label(module.path, slug)} ----`;

        if (module.path === entry) {
            sections.push(`${heading}\n\n${js}`);
            continue;
        }

        const names = [...(wanted.get(module.path) ?? [])];
        for (const name of names) {
            if (taken.has(name)) throw new Error(`${name} is exported by two helpers`);
            taken.add(name);
        }

        const list = names.join(', ');
        sections.push(
            `${heading}\n\nconst { ${list} } = (() => {\n${js}\n\nreturn { ${list} };\n})();`,
        );
    }

    const program = [header, imports.join('\n'), ...sections].filter(Boolean).join('\n\n');
    const options = (await resolveConfig(entry)) ?? {};

    return format(rewriteAssets(program, slug, base), { ...options, parser: 'babel' });
}

/** The whole pen for demo `slug`. */
export async function packDemo(slug: string, config: SiteConfig): Promise<Pen> {
    const manifest = readManifest(slug);
    const base = assetBase(config);
    const page = `${config.siteUrl}demos/${slug}/`;
    const header = [
        `// ${manifest.title}: ${page}`,
        '// The helpers the demo imports come first; the demo itself is at the bottom.',
    ].join('\n');

    return {
        slug,
        title: manifest.title,
        description: manifest.description,
        page,
        html: packHtml(slug, base, page),
        css: packCss(slug, base),
        js: await packJs(slug, base, header),
    };
}

/** The three panes in one page, to open from disk. */
export function standalonePage(pen: Pen): string {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${pen.title}</title>
<style>
${pen.css}</style>
</head>
<body>
${pen.html}
<script type="module">
${pen.js}</script>
</body>
</html>
`;
}

/**
 * What CodePen's prefill API takes: a form posting this as `data` to /pen/define. A demo
 * taller than the small stage gets the editors on the left, so the preview has the full
 * height of the window.
 */
export function prefill(pen: Pen, manifest: Pick<DemoManifest, 'group' | 'stage'>): string {
    return JSON.stringify({
        title: `${pen.title} · Lordicon UI Components`,
        description: `${pen.description}\n\nMore demos: ${pen.page}`,
        tags: ['lordicon', 'animated-icons', 'web-components', manifest.group],
        editors: '111',
        layout: manifest.stage === 'small' ? 'top' : 'left',
        html: pen.html,
        css: pen.css,
        js: pen.js,
    });
}
