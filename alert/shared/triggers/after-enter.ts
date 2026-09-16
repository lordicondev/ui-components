import { BaseTrigger } from './base.ts';

/**
 * Holds the icon back until the element it lives in has finished arriving, then plays it.
 *
 * An icon that animates while its card is still sliding in reads as noise. Waiting for
 * the container's own animations to settle makes the two feel like one movement.
 *
 * Entrance states usually start from nothing, so under reduced motion the icon jumps
 * straight to its finished frame rather than staying invisible.
 */
export class AfterEnter extends BaseTrigger {
    onReady(): void {
        if (this.prefersReducedMotion) {
            this.player.seekToEnd();
            return;
        }

        void this.playAfterEntrance();
    }

    private async playAfterEntrance(): Promise<void> {
        // getAnimations() is empty until the container's animation has actually started.
        await new Promise(requestAnimationFrame);
        if (!this.connected) return;

        const entrance = this.targetElement.getAnimations();
        await Promise.allSettled(entrance.map((animation) => animation.finished));
        if (!this.connected) return;

        this.player.playFromStart();
    }
}
