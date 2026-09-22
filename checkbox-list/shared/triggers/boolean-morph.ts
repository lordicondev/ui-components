import type { TriggerConstructor } from '@lordicon/element';
import { BaseTrigger } from './base.ts';
import { observeAttribute } from './observe.ts';
import { splitAtRatio, type Segment } from './segments.ts';

/**
 * Keeps an icon's two looks in step with a boolean attribute on the target.
 *
 * With a morph state (`state="morph-close"`), the first half plays when the attribute turns
 * true and the second half when it turns false. Without one, the whole animation plays
 * forwards or backwards. A change that lands mid-animation reverses it in place.
 *
 * Which attribute to read is left to the subclass; `booleanMorph()` below is the usual one.
 */
export abstract class MorphTrigger extends BaseTrigger {
    /** The morph's two halves: into the second look, and back. Null without a morph state. */
    private segments: [Segment, Segment] | null = null;

    /** The look on screen. Null until the player is ready. */
    private showing: boolean | null = null;

    /** The look the loaded segment ends on when played forwards. */
    private segmentEndsOn: boolean | null = null;

    /** True while an animation this trigger started is still playing. */
    private steering = false;

    /** The attribute that holds the boolean. */
    protected abstract get attribute(): string;

    protected get on(): boolean {
        return this.targetElement.getAttribute(this.attribute) === 'true';
    }

    onConnected(): void {
        this.disposable(observeAttribute(this.targetElement, this.attribute, () => this.sync()));
    }

    onReady(): void {
        this.segments = splitAtRatio(this.player);
        this.disposable(() => {
            this.player.direction = 1;
            this.player.switchSegment();
        });

        // The attribute may have changed before the player was ready; start from its value now.
        this.jumpTo(this.on);
    }

    onComplete(): void {
        this.steering = false;
    }

    private sync(): void {
        if (!this.player.ready || this.on === this.showing) return;

        if (this.prefersReducedMotion) this.jumpTo(this.on);
        else this.animateTo(this.on);
    }

    /** Shows a look without animating: at start, and for every change under reduced motion. */
    private jumpTo(on: boolean): void {
        this.steering = false;
        this.player.direction = 1;

        if (this.segments) {
            this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
            this.segmentEndsOn = on;
            this.player.seekToEnd();
        } else if (on) {
            this.player.seekToEnd();
        } else {
            this.player.seekToStart();
        }

        this.showing = on;
    }

    private animateTo(on: boolean): void {
        if (!this.segments) {
            // The whole animation is the transition: forwards to get there, backwards to undo.
            this.player.direction = on ? 1 : -1;
        } else if (this.player.playing && this.steering) {
            // Interrupted mid-morph. Switching segments would jump to the other half's first
            // frame, so reverse or resume the half already loaded instead. The two halves
            // meet at the boundary, so either one reaches either look.
            this.player.direction = this.segmentEndsOn === on ? 1 : -1;
        } else {
            this.player.direction = 1;
            this.player.switchSegment(on ? this.segments[0] : this.segments[1]);
            this.segmentEndsOn = on;
        }

        this.steering = true;
        this.player.play();
        this.showing = on;
    }
}

/**
 * A morph driven by one boolean attribute on the target, "on" when it reads `"true"`.
 * Register one name per attribute:
 *
 *     Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));
 *     Element.defineTrigger('expanded-morph', booleanMorph('aria-expanded'));
 *
 * `data-attribute` on the `<lord-icon>` overrides the attribute for that one icon.
 */
export function booleanMorph(defaultAttribute: string): TriggerConstructor {
    return class BooleanMorph extends MorphTrigger {
        protected get attribute(): string {
            return this.element.getAttribute('data-attribute') ?? defaultAttribute;
        }
    };
}
