import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export type RepoConfig = {
    owner: string;
    name: string;
    branch: string;
    exportBranch: string;
};

export type SiteConfig = {
    name: string;
    title: string;
    description: string;
    siteUrl: string;
    repo: RepoConfig;
};

/**
 * The project name and the addresses derived from it. Environment variables override the
 * file, for CI. A site in a subdirectory puts the path in `siteUrl`.
 */
export function loadConfig(): SiteConfig {
    const file = JSON.parse(
        readFileSync(resolve(repoRoot, 'site.config.json'), 'utf8'),
    ) as SiteConfig;

    const siteUrl = process.env.SITE_URL ?? file.siteUrl;

    return {
        name: process.env.SITE_NAME ?? file.name,
        title: process.env.SITE_TITLE ?? file.title,
        description: file.description,
        siteUrl: siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`,
        repo: {
            owner: process.env.REPO_OWNER ?? file.repo.owner,
            name: process.env.REPO_NAME ?? file.repo.name,
            branch: process.env.REPO_BRANCH ?? file.repo.branch,
            exportBranch: process.env.REPO_EXPORT_BRANCH ?? file.repo.exportBranch,
        },
    };
}
