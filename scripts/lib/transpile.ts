import { format, resolveConfig, type Options } from 'prettier';
import tsBlankSpace from 'ts-blank-space';

let projectStyle: Options | null = null;

/** The repo's Prettier settings. */
async function style(filePath: string): Promise<Options> {
    projectStyle ??= (await resolveConfig(filePath)) ?? {};
    return projectStyle;
}

const CLASS_SHELL = 'class Fragment {';

/**
 * Whether the snippet is a bare class body (methods cut out of a class) that has to be
 * wrapped in a class before parsing. A parser given bare methods guesses wrong, and the
 * type erasure then deletes the wrong things. Prettier's parse is the test.
 */
async function needsClass(source: string, options: Options): Promise<boolean> {
    try {
        await format(source, { ...options, parser: 'typescript' });
        return false;
    } catch {
        return true;
    }
}

/**
 * Removes the class wrapper and one level of indent. Lines that do not start with the
 * indent, such as the inside of a template literal, are left alone.
 */
function unwrapClass(formatted: string, options: Options): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.tabWidth ?? 2);

    return formatted
        .trimEnd()
        .split('\n')
        .slice(1, -1)
        .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
        .join('\n');
}

/**
 * The JavaScript half of the TS | JS switch. ts-blank-space replaces type syntax with
 * spaces and touches nothing else; Prettier then closes the gaps. This works because the
 * project is written in erasable syntax.
 */
export async function toJavaScript(source: string, filePath: string): Promise<string> {
    const options = await style(filePath);
    const inClass = await needsClass(source, options);
    const program = inClass ? `${CLASS_SHELL}\n${source}\n}` : source;

    const stripped = tsBlankSpace(program, (node) => {
        throw new Error(`${filePath}: cannot erase types here — ${node.getText().slice(0, 60)}`);
    });

    // Point imports at .js files.
    const retargeted = stripped.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');

    let formatted: string;
    try {
        formatted = await format(retargeted, { ...options, parser: 'typescript' });
    } catch (error) {
        // Name the file; the parser's error does not.
        throw new Error(`${filePath}: cannot format as JavaScript`, { cause: error });
    }

    return inClass ? unwrapClass(formatted, options) : formatted.trimEnd();
}
