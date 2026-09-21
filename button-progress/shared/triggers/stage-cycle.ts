import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { splitAtRatio, type Segment } from './boolean-morph.ts';
import { observeAttribute } from './observe.ts';

/**
 * An icon for work that takes a while: it keeps going while the work does, and confirms
 * when the work is finished.
 *
 * Three stages, read from one attribute — `"busy"`, `"done"`, and anything else meaning
 * idle. The icon loops its `loop-*` state through the first, morphs to its second look on
 * the second, and morphs back on the third. That is the whole of it from the outside.
 *
 *     Element.defineTrigger('stage-cycle', stageCycle('data-stage'));
 *
 * Inside, the one thing worth the trigger's existence is that the two halves are not
 * independent. Work rarely finishes on the beat, and cutting a loop off wherever it had
 * got to is the difference between an icon that stops and one that is stopped — so a
 * finish that lands mid-cycle is remembered and spent at the end of it. The stage is a
 * fact the moment it is written; only the picture waits.
 *
 * Which loop is `data-loop` on the <lord-icon>, or the first state named `loop-…` when
 * that is not given. Which morph is the ordinary `state` attribute, split at its ratio
 * exactly as `booleanMorph` splits it: forwards to confirm, backwards to forget.
 *
 * Under reduced motion every stage is a jump. There is no honest still frame for a loop,
 * so idle and busy both rest on the first look and only `done` shows the second.
 */
export function stageCycle(attribute: string): TriggerConstructor {
    return class StageCycle extends BaseTrigger {
        /** The loop, and the morph's two directions. Null until the player is ready. */
        private loop: Segment | null = null;
        private morph: [Segment, Segment] | null = null;

        /** What the target says, and what the icon has actually got round to showing. */
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
            this.loop = this.find(this.element.getAttribute('data-loop'));
            this.disposable(() => {
                this.player.direction = 1;
                this.player.switchSegment();
            });

            this.stage = this.wanted;
            this.settle();
        }

        /** Named, or the first loop the icon happens to have. */
        private find(name: string | null): Segment | null {
            const states = this.player.availableStates;
            const state = name
                ? states.find((candidate) => candidate.name === name)
                : states.find((candidate) => candidate.name.startsWith('loop-'));

            return state ? [state.time, state.time + state.duration + 1] : null;
        }

        // #region cycle
        private sync(): void {
            if (!this.player.ready || this.wanted === this.stage) return;

            this.stage = this.wanted;

            // Mid-loop, the new stage is owed rather than owing: onComplete spends it at
            // the end of the cycle, which is the whole point of this trigger.
            if (this.showing === 'busy' && this.player.playing) return;

            this.settle();
        }

        onComplete(): void {
            if (this.showing !== 'busy') return;

            if (this.stage === 'busy')
                this.play(this.loop); // round again
            else this.settle();
        }
        // #endregion

        /** Take the icon to whatever the stage now is, from wherever it is. */
        private settle(): void {
            const was = this.showing;
            this.showing = this.stage;

            if (this.stage === 'busy' && !this.prefersReducedMotion) {
                this.play(this.loop);
                return;
            }

            // Only the way back from a confirmed look is worth watching. Arriving at rest
            // from anywhere else — the first frame of all, or a loop that was called off —
            // is not a change anyone asked to see.
            const done = this.stage === 'done';
            const segment = this.morph?.[done ? 0 : 1] ?? null;

            if (this.prefersReducedMotion || (!done && was !== 'done')) {
                this.jump(segment);
                return;
            }

            this.play(segment);
        }

        /**
         * `play()`, never `playFromStart()`: the player's "start" is the start of whatever
         * `state` the markup asked for, so playFromStart would run the whole morph straight
         * past the segment just loaded. switchSegment has already parked the frame at that
         * segment's own beginning.
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
