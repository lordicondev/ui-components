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

/** The line that stands for a skipped stretch, as a comment in the fragment's language. */
function ellipsis(indent: string, lang: string): string {
    if (lang === 'html') return `${indent}<!-- … -->`;
    if (lang === 'css') return `${indent}/* … */`;
    return `${indent}// …`;
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

/** A line of the region, or a skipped stretch with the indentation of its `#skip`. */
type Piece = { line: string } | { skip: string; hidden: string[] };

/** Reads a region into lines and skipped stretches, dedented together. */
function readRegion(source: string, name: string, where: string): Piece[] {
    const lines = source.split('\n');
    const start = lines.findIndex((line) => REGION.exec(line)?.[1] === name);

    if (start === -1) {
        throw new RegionError(`${where}: no "#region ${name}"`);
    }

    const pieces: Piece[] = [];
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

            const hidden = lines.slice(index + 1, closes).filter((line) => !MARKER.test(line));
            pieces.push({ skip: skip[1], hidden });
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

        pieces.push({ line });
        index++;
    }

    if (!closed) {
        throw new RegionError(`${where}: "#region ${name}" is never closed`);
    }

    // Drop the indentation the region sits at, so it reads as top-level code.
    const indents = pieces
        .flatMap((piece) => ('line' in piece ? [piece.line] : []))
        .filter((line) => line.trim())
        .map((line) => line.length - line.trimStart().length);
    const shortest = indents.length ? Math.min(...indents) : 0;

    return pieces.map((piece) =>
        'line' in piece
            ? { line: piece.line.slice(shortest) }
            : {
                  skip: piece.skip.slice(shortest),
                  hidden: piece.hidden.map((line) => line.slice(shortest)),
              },
    );
}

const trimBlankEdges = (text: string) => text.replace(/^\s*\n|\n\s*$/g, '');

/** The region as one text, each skipped stretch shown as a commented ellipsis. */
export function extractRegion(source: string, name: string, where: string, lang = 'ts'): string {
    const lines = readRegion(source, name, where).map((piece) =>
        'line' in piece ? piece.line : ellipsis(piece.skip, lang),
    );
    return trimBlankEdges(lines.join('\n'));
}

/**
 * The region for the portal: the parts shown between skipped stretches, the indentation of
 * each skip, and the whole region with nothing skipped, which is what Copy copies.
 */
export function extractFragment(
    source: string,
    name: string,
    where: string,
): { parts: string[]; skips: string[]; full: string } {
    const parts: string[][] = [[]];
    const skips: string[] = [];
    const full: string[] = [];

    for (const piece of readRegion(source, name, where)) {
        if ('line' in piece) {
            parts[parts.length - 1].push(piece.line);
            full.push(piece.line);
        } else {
            skips.push(piece.skip);
            parts.push([]);
            full.push(...piece.hidden);
        }
    }

    return {
        parts: parts.map((lines) => trimBlankEdges(lines.join('\n'))),
        skips,
        full: trimBlankEdges(full.join('\n')),
    };
}

/** The file without its region markers, for showing it whole. */
export function withoutMarkers(source: string): string {
    return source
        .split('\n')
        .filter((line) => !MARKER.test(line))
        .join('\n');
}
