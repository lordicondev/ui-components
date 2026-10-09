/**
 * Puts the contents of export/ on the standalone branch, one folder per demo at its root.
 *
 * That layout is what StackBlitz and giget read, so it has to be the branch root rather
 * than a subdirectory. The branch is a build artefact: it is rewritten each time, and
 * nothing else should ever be committed to it.
 *
 * Prints what it would do unless given --push. Run `npm run export` first.
 *
 *   npm run publish:export -- [--push] [--message "..."]
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadConfig, repoRoot } from './lib/config.ts';

const args = process.argv.slice(2);
const push = args.includes('--push');
const messageIndex = args.indexOf('--message');
const branch = loadConfig().repo.exportBranch;

const exportRoot = resolve(repoRoot, 'export');

function git(...command: string[]): string {
    return execFileSync('git', command, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

if (!existsSync(exportRoot) || readdirSync(exportRoot).length === 0) {
    console.error('export/ is empty — run `npm run export` first.');
    process.exit(1);
}

const demos = readdirSync(exportRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const head = git('rev-parse', '--short', 'HEAD');
const message = messageIndex === -1 ? `Export from ${head}` : args[messageIndex + 1];

if (!push) {
    console.log(`Would publish ${demos.length} demo(s) to the "${branch}" branch:`);
    for (const demo of demos) console.log(`  ${demo}/`);
    console.log(`\nCommit message: ${message}`);
    console.log('\nNothing was changed. Pass --push to publish.');
    process.exit(0);
}

// A worktree keeps the working copy untouched while the branch is rewritten.
const worktree = mkdtempSync(join(tmpdir(), 'export-'));
const exists = git('ls-remote', '--heads', 'origin', branch) !== '';

try {
    if (exists) {
        git('fetch', 'origin', `${branch}:refs/remotes/origin/${branch}`, '--force');
        git('worktree', 'add', '--force', worktree, `origin/${branch}`);
        git('-C', worktree, 'switch', '-C', branch);
    } else {
        git('worktree', 'add', '--force', '--orphan', '-b', branch, worktree);
    }

    // The branch mirrors export/ exactly; anything left over from last time goes.
    for (const entry of readdirSync(worktree)) {
        if (entry !== '.git') rmSync(join(worktree, entry), { recursive: true, force: true });
    }

    // CI installs and builds each export before publishing; leave those artefacts out.
    const LEFTOVERS = /(^|\/)(node_modules|dist)(\/|$)/;

    for (const demo of demos) {
        cpSync(resolve(exportRoot, demo), join(worktree, demo), {
            recursive: true,
            filter: (source) => !LEFTOVERS.test(source.slice(exportRoot.length)),
        });
    }

    git('-C', worktree, 'add', '-A');

    if (git('-C', worktree, 'status', '--porcelain') === '') {
        console.log('Nothing changed since the last publish.');
    } else {
        git('-C', worktree, 'commit', '-m', message);
        git('-C', worktree, 'push', 'origin', branch);
        console.log(`Published ${demos.length} demo(s) to "${branch}".`);
    }
} finally {
    git('worktree', 'remove', '--force', worktree);
}
