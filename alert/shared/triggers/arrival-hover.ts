import { BaseTrigger } from './base.ts';

/**
 * An icon that greets the thing it labels: it plays as that thing arrives, and again
 * whenever the pointer comes to rest on it.
 *
 * The arrival is the harder half. An icon that animates while its card is still sliding in
 * reads as two movements fighting, so this waits for the card's own animations to settle
 * first. It watches for the card becoming visible rather than only for the element being
 * created, which covers a card inserted into the page, a page unhidden beside it, and one
 * scrolled into view — all of them arrivals as far as a reader is concerned.
 *
 * Entrance states usually start from nothing, so under reduced motion the icon jumps to
 * its finished frame rather than staying invisible.
 */
export class ArrivalHover extends BaseTrigger {
    /** An arrival that happened before the player could answer it. */
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
        // getAnimations() is empty until the card's animation has actually started.
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
