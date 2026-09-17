import type { TriggerConstructor } from '@lordicon/element';
import { MorphTrigger } from './boolean-morph.ts';
import { observeAttribute } from './observe.ts';

/**
 * A morph that also answers a preview.
 *
 * Two booleans, two jobs. The first holds the icon's shape, and the icon travels between
 * its two looks on it exactly as `booleanMorph` does. The second is a promise rather than
 * a fact — the rating your pointer is hovering, the row you are about to pick — and the
 * icon answers it with its default state: a nudge that leaves nothing behind.
 *
 *     Element.defineTrigger('preview-morph', previewMorph('data-chosen', 'data-lit'));
 *
 * The nudge only happens on the way in, and only from the resting look. An icon already
 * holding the chosen shape has nothing to preview — it is showing more than a nudge could
 * say, and playing the default state would take that shape away in order to say it. That
 * is also why the promise going out is silent: withdrawing is not an event.
 *
 * Borrowing the player for the default state is why `MorphTrigger` has `borrowed`. A morph
 * arriving mid-nudge must take the player back to its own segment rather than reverse
 * whatever is playing, and only the trigger that lent it out knows the difference.
 */
export function previewMorph(shape: string, preview: string): TriggerConstructor {
    return class PreviewMorph extends MorphTrigger {
        protected get attribute(): string {
            return shape;
        }

        onConnected(): void {
            super.onConnected();
            this.disposable(observeAttribute(this.targetElement, preview, () => this.nudge()));
        }

        onComplete(): void {
            this.borrowed = false;
        }

        private nudge(): void {
            if (!this.player.ready) return;
            if (this.targetElement.getAttribute(preview) !== 'true') return;

            // Nothing left to add: it already holds the chosen look, it is on its way
            // there, or it is still nudging from a moment ago.
            if (this.on || this.player.playing || this.prefersReducedMotion) return;

            const resting = this.player.availableStates.find((state) => state.default);
            if (!resting) return;

            this.borrowed = true;
            this.player.direction = 1;
            this.player.switchSegment([resting.time, resting.time + resting.duration + 1]);

            // play(), not playFromStart(). The player's "start" is the start of whatever
            // `state` the markup asked for — the morph, here — so playFromStart would run
            // the morph in full, straight past the segment just loaded. switchSegment has
            // already parked the frame at the segment's own beginning.
            this.player.play();
        }
    };
}
