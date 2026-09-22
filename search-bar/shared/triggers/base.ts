import type { Trigger } from '@lordicon/element';
import type { Player } from '@lordicon/web';

/**
 * What every trigger in this project starts from.
 *
 * The element rebuilds a trigger whenever its `trigger` or `target` attribute changes, not
 * only when the element leaves the page. So everything a trigger sets up is registered
 * with `disposable()` and undone in `onDisconnected()`.
 *
 * Fields are assigned by hand because parameter properties are not erasable syntax, and
 * this project's TypeScript has to stay valid after its types are stripped.
 */
export abstract class BaseTrigger implements Trigger {
    protected player: Player;
    protected element: HTMLElement;
    protected targetElement: HTMLElement;

    private cleanups: Array<() => void> = [];
    private live = true;

    constructor(player: Player, element: HTMLElement, targetElement: HTMLElement) {
        this.player = player;
        this.element = element;
        this.targetElement = targetElement;
    }

    /** Registers something to undo when the trigger is torn down. */
    protected disposable(cleanup: () => void): void {
        this.cleanups.push(cleanup);
    }

    /** False once the trigger is torn down. Check it after an `await`. */
    protected get connected(): boolean {
        return this.live;
    }

    onDisconnected(): void {
        this.live = false;
        for (const cleanup of this.cleanups.splice(0)) cleanup();
    }

    /** Same check as shared/motion/reduced-motion.ts, kept here so triggers import nothing else. */
    protected get prefersReducedMotion(): boolean {
        return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    }
}
