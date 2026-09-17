import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

/**
 * For an icon on a message that can be put up more than once.
 *
 * The target counts how many times the message has been raised: `data-raised="0"` while it
 * is not showing, `"1"` the first time, and up from there. Which way the count moves is the
 * whole point:
 *
 * - up from zero is an arrival, and plays the state the markup gave the icon — an
 *   entrance, usually, drawing itself from nothing;
 * - up again, while the message is still on screen, is the same message being repeated.
 *   The icon plays its default state instead: a nudge, not a second entrance. Replaying
 *   the arrival would say "here is something new", which would not be true.
 *
 * A repeat that lands while the icon is still playing is dropped rather than queued or
 * restarted. Someone leaning on the button is asking the same question faster than the
 * answer takes to give; cutting the nudge off at its start to begin it again reads as a
 * stutter, not as emphasis. An arrival is never dropped — that one really is news.
 *
 * Going back to zero is the message leaving, and the icon has nothing to add to that.
 *
 * Under reduced motion an arrival still jumps to the played-out frame, because an entrance
 * state starts from an empty one and standing still there would hide the icon. A repeat is
 * pure movement, so it is skipped entirely.
 */
export class RaisedAttention extends BaseTrigger {
    private raised = 0;

    /** The state the markup asked for, kept so a repeat can step off it and back. */
    private entrance: string | null = null;

    private get count(): number {
        return Number(this.targetElement.getAttribute('data-raised')) || 0;
    }

    onConnected(): void {
        this.disposable(observeAttribute(this.targetElement, 'data-raised', () => this.sync()));
    }

    onReady(): void {
        this.entrance = this.element.getAttribute('state');
        this.raised = this.count;
    }

    private sync(): void {
        if (!this.player.ready) return;

        const was = this.raised;
        this.raised = this.count;
        if (this.raised <= was) return;

        if (was === 0) {
            this.player.state = this.entrance;
            if (this.prefersReducedMotion) this.player.seekToEnd();
            else this.player.playFromStart();
            return;
        }

        // Still saying it. Saying it again from the top would only interrupt itself.
        if (this.player.playing || this.prefersReducedMotion) return;

        this.player.state = null;
        this.player.playFromStart();
    }
}
