/**
 * Whether the viewer asked for less movement.
 *
 * A media query cannot switch off a Web Animations animation the way it switches off a CSS
 * one, so anything driven from script has to ask this before it starts.
 *
 * `BaseTrigger` keeps its own copy of this check rather than importing it: every demo that
 * uses any trigger would otherwise carry shared/motion/ into its export for three lines.
 */
export function prefersReducedMotion(): boolean {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
