/**
 * Test helper: pretend the viewer asked for reduced motion, and undo it afterwards.
 * Kept out of the test files so any suite can share it.
 */
export function withReducedMotion(reduce: boolean): () => void {
    const original = globalThis.matchMedia;

    globalThis.matchMedia = ((query: string) =>
        ({
            matches: reduce && query.includes('prefers-reduced-motion'),
            media: query,
            addEventListener() {},
            removeEventListener() {},
        }) as unknown as MediaQueryList) as typeof globalThis.matchMedia;

    return () => {
        globalThis.matchMedia = original;
    };
}
