/**
 * Eases a running CSS animation to a stop and back up to speed.
 *
 * `glide()` slows each element's animation to a halt while the pointer is over the element
 * or keyboard focus is inside it, and speeds it up again afterwards. It also eases the
 * animation in when the page loads. Only the playback rate changes, so the animation stays
 * off the main thread except for the moment a change takes. Touch is ignored.
 *
 *   glide(document.querySelectorAll('.row'));
 *
 * The element, or one of its descendants, carries the animation. Without one, for instance
 * under `prefers-reduced-motion`, the element is left alone.
 */

export type GlideOptions = {
    /** Milliseconds from standing still to full speed when the page loads. */
    start?: number;
    /** Milliseconds from full speed to a stop. */
    stop?: number;
    /** Milliseconds from a stop back to full speed. */
    resume?: number;
};

/** Quick at first, then settling: how a thing slows down against friction. */
export const easeOut = (p: number): number => 1 - (1 - p) ** 3;

/** Slow, quick, slow: how a thing gets going and then settles at its pace. */
export const easeInOut = (p: number): number => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);

export function glide(
    elements: Iterable<Element>,
    { start = 1600, stop = 700, resume = 1000 }: GlideOptions = {},
): void {
    for (const element of elements) {
        const animation = element.getAnimations({ subtree: true })[0];
        if (!animation) continue;

        let frame = 0;
        let hovered = false;
        let focused = false;

        // #region glide
        // Moves the playback rate from where it is to `to`.
        const ease = (to: number, duration: number, easing: (p: number) => number) => {
            cancelAnimationFrame(frame);
            const from = animation.playbackRate;
            const begin = performance.now();
            const step = (now: number) => {
                const p = Math.min((now - begin) / duration, 1);
                animation.playbackRate = from + (to - from) * easing(p);
                if (p < 1) frame = requestAnimationFrame(step);
            };
            frame = requestAnimationFrame(step);
        };
        const update = () =>
            hovered || focused ? ease(0, stop, easeOut) : ease(1, resume, easeInOut);

        element.addEventListener('pointerenter', (event) => {
            hovered = (event as PointerEvent).pointerType !== 'touch';
            update();
        });
        element.addEventListener('pointerleave', () => ((hovered = false), update()));
        element.addEventListener('focusin', (event) => {
            focused = (event.target as Element).matches(':focus-visible');
            update();
        });
        element.addEventListener('focusout', () => ((focused = false), update()));
        // #endregion

        animation.playbackRate = 0;
        ease(1, start, easeInOut);
    }
}
