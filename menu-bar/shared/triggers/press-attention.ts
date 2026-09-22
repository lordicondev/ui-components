import { BaseTrigger } from './base.ts';

/**
 * Plays the icon once each time the target is clicked. `click` covers Enter and Space on
 * a native button too. A press mid-animation starts it again.
 *
 *     Element.defineTrigger('press-attention', PressAttention);
 *
 * Under reduced motion nothing plays: an attention animation ends where it started, so
 * there is no other frame to show.
 */
export class PressAttention extends BaseTrigger {
    onConnected(): void {
        const onPress = () => this.play();
        this.targetElement.addEventListener('click', onPress);
        this.disposable(() => this.targetElement.removeEventListener('click', onPress));
    }

    private play(): void {
        if (!this.player.ready || this.prefersReducedMotion) return;

        this.player.playFromStart();
    }
}
