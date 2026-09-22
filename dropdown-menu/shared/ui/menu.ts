/**
 * Arrow keys over a list of rows.
 *
 * A menu you can only reach with Tab is a menu that has not been finished, and a command
 * palette you have to Tab through is not a command palette at all — you are typing in a field
 * and the answer you want is three rows down. This is the part of that the platform does not
 * give: the panel, the placing and the dismissing are all the browser's (see popover.ts), and
 * what is left is knowing which row you are on.
 *
 *     <div class="menu popover" popover role="menu" tabindex="-1" data-keys>
 *         <button class="row" role="menuitem" data-choose>…</button>
 *
 * One element carries `data-keys` — the *controller*, the thing that holds focus and takes the
 * key presses. The rows are whatever already carries `data-choose`, which is to say the rows
 * that are answers: the attribute that tells popover.ts a row can be chosen is the same one
 * that tells this a row can be arrowed to, and neither module had to invent a second.
 *
 * The cursor is an attribute rather than focus, and that is the whole design. In a palette the
 * field has to keep focus so you can keep typing, so `aria-activedescendant` is the only way
 * the list can be walked at all — and once one demo needs it, having the other use it too
 * means one mechanism instead of two that look alike. The controller is the panel itself for a
 * menu and the search field for a palette; nothing else changes.
 *
 * The pointer writes the same attribute. That is not tidiness: without it the mouse and the
 * keyboard each light a row of their own and you end up looking at two cursors. With it,
 * "hovered" and "arrowed to" are one state, the stylesheet says so in one rule, and an icon
 * watching `data-active` plays for either device without being told which.
 *
 * Not here, and deliberately: typeahead, and scrolling a row into view. Neither panel in this
 * repo is longer than the screen, and the first is a menu behaviour rather than a list one.
 */

/** What counts as a row, unless a caller says otherwise. */
const ROW = '[data-choose]';

export type MenuOptions = {
    /** Which descendants are rows. The default is the attribute that already means "a choice". */
    row?: string;
};

/**
 * Wires every `[data-keys]` controller under `root` to the rows it walks.
 *
 * Called once, for a page that keeps its controls — the same shape as `popovers()` and
 * `fields()`, and for the same reason: nothing here needs taking apart.
 */
export function menus(root: ParentNode = document, options: MenuOptions = {}): void {
    for (const keys of root.querySelectorAll<HTMLElement>('[data-keys]')) {
        wire(keys, options.row ?? ROW);
    }
}

function wire(keys: HTMLElement, selector: string): void {
    // The controller is either the panel or something inside it. Either way this is the box
    // the rows live in, and for a menu whose controller *is* the panel, `closest` finds itself.
    const panel = keys.closest<HTMLElement>('[popover]') ?? keys;

    // Home and End belong to the caret when there is one to move.
    const typed = keys.matches('input, textarea');
    let active: HTMLElement | null = null;

    /** The rows there are to walk right now — a filter may have taken most of them away. */
    const live = (): HTMLElement[] =>
        [...panel.querySelectorAll<HTMLElement>(selector)].filter(
            (row) => !row.hidden && !row.closest('[hidden]'),
        );

    // `aria-activedescendant` names a row by id, so every row has to have one; and every row
    // has to say it is not the cursor before it can be news that it has become the cursor.
    panel.querySelectorAll<HTMLElement>(selector).forEach((row, index) => {
        if (!row.id) row.id = `${panel.id || 'menu'}-row-${index}`;
        if (!row.dataset.active) row.dataset.active = 'false';
    });

    /** Move the cursor, or put it away. Both ends of the move are written here or nowhere. */
    const mark = (row: HTMLElement | null): void => {
        if (active) {
            active.dataset.active = 'false';
            if (active.getAttribute('role') === 'option')
                active.setAttribute('aria-selected', 'false');
        }

        active = row;
        if (!row) return keys.removeAttribute('aria-activedescendant');

        row.dataset.active = 'true';
        // A listbox option has to say it is chosen; a menuitem has no such state to be in.
        if (row.getAttribute('role') === 'option') row.setAttribute('aria-selected', 'true');
        keys.setAttribute('aria-activedescendant', row.id);
    };

    // #region walk
    /*
     * Down and up, wrapping, over the rows that are showing. The index is worked out fresh on
     * every press rather than kept, because a filter can have emptied half the list in
     * between — the row the cursor was on included. From nowhere, down lands on the first row
     * and up on the last, which is what makes the first press of either key useful.
     *
     * Enter presses the row, and from there it is the ordinary click path: popover.ts hears it,
     * raises `popover-choose` and puts the menus away.
     */
    keys.addEventListener('keydown', (event) => {
        const rows = live();
        const at = active ? rows.indexOf(active) : -1;
        const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
        const first = step > 0 ? 0 : rows.length - 1;

        if (step !== 0)
            mark(rows[at < 0 ? first : (at + step + rows.length) % rows.length] ?? null);
        else if (event.key === 'Enter' && active) active.click();
        else if (!typed && event.key === 'Home') mark(rows[0] ?? null);
        else if (!typed && event.key === 'End') mark(rows.at(-1) ?? null);
        else return;

        event.preventDefault();
    });
    // #endregion

    // #region point
    /*
     * The pointer moves the same cursor, so there is only ever one.
     *
     * `pointerover` rather than `pointermove`: it arrives once, when the pointer crosses into a
     * row, which is exactly the moment the cursor should move and exactly as often.
     *
     * Leaving the panel puts the cursor away rather than leaving the last row lit — a row you
     * have finished pointing at is not a row you are on. The keyboard cursor goes with it,
     * which is right too: you chose the mouse.
     */
    panel.addEventListener('pointerover', (event) => {
        const row = (event.target as Element).closest<HTMLElement>(selector);
        if (row && panel.contains(row) && row !== active) mark(row);
    });

    panel.addEventListener('pointerleave', () => mark(null));
    // #endregion

    // Whatever narrows the list says so by raising `input` — a field being typed in, or being
    // emptied by its own clear button — and the row the cursor was on may have gone with it.
    panel.addEventListener('input', () => {
        if (active && !live().includes(active)) mark(null);
    });

    // A panel that opens is a list nobody has started walking yet. Focus goes to the controller
    // so the first arrow key has somewhere to arrive; the placing stays popover.ts's business.
    //
    // `preventScroll` because a popover is in the top layer and is already where it wants to be:
    // there is nothing to scroll into view, and asking costs a layout flush in the same frame
    // the panel is trying to start its opening animation in.
    if (panel.matches('[popover]')) {
        panel.addEventListener('toggle', (event) => {
            mark(null);
            if ((event as ToggleEvent).newState === 'open') keys.focus({ preventScroll: true });
        });
    }
}
