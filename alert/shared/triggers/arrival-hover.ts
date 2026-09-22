import { BaseTrigger } from './base.ts';

/**
 * Plays the icon when it comes into view, and again whenever the pointer enters the target.
 *
 * "Into view" is an IntersectionObserver on the icon, so it covers an element inserted into
 * the page, one unhidden, and one scrolled to. Before playing it waits for the target's own
 * animations to finish, so a card sliding in does not have an icon moving inside it.
 *
 *     Element.defineTrigger('arrival-hover', ArrivalHover);
 *
 * Under reduced motion the icon jumps to its last frame. Entrance states start invisible,
 * so staying on the first frame would hide it.
 */
export class ArrivalHover extends BaseTrigger {
    /** An arrival that happened before the player was ready. */
    private owed = false;

    onConnected(): void {
        const watcher = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) void this.arrive();
        });
        watcher.observe(this.element);
        this.disposable(() => watcher.disconnect());

        const onPointer = () => this.play();
        this.targetElement.addEventListener('pointerenter', onPointer);
        this.disposable(() => this.targetElement.removeEventListener('pointerenter', onPointer));
    }

    onReady(): void {
        if (!this.owed) return;

        this.owed = false;
        this.play();
    }

    private async arrive(): Promise<void> {
        // getAnimations() is empty until the target's animation has started, one frame later.
        await new Promise(requestAnimationFrame);
        if (!this.connected) return;

        const entrance = this.targetElement.getAnimations();
        await Promise.allSettled(entrance.map((animation) => animation.finished));
        if (!this.connected) return;

        if (this.player.ready) this.play();
        else this.owed = true;
    }

    private play(): void {
        if (!this.player.ready) return;

        if (this.prefersReducedMotion) this.player.seekToEnd();
        else this.player.playFromStart();
    }
}
