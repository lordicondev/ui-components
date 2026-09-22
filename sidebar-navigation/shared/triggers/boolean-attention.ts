import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

/**
 * Plays the icon once each time a boolean attribute on the target turns `"true"`.
 *
 * Unlike `booleanMorph` there is no second look to hold: the icon reacts and comes back to
 * rest. Register one name per attribute:
 *
 *     Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
 *     Element.defineTrigger('shown-attention', booleanAttention('data-shown'));
 *
 * `data-attribute` on the `<lord-icon>` overrides the attribute for that one icon.
 *
 * A change that lands while the icon is still playing is dropped, so a pointer crossing a
 * row twice does not restart the animation.
 *
 * Under reduced motion the icon jumps to its last frame instead. That matters for an
 * entrance state such as `in-reveal`, which starts invisible.
 */
export function booleanAttention(defaultAttribute: string): TriggerConstructor {
    return class BooleanAttention extends BaseTrigger {
        /** The value last reacted to, so setting `"true"` again is not a change. */
        private on = false;

        private get attribute(): string {
            return this.element.getAttribute('data-attribute') ?? defaultAttribute;
        }

        private get isOn(): boolean {
            return this.targetElement.getAttribute(this.attribute) === 'true';
        }

        onConnected(): void {
            this.disposable(
                observeAttribute(this.targetElement, this.attribute, () => this.sync()),
            );
        }

        onReady(): void {
            // Take the starting value without playing; only later changes count.
            this.on = this.isOn;
        }

        private sync(): void {
            if (!this.player.ready || this.isOn === this.on) return;

            this.on = this.isOn;
            if (!this.on || this.player.playing) return;

            if (this.prefersReducedMotion) this.player.seekToEnd();
            else this.player.playFromStart();
        }
    };
}
