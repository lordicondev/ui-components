/**
 * A control's name, drawn.
 *
 * An icon button has a name whether or not anyone can see it — the words a screen reader
 * reads out. A tooltip is that same name made visible for everyone else, so this module
 * takes it literally: the element it shows is the one that already names the control.
 *
 *     <button type="button">
 *         <lord-icon … aria-hidden="true"></lord-icon>
 *         <span class="tooltip">Bullet list</span>
 *     </button>
 *
 * The button is called "Bullet list" because of that span, exactly as it would be without
 * any of this. The stylesheet lifts the span out of the flow and holds it at `opacity: 0`,
 * which keeps it in the accessibility tree — `display: none` or `visibility: hidden` would
 * take the name away with the picture. Nothing is duplicated and there is no `aria-*` to
 * keep in step, because there is only one copy of the word.
 *
 * What is left for script is timing: when the name is worth drawing, and how to put it
 * away again.
 */

/** How long the pointer has to stay on a control before its name is worth drawing. */
const OPEN_DELAY = 400;

/** How long a row of controls stays warm after a tooltip closes. */
const WARM = 300;

/**
 * Wires every `.tooltip` found under `root` to the control it names.
 *
 * Called once, for a page that keeps its controls. Nothing here needs taking apart, so
 * nothing is returned — a demo that replaced its toolbar would call it again.
 */
export function tooltips(root: ParentNode = document): void {
    const anchors = [...root.querySelectorAll<HTMLElement>('.tooltip')]
        .map((tooltip) => tooltip.parentElement)
        .filter((anchor) => anchor !== null);

    /**
     * The anchor whose name is on screen, or on its way there, and the timer that will put
     * it there. One name at a time, and every question about it is asked of one variable.
     */
    let wanted: HTMLElement | null = null;
    let opening: ReturnType<typeof setTimeout> | undefined;

    /**
     * True while the row has just had a tooltip open on it.
     *
     * The wait before the first one is there to stop a pointer crossing a toolbar from
     * flashing every name on its way past. Once a name has actually been read that wait
     * would only be in the way: moving one button along is a comparison, and answering it
     * half a second late reads as lag rather than as calm. So a tooltip closing leaves the
     * row warm and the next one opens at once, until the pointer has been away from every
     * control for long enough to have finished looking.
     */
    let warm = false;
    let cooling: ReturnType<typeof setTimeout> | undefined;

    /** The anchor whose tooltip Escape put away, left alone until the pointer moves on. */
    let dismissed: HTMLElement | null = null;

    /** True while the control has the kind of focus a focus ring would be drawn for. */
    const focused = (anchor: HTMLElement) => anchor.matches(':focus-visible, :has(:focus-visible)');

    /*
     * Closing is named rather than global, and that is not tidiness. Leaving one control is
     * no reason to take another control's name away, and a page has more than one thing
     * that can be left at a time: click a second button and the focus leaves the first one
     * in the same breath, which used to close the tooltip the pointer had just opened.
     */

    // #region settle
    /** Gives up on `anchor`: the name it has on screen, or the one on its way. */
    function close(anchor: HTMLElement): void {
        if (wanted !== anchor) return;

        clearTimeout(opening);
        wanted = null;
        if (!anchor.hasAttribute('data-tip')) return;

        anchor.removeAttribute('data-tip');
        warm = true;
        clearTimeout(cooling);
        cooling = setTimeout(() => (warm = false), WARM);
    }

    /** Draws `anchor`'s name, after whatever wait the row has earned. */
    function open(anchor: HTMLElement, immediately: boolean): void {
        if (anchor === wanted || anchor === dismissed) return;

        if (wanted) close(wanted);
        wanted = anchor;

        const wait = immediately || warm ? 0 : OPEN_DELAY;
        opening = setTimeout(() => anchor.setAttribute('data-tip', ''), wait);
    }
    // #endregion

    for (const anchor of anchors) {
        // A tap is not a hover: it would leave the name on screen with nothing to take it
        // off again, over content the finger is already reaching for.
        anchor.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') open(anchor, false);
        });

        anchor.addEventListener('pointerleave', () => {
            if (dismissed === anchor) dismissed = null;
            if (!focused(anchor)) close(anchor);
        });

        // Keyboard focus asks for the name outright, so it does not wait — and a pointer
        // that merely passed through is not asking at all, which is what focus-visible
        // already knows the difference between.
        anchor.addEventListener('focusin', () => {
            if (focused(anchor)) open(anchor, true);
        });

        anchor.addEventListener('focusout', () => {
            if (dismissed === anchor) dismissed = null;
            close(anchor);
        });
    }

    // Anything that appears over the page has to be dismissible without moving the pointer
    // off it. Escape does that, and the control it covers keeps the name it was given.
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !wanted) return;

        dismissed = wanted;
        close(wanted);
    });
}
