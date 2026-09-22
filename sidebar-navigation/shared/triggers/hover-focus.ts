import { BaseTrigger } from './base.ts';

/**
 * Plays the icon once, every time the control is reached — by a pointer coming to rest on
 * it, or by the keyboard landing on it.
 *
 * The element's own built-in `hover` trigger is half of this and is the right answer for a
 * control you can only click. A navigation list is not one: tabbing down it is an ordinary
 * way to use it, and an icon that answers the mouse and ignores the keyboard makes the list
 * quieter for the person who most needs to know where they are.
 *
 * `:focus-visible` rather than plain focus, so a click does not play the icon twice —
 * clicking a link both moves the pointer onto it and focuses it, and only one of those is
 * news. The browser already decides which focus deserves to be seen; this asks it.
 *
 * A second arrival that lands while the icon is still playing is dropped rather than started
 * again. This is where a hover and a press part company: `pressAttention` restarts, because a
 * person pressing a button twice is asking twice and deserves an answer both times. Reaching a
 * control is not asking for anything. A pointer crossing a list, or going back to the row it
 * just left, would otherwise cut every animation off at its first frame and the list would
 * flicker rather than answer.
 *
 * Under reduced motion it does nothing at all, for the same reason `pressAttention` does not:
 * a hover state ends on the frame it started on, so there is no finished look to jump to and
 * leaving the icon alone is exactly right.
 */
export class HoverFocus extends BaseTrigger {
    onConnected(): void {
        const onPointer = () => this.play();
        const onFocus = () => {
            if (this.targetElement.matches(':focus-visible')) this.play();
        };

        this.targetElement.addEventListener('pointerenter', onPointer);
        this.targetElement.addEventListener('focus', onFocus);

        this.disposable(() => {
            this.targetElement.removeEventListener('pointerenter', onPointer);
            this.targetElement.removeEventListener('focus', onFocus);
        });
    }

    private play(): void {
        if (!this.player.ready || this.prefersReducedMotion) return;

        // Still answering the last one. Starting over would only interrupt itself.
        if (this.player.playing) return;

        this.player.playFromStart();
    }
}
