import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

/**
 * Draws attention when a control turns invalid, and stays quiet otherwise.
 *
 * Watches `aria-invalid` on the target and also listens for the native `invalid` event,
 * which fires on constraint validation before any attribute is set. That event does not
 * bubble, so the listener runs on the capture phase to catch it from an ancestor.
 *
 * The colour of an invalid control already carries the message; the movement only draws
 * the eye. So under reduced motion this trigger simply does nothing.
 */
export class InvalidAttention extends BaseTrigger {
    private invalid = false;

    private get isInvalid(): boolean {
        return this.targetElement.getAttribute('aria-invalid') === 'true';
    }

    onConnected(): void {
        this.disposable(observeAttribute(this.targetElement, 'aria-invalid', () => this.sync()));

        const onInvalid = () => this.attention();
        this.targetElement.addEventListener('invalid', onInvalid, true);
        this.disposable(() => this.targetElement.removeEventListener('invalid', onInvalid, true));
    }

    onReady(): void {
        // Take the current value without animating it — only later changes are news.
        this.invalid = this.isInvalid;
    }

    private sync(): void {
        if (!this.player.ready || this.isInvalid === this.invalid) return;

        this.invalid = this.isInvalid;
        if (this.invalid) this.attention();
    }

    private attention(): void {
        if (!this.player.ready || this.prefersReducedMotion) return;
        this.player.playFromStart();
    }
}
