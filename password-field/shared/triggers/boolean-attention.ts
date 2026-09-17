import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

/**
 * Plays the icon once, each time a boolean attribute on the target turns `"true"`.
 *
 * Where `booleanMorph` holds two looks and travels between them, this one has no second
 * look to hold: it is a reaction, not a state. Focus arriving in a field, a message
 * appearing — something happened, the icon acknowledges it, and nothing is left behind.
 *
 * Registered under one name per attribute, the same way the morphs are:
 *
 *     Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
 *     Element.defineTrigger('shown-attention', booleanAttention('data-shown'));
 *
 * `data-attribute` on the <lord-icon> overrides the attribute being watched.
 *
 * Under reduced motion it jumps to the played-out frame instead. That matters for an
 * entrance state like `in-reveal`, which starts from nothing: staying put would leave the
 * icon invisible rather than still.
 */
export function booleanAttention(defaultAttribute: string): TriggerConstructor {
    return class BooleanAttention extends BaseTrigger {
        /** What the icon last reacted to, so a repeated "true" is not news. */
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
            // Take the state it arrived in without playing: only later changes are news.
            this.on = this.isOn;
        }

        private sync(): void {
            if (!this.player.ready || this.isOn === this.on) return;

            this.on = this.isOn;
            if (!this.on) return;

            if (this.prefersReducedMotion) this.player.seekToEnd();
            else this.player.playFromStart();
        }
    };
}
