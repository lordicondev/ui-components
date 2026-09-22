import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';
import { splitAtRatio, stateSegment, type Segment } from './segments.ts';

/**
 * An icon for work that takes a while. Reads one attribute with three values: `"busy"`,
 * `"done"`, and anything else for idle.
 *
 * - busy: loops the icon's `loop-*` state (or the one named in `data-loop` on the icon)
 * - done: plays the first half of the morph in the `state` attribute
 * - idle: plays the second half back, if the icon was showing done
 *
 * A change that lands mid-loop waits for the loop to finish its round, so the icon never
 * stops halfway through a turn.
 *
 *     Element.defineTrigger('stage-cycle', stageCycle('data-stage'));
 *
 * Under reduced motion nothing plays: idle and busy show the first look, done the second.
 */
export function stageCycle(attribute: string): TriggerConstructor {
    return class StageCycle extends BaseTrigger {
        private loop: Segment | null = null;
        private morph: [Segment, Segment] | null = null;

        /** What the target says, and what the icon has got round to showing. */
        private stage = 'idle';
        private showing = 'idle';

        private get wanted(): string {
            return this.targetElement.getAttribute(attribute) ?? 'idle';
        }

        onConnected(): void {
            this.disposable(observeAttribute(this.targetElement, attribute, () => this.sync()));
        }

        onReady(): void {
            this.morph = splitAtRatio(this.player);
            this.loop = this.findLoop(this.element.getAttribute('data-loop'));
            this.disposable(() => {
                this.player.direction = 1;
                this.player.switchSegment();
            });

            this.stage = this.wanted;
            this.settle();
        }

        /** The named loop state, or the first state named `loop-…`. */
        private findLoop(name: string | null): Segment | null {
            const states = this.player.availableStates;
            const state = name
                ? states.find((candidate) => candidate.name === name)
                : states.find((candidate) => candidate.name.startsWith('loop-'));

            return state ? stateSegment(state) : null;
        }

        private sync(): void {
            if (!this.player.ready || this.wanted === this.stage) return;

            this.stage = this.wanted;

            // Mid-loop: let the round finish. onComplete picks the new stage up.
            if (this.showing === 'busy' && this.player.playing) return;

            this.settle();
        }

        onComplete(): void {
            if (this.showing !== 'busy') return;

            if (this.stage === 'busy') this.play(this.loop);
            else this.settle();
        }

        /** Takes the icon to the current stage from wherever it is. */
        private settle(): void {
            const was = this.showing;
            this.showing = this.stage;

            if (this.stage === 'busy' && !this.prefersReducedMotion) {
                this.play(this.loop);
                return;
            }

            const done = this.stage === 'done';
            const segment = this.morph?.[done ? 0 : 1] ?? null;

            // The way back is only worth playing from a confirmed look. Arriving at idle
            // from the start, or from a loop that was called off, is a jump.
            if (this.prefersReducedMotion || (!done && was !== 'done')) {
                this.jump(segment);
                return;
            }

            this.play(segment);
        }

        /**
         * play(), not playFromStart(): playFromStart() rewinds to the start of the `state`
         * attribute's segment, not to the segment just loaded.
         */
        private play(segment: Segment | null): void {
            this.player.direction = 1;
            if (segment) this.player.switchSegment(segment);
            this.player.play();
        }

        private jump(segment: Segment | null): void {
            this.player.direction = 1;
            if (segment) this.player.switchSegment(segment);
            this.player.seekToEnd();
        }
    };
}
