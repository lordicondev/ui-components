import type { TriggerConstructor } from '@lordicon/element';
import { MorphTrigger } from './boolean-morph.ts';
import { observeAttribute } from './observe.ts';
import { stateSegment } from './segments.ts';

/**
 * A morph that also plays a preview.
 *
 * `shape` is the boolean the icon morphs on, exactly as in `booleanMorph`. `preview` is a
 * second boolean: when it turns true while the icon is at rest, the icon plays its default
 * state once. Nothing changes afterwards. The rating demo uses it for the stars under the
 * pointer.
 *
 *     Element.defineTrigger('preview-morph', previewMorph('data-chosen', 'data-lit'));
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

        private nudge(): void {
            if (!this.player.ready) return;
            if (this.targetElement.getAttribute(preview) !== 'true') return;

            // Nothing to preview when the icon already holds, or is on its way to, the
            // chosen look; and no second nudge while the first one plays.
            if (this.on || this.player.playing || this.prefersReducedMotion) return;

            const resting = this.player.availableStates.find((state) => state.default);
            if (!resting) return;

            this.player.direction = 1;
            this.player.switchSegment(stateSegment(resting));
            // play(), not playFromStart(): playFromStart() rewinds to the start of the
            // `state` attribute's segment, not to the segment just loaded.
            this.player.play();
        }
    };
}
