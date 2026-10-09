/**
 * Pulls a named region out of a source file. Regions are marked with comments:
 *
 *     // #region wiring        <!-- #region markup -->
 *     ...                      ...
 *     // #endregion            <!-- #endregion -->
 *
 * Inside a region, `#skip` … `#endskip` collapses a stretch to an ellipsis.
 */

export class RegionError extends Error {}

const MARKER = /#(?:region|endregion|skip|endskip)\b/;
const REGION = /^[^\n]*#region\s+([\w-]+)[^\n]*$/;
const ENDREGION = /^[^\n]*#endregion[^\n]*$/;
const SKIP = /^([^\n]*?)\S*\s*#skip[^\n]*$/;
const ENDSKIP = /^[^\n]*#endskip[^\n]*$/;

/** Drops the indentation the region sits at, so it reads as top-level code. */
function dedent(lines: string[]): string[] {
    const indents = lines
        .filter((line) => line.trim())
        .map((line) => line.length - line.trimStart().length);

    const shortest = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.slice(shortest));
}

function ellipsis(indent: string, lang: string): string {
    return lang === 'html' ? `${indent}<!-- … -->` : `${indent}// …`;
}

/** Whether the file still carries any region marker. */
export function hasMarkers(source: string): boolean {
    return MARKER.test(source);
}

/** Every `#region` name in the file, in order, duplicates included. */
export function listRegions(source: string): string[] {
    return source
        .split('\n')
        .map((line) => REGION.exec(line)?.[1])
        .filter((name): name is string => name !== undefined);
}

export function extractRegion(source: string, name: string, where: string, lang = 'ts'): string {
    const lines = source.split('\n');
    const start = lines.findIndex((line) => REGION.exec(line)?.[1] === name);

    if (start === -1) {
        throw new RegionError(`${where}: no "#region ${name}"`);
    }

    const body: string[] = [];
    let index = start + 1;
    let closed = false;

    // Markers inside a skipped stretch are ignored, so a region may sit inside a skip.
    while (index < lines.length) {
        const line = lines[index];
        const skip = SKIP.exec(line);

        if (skip) {
            const closes = lines.findIndex(
                (candidate, at) => at > index && ENDSKIP.test(candidate),
            );
            if (closes === -1) {
                throw new RegionError(`${where}: "#skip" in region "${name}" is never closed`);
            }

            body.push(ellipsis(skip[1], lang));
            index = closes + 1;
            continue;
        }

        if (ENDREGION.test(line)) {
            closed = true;
            break;
        }

        if (REGION.test(line)) {
            throw new RegionError(`${where}: "#region ${name}" contains another region`);
        }

        body.push(line);
        index++;
    }

    if (!closed) {
        throw new RegionError(`${where}: "#region ${name}" is never closed`);
    }

    return dedent(body)
        .join('\n')
        .replace(/^\s*\n|\n\s*$/g, '');
}

/** The file without its region markers, for showing it whole. */
export function withoutMarkers(source: string): string {
    return source
        .split('\n')
        .filter((line) => !MARKER.test(line))
        .join('\n');
}
