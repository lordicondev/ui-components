import type { SiteConfig } from './config.ts';

/** Site-relative paths; the portal prefixes them if it is served from a subdirectory. */
export type DemoLinks = {
    /** The demo page inside the portal. */
    page: string;
    /** The built demo on its own, no portal chrome around it. */
    app: string;
    zip: string;
    /** The ready-to-run copy on the standalone branch. */
    github: string;
    stackblitz: string;
    /** A giget command to paste into a terminal. The last word names the folder it writes. */
    terminal: string;
    /** The demo as it lives in the repo, for people reading the whole project. */
    source: string;
};

/** The project repo. */
export function repoUrl(config: SiteConfig): string {
    return `https://github.com/${config.repo.owner}/${config.repo.name}`;
}

export function demoLinks(config: SiteConfig, slug: string): DemoLinks {
    const { owner, name, branch, exportBranch } = config.repo;
    const base = `/demos/${slug}/`;

    return {
        page: base,
        app: `${base}app/`,
        zip: `${base}${slug}.zip`,
        github: `https://github.com/${owner}/${name}/tree/${exportBranch}/${slug}`,
        stackblitz: `https://stackblitz.com/github/${owner}/${name}/tree/${exportBranch}/${slug}`,
        terminal: `npx giget@latest gh:${owner}/${name}/${slug}#${exportBranch} ${slug}`,
        source: `https://github.com/${owner}/${name}/tree/${branch}/demos/${slug}`,
    };
}
