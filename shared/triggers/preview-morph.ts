import {
    BaseTrigger,
    defaultState,
    Morpher,
    stateSegment,
    type TriggerContext,
} from '@lordicon/element';

/**
 * A morph that also plays a preview. The first value is the boolean the icon morphs on, as
 * in the built-in `follow`. `preview` names a second one: when it turns true while the icon
 * is at rest, the icon plays its default state once and nothing else changes. The rating
 * uses it for the stars under the pointer.
 *
 *     <lord-icon trigger="preview-morph(data-chosen, preview=data-lit)" state="morph-select">
 *
 *     defineElement({ triggers: { 'preview-morph': PreviewMorph } });
 *
 * Under reduced motion the morph jumps and the preview is left out.
 */
export class PreviewMorph extends BaseTrigger {
    static readonly primary = 'attr';

    #morpher: Morpher;

    constructor(context: TriggerContext) {
        super(context);
        this.#morpher = new Morpher(this.player, this.ratio());

        this.watch(this.target, this.option('attr', 'data-chosen'), () => this.morph());
        this.watch(this.target, this.option('preview', 'data-lit'), () => this.preview());
        this.signal.addEventListener('abort', () => this.#morpher.restore(), { once: true });
    }

    onReady(): void {
        this.#morpher.start(this.read('attr', 'data-chosen'));
    }

    onComplete(): void {
        this.#morpher.complete();
    }

    private read(option: string, fallback: string): boolean {
        return this.target.getAttribute(this.option(option, fallback)) === 'true';
    }

    private morph(): void {
        const on = this.read('attr', 'data-chosen');
        if (!this.player.ready || this.#morpher.showing === on) return;

        if (this.reducedMotion) this.#morpher.jump(on);
        else this.#morpher.animate(on);
    }

    private preview(): void {
        if (!this.player.ready || !this.read('preview', 'data-lit')) return;

        // Nothing to preview when the icon already holds, or is on its way to, the chosen
        // look; and no second preview while the first one plays.
        if (this.#morpher.showing || this.player.playing || this.reducedMotion) return;

        const resting = defaultState(this.player.states);
        if (resting) void this.player.play({ segment: stateSegment(resting) });
    }
}
