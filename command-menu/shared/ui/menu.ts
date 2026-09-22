/**
 * Arrow keys over the rows of a menu or a command palette.
 *
 *     <div class="menu popover" popover role="menu" tabindex="-1" data-keys>
 *         <button class="row" role="menuitem" data-choose>…</button>
 *
 * The element with `data-keys` holds focus and takes the key presses: the panel itself for
 * a menu, the search field for a palette. The rows are the `[data-choose]` elements inside
 * the panel, the same attribute popover.ts uses for rows that can be chosen.
 *
 * The cursor is `data-active="true"` on a row plus `aria-activedescendant` on the
 * controller, not focus, so a palette's field keeps focus while the list is walked. The
 * pointer moves the same cursor, so hover and keyboard share one state and one style.
 *
 * Not covered: typeahead, and scrolling a row into view.
 */

const ROW = '[data-choose]';

let wired = 0;

export type MenuOptions = {
    /** Which descendants are rows. Defaults to `[data-choose]`. */
    row?: string;
};

/** Wires every `[data-keys]` controller under `root`. Called once. */
export function menus(root: ParentNode = document, options: MenuOptions = {}): void {
    for (const keys of root.querySelectorAll<HTMLElement>('[data-keys]')) {
        wire(keys, options.row ?? ROW);
    }
}

function wire(keys: HTMLElement, selector: string): void {
    // The panel the rows live in. For a menu the controller is the panel itself.
    const panel = keys.closest<HTMLElement>('[popover]') ?? keys;
    const prefix = panel.id || `menu-${++wired}`;

    // Home and End belong to the caret when the controller is a text field.
    const typed = keys.matches('input, textarea');
    let active: HTMLElement | null = null;

    /** The rows that can be walked right now; a filter may have hidden some. */
    const live = (): HTMLElement[] =>
        [...panel.querySelectorAll<HTMLElement>(selector)].filter(
            (row) => !row.hidden && !row.closest('[hidden]'),
        );

    // `aria-activedescendant` names a row by id, so every row needs one.
    panel.querySelectorAll<HTMLElement>(selector).forEach((row, index) => {
        if (!row.id) row.id = `${prefix}-row-${index}`;
        if (!row.dataset.active) row.dataset.active = 'false';
    });

    /** Moves the cursor to `row`, or clears it with null. */
    const mark = (row: HTMLElement | null): void => {
        if (active) {
            active.dataset.active = 'false';
            if (active.getAttribute('role') === 'option')
                active.setAttribute('aria-selected', 'false');
        }

        active = row;
        if (!row) return keys.removeAttribute('aria-activedescendant');

        row.dataset.active = 'true';
        // A listbox option carries aria-selected; a menuitem has no such state.
        if (row.getAttribute('role') === 'option') row.setAttribute('aria-selected', 'true');
        keys.setAttribute('aria-activedescendant', row.id);
    };

    // The index is worked out on every press because a filter may have changed the list.
    // From no cursor, Down lands on the first row and Up on the last.
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

    // The pointer moves the same cursor. `pointerover` fires once per row entered.
    panel.addEventListener('pointerover', (event) => {
        const row = (event.target as Element).closest<HTMLElement>(selector);
        if (row && panel.contains(row) && row !== active) mark(row);
    });

    panel.addEventListener('pointerleave', () => mark(null));

    // A filter narrows the list by raising `input`; the cursor may have been on a row it hid.
    panel.addEventListener('input', () => {
        if (active && !live().includes(active)) mark(null);
    });

    // Opening focuses the controller so the first arrow key has somewhere to arrive.
    // `preventScroll`: a popover sits in the top layer and needs no scrolling into view.
    if (panel.matches('[popover]')) {
        panel.addEventListener('toggle', (event) => {
            mark(null);
            if ((event as ToggleEvent).newState === 'open') keys.focus({ preventScroll: true });
        });
    }
}
