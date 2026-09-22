/**
 * Whether the viewer asked for less motion. Script-driven animations have to check this
 * themselves; a media query only switches off CSS ones.
 */
export function prefersReducedMotion(): boolean {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
