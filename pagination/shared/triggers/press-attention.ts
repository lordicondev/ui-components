import { BaseTrigger } from './base.ts';

/**
 * Plays the icon once, every time the control it sits on is pressed.
 *
 * There is no state behind this one. A tool that opens a menu or inserts a list leaves
 * nothing on the button to look at afterwards, so the icon is not showing a state — it is
 * the receipt for the press, and the button is exactly as it was a second later.
 *
 * `click` rather than `pointerdown`, so the keyboard is included without a line of its own:
 * a native button fires it for Enter and Space as surely as for a tap.
 *
 * A press that lands mid-play starts the animation again. `raisedAttention` drops that one
 * instead, and the difference is who is repeating themselves: there, an application putting
 * the same message up twice, which the icon has nothing to add to; here, a person pressing
 * the button again, which it would be rude to ignore. A button that answered every other
 * press would read as broken rather than as calm.
 *
 * Under reduced motion it does nothing at all. The state of an attention animation is the
 * same at both ends — the icon starts at rest and finishes there — so unlike an entrance,
 * there is no finished frame worth jumping to.
 */
export class PressAttention extends BaseTrigger {
    onConnected(): void {
        const onPress = () => this.play();
        this.targetElement.addEventListener('click', onPress);
        this.disposable(() => this.targetElement.removeEventListener('click', onPress));
    }

    private play(): void {
        if (!this.player.ready || this.prefersReducedMotion) return;

        this.player.playFromStart();
    }
}
