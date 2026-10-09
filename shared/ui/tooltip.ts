/**
 * Tooltips for icon buttons. The tooltip is the button's accessible name, made visible:
 *
 *     <button type="button">
 *         <lord-icon … aria-hidden="true"></lord-icon>
 *         <span class="tooltip">Bullet list</span>
 *     </button>
 *
 * tooltip.css keeps the span at `opacity: 0`, so it still names the button for a screen
 * reader. This module sets `data-tip` on the button while the name should be visible.
 */

/** How long the pointer rests on a control before its name shows. */
const OPEN_DELAY = 400;

/** After a tooltip closes, the next one in the row opens at once for this long. */
const WARM = 300;

/** Wires every `.tooltip` under `root` to the element it sits in. Called once. */
export function tooltips(root: ParentNode = document): void {
    const anchors = [...root.querySelectorAll<HTMLElement>('.tooltip')]
        .map((tooltip) => tooltip.parentElement)
        .filter((anchor) => anchor !== null);

    /** The anchor whose name is shown or about to be, and the timer showing it. */
    let wanted: HTMLElement | null = null;
    let opening: ReturnType<typeof setTimeout> | undefined;

    /** True just after a tooltip closed. Moving along a toolbar should not wait again. */
    let warm = false;
    let cooling: ReturnType<typeof setTimeout> | undefined;

    /** The anchor whose tooltip Escape closed; left alone until the pointer moves on. */
    let dismissed: HTMLElement | null = null;

    const focused = (anchor: HTMLElement) => anchor.matches(':focus-visible, :has(:focus-visible)');

    /** Closes `anchor`'s tooltip, if it is the one showing. Other anchors are left alone. */
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

    function open(anchor: HTMLElement, immediately: boolean): void {
        if (anchor === wanted || anchor === dismissed) return;

        if (wanted) close(wanted);
        wanted = anchor;

        const wait = immediately || warm ? 0 : OPEN_DELAY;
        opening = setTimeout(() => anchor.setAttribute('data-tip', ''), wait);
    }

    for (const anchor of anchors) {
        // A touch is not a hover: nothing would take the tooltip away again.
        anchor.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') open(anchor, false);
        });

        anchor.addEventListener('pointerleave', () => {
            if (dismissed === anchor) dismissed = null;
            if (!focused(anchor)) close(anchor);
        });

        // Keyboard focus shows the name at once. Focus from a click does not count.
        anchor.addEventListener('focusin', () => {
            if (focused(anchor)) open(anchor, true);
        });

        anchor.addEventListener('focusout', () => {
            if (dismissed === anchor) dismissed = null;
            close(anchor);
        });
    }

    // Escape closes the tooltip without moving the pointer off it.
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !wanted) return;

        dismissed = wanted;
        close(wanted);
    });
}
