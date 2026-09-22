import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

/**
 * For an icon on something that can be raised more than once: a message shown again, a
 * count going up. The target's attribute holds a number.
 *
 * - up from 0: plays the state in the icon's `state` attribute (an entrance, usually)
 * - up again: plays the icon's default state instead, a nudge rather than a second entrance
 * - down: nothing
 *
 * A nudge that lands while the icon is still playing is dropped. Register one name per
 * attribute:
 *
 *     Element.defineTrigger('raised-attention', raisedAttention('data-raised'));
 *     Element.defineTrigger('count-attention', raisedAttention('data-count'));
 *
 * Under reduced motion the entrance jumps to its last frame and the nudge is skipped.
 */
export function raisedAttention(attribute: string): TriggerConstructor {
    return class RaisedAttention extends BaseTrigger {
        private raised = 0;

        /** The state from the markup, put back before each entrance. */
        private entrance: string | null = null;

        private get count(): number {
            return Number(this.targetElement.getAttribute(attribute)) || 0;
        }

        onConnected(): void {
            this.disposable(observeAttribute(this.targetElement, attribute, () => this.sync()));
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

            if (this.player.playing || this.prefersReducedMotion) return;

            this.player.state = null; // null selects the icon's default state
            this.player.playFromStart();
        }
    };
}
