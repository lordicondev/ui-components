import type { TriggerConstructor } from '@lordicon/element';
import type { Player } from '@lordicon/web';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';

type Segment = [number, number];

/**
 * A Lordicon morph state carries a ratio, e.g. `morph-close:0.5`. Frames up to the ratio
 * are the transition into the second look; the rest are the transition back. Splitting
 * the state there gives us one segment per direction.
 */
function splitAtRatio(player: Player): [Segment, Segment] | null {
    const state = player.availableStates.find((candidate) => candidate.name === player.state);
    const ratio = state?.params.length ? parseFloat(state.params[0]) : NaN;

    if (!state || !(ratio > 0 && ratio <= 1)) {
        return null;
    }

    const boundary = state.time + Math.floor((state.duration + 1) * ratio);
    return [
        [state.time, boundary],
        [boundary, state.time + state.duration + 1],
    ];
}

/**
 * Follows a boolean attribute on the target element: "on" when it reads `"true"`.
 *
 * The same behaviour covers a press toggle, a disclosure and a checkbox, so it is
 * registered under one name per attribute rather than copied three times:
 *
 *     Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));
 *     Element.defineTrigger('expanded-morph', booleanMorph('aria-expanded'));
 *
 * `data-attribute` on the <lord-icon> overrides the attribute being watched.
 *
 * Icons with a morph state play the matching half. Icons without one play the whole
 * animation forwards or backwards instead, so the trigger is still useful for them.
 */
export function booleanMorph(defaultAttribute: string): TriggerConstructor {
    return class BooleanMorph extends BaseTrigger {
        private segments: [Segment, Segment] | null = null;

        /** What the icon currently shows. Null until the player is ready. */
        private shown: boolean | null = null;

        private get attribute(): string {
            return this.element.getAttribute('data-attribute') ?? defaultAttribute;
        }

        private get on(): boolean {
            return this.targetElement.getAttribute(this.attribute) === 'true';
        }

        onConnected(): void {
            // State can change before the player is ready; onReady reads it again.
            this.disposable(
                observeAttribute(this.targetElement, this.attribute, () => this.sync()),
            );
        }

        onReady(): void {
            this.segments = splitAtRatio(this.player);
            this.disposable(() => {
                this.player.direction = 1;
                this.player.switchSegment();
            });

            this.jumpTo(this.on);
        }

        private sync(): void {
            if (!this.player.ready) return;
            if (this.on === this.shown) return;

            if (this.prefersReducedMotion) {
                this.jumpTo(this.on);
            } else {
                this.animateTo(this.on);
            }
        }

        /** The starting look, and the reduced-motion path: no animation, just the result. */
        private jumpTo(on: boolean): void {
            this.player.direction = 1;

            if (this.segments) {
                this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
                this.player.seekToEnd();
            } else if (on) {
                this.player.seekToEnd();
            } else {
                this.player.seekToStart();
            }

            this.shown = on;
        }

        private animateTo(on: boolean): void {
            // Mid-animation, rewinding what is running beats jumping to another segment:
            // both segments meet at the boundary, so playing back lands on the right look.
            if (this.player.playing) {
                this.player.direction = -1;
            } else if (this.segments) {
                this.player.direction = 1;
                this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
            } else {
                this.player.direction = on ? 1 : -1;
            }

            this.player.play();
            this.shown = on;
        }
    };
}
