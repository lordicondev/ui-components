import type { Trigger } from '@lordicon/element';
import type { Player } from '@lordicon/web';

/**
 * Shared plumbing for our triggers.
 *
 * A trigger is rebuilt whenever `trigger` or `target` changes, not only when the element
 * leaves the page, so anything it sets up has to be undone. Registering teardown next to
 * the setup keeps the two from drifting apart.
 *
 * Note the explicit fields: parameter properties would be neater, but they are not
 * erasable syntax, and this project has to survive having its types stripped.
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

    protected disposable(cleanup: () => void): void {
        this.cleanups.push(cleanup);
    }

    /** False once the trigger is torn down — worth checking after an await. */
    protected get connected(): boolean {
        return this.live;
    }

    onDisconnected(): void {
        this.live = false;
        for (const cleanup of this.cleanups.splice(0)) cleanup();
    }

    /** These animations report a state change, so when motion is unwelcome we jump to it. */
    protected get prefersReducedMotion(): boolean {
        return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    }
}
