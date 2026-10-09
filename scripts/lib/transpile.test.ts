import { describe, expect, it } from 'vitest';
import { toJavaScript } from './transpile.ts';

/** The shapes a fragment can take, since a region is not always a whole program. */
describe('toJavaScript', () => {
    it('erases types from ordinary top-level code', async () => {
        const js = await toJavaScript(
            ['const wait: number = 500;', 'function offer(on: boolean): void {}'].join('\n'),
            'main.ts',
        );

        expect(js).toContain('const wait = 500;');
        expect(js).toContain('function offer(on) {}');
    });

    it('points imports at the files a browser would fetch', async () => {
        const js = await toJavaScript(
            "import { x } from '@shared/triggers/preview-morph.ts';",
            'main.ts',
        );

        expect(js).toContain("from '@shared/triggers/preview-morph.js'");
    });

    /** Bare methods are not a program; without the class wrapper the erasure mangled them. */
    it('keeps a class member whole, and its `this` with it', async () => {
        const js = await toJavaScript(
            [
                'private sync(): void {',
                '    if (this.showing === "busy") return;',
                '    this.settle();',
                '}',
            ].join('\n'),
            'preview-morph.ts',
        );

        expect(js).toContain('this.showing');
        expect(js).toContain('this.settle()');
        expect(js).not.toContain('private');
        expect(js).not.toContain(': void');
    });

    it('leaves a class member where the region put it, at no indent', async () => {
        const js = await toJavaScript('onComplete(): void {\n    this.settle();\n}', 'x.ts');

        expect(js.split('\n')[0]).toBe('onComplete() {');
    });

    it('names the file when a fragment cannot be read at all', async () => {
        await expect(toJavaScript('const ) = ;', 'broken.ts')).rejects.toThrow('broken.ts');
    });
});
