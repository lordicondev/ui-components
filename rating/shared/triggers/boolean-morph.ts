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
 * Two looks, and the travel between them, kept in step with one boolean.
 *
 * Which attribute holds that boolean is left open, so a trigger built on this one can read
 * it from somewhere else or answer a second attribute alongside it. `booleanMorph` below
 * is the plain case, and the only one most demos need.
 */
export abstract class MorphTrigger extends BaseTrigger {
    private segments: [Segment, Segment] | null = null;

    /** What the icon currently shows. Null until the player is ready. */
    private shown: boolean | null = null;

    /** Which look the loaded segment arrives at when it runs forwards. */
    private forwardShows: boolean | null = null;

    /**
     * True while something other than the morph has the player. A trigger built on this
     * one sets it when it borrows the player for a state of its own; the morph then knows
     * that what is playing is not its own travel, and takes the player back rather than
     * steering something it did not start.
     */
    protected borrowed = false;

    /** Where the look is written down. */
    protected abstract get attribute(): string;

    /** What that attribute says right now. */
    protected get on(): boolean {
        return this.targetElement.getAttribute(this.attribute) === 'true';
    }

    onConnected(): void {
        // State can change before the player is ready; onReady reads it again.
        this.disposable(observeAttribute(this.targetElement, this.attribute, () => this.sync()));
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
        this.borrowed = false;
        this.player.direction = 1;

        if (this.segments) {
            this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
            this.forwardShows = on;
            this.player.seekToEnd();
        } else if (on) {
            this.player.seekToEnd();
        } else {
            this.player.seekToStart();
        }

        this.shown = on;
    }

    private animateTo(on: boolean): void {
        if (!this.segments) {
            // The whole animation is the transition: forwards arrives, back undoes it.
            this.player.direction = on ? 1 : -1;
        } else if (this.player.playing && !this.borrowed) {
            // Mid-flight, steering the segment already loaded beats switching to the
            // other one, which would restart at its first frame and jump the icon.
            // The two meet at the boundary, so either can reach either look — which
            // way round depends on the segment, not on what the icon was last asked
            // for. Always reversing is what lets a third quick click strand it.
            this.player.direction = this.forwardShows === on ? 1 : -1;
        } else {
            this.borrowed = false;
            this.player.direction = 1;
            this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
            this.forwardShows = on;
        }

        this.player.play();
        this.shown = on;
    }
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
    return class BooleanMorph extends MorphTrigger {
        protected get attribute(): string {
            return this.element.getAttribute('data-attribute') ?? defaultAttribute;
        }
    };
}
