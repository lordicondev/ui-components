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
 * Under reduced motion it does nothing at all, for the same reason `pressAttention` does
 * not: a hover state ends on the frame it started on, so there is no finished look to jump
 * to and leaving the icon alone is exactly right.
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

        this.player.playFromStart();
    }
}
