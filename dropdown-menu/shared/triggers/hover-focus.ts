import { BaseTrigger } from './base.ts';

/**
 * Plays the icon once when the pointer enters the target or keyboard focus lands on it.
 *
 * The built-in `hover` trigger only answers the pointer. This one also answers
 * `:focus-visible`, so tabbing through a list plays its icons too. Plain focus is not
 * enough: a click focuses as well, and the pointer has already played the icon.
 *
 * A second arrival mid-animation is dropped, so a pointer crossing a list does not cut
 * every icon off at its first frame.
 *
 *     Element.defineTrigger('hover-focus', HoverFocus);
 *
 * Under reduced motion nothing plays.
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
        if (this.player.playing) return;

        this.player.playFromStart();
    }
}
