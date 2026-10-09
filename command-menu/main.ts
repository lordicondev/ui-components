import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();

import { fields } from '@shared/ui/field.ts';
import { menus } from '@shared/ui/menu.ts';
import { popovers } from '@shared/ui/popover.ts';

const palette = document.querySelector<HTMLElement>('.menu')!;
const search = document.querySelector<HTMLInputElement>('.field__input')!;
const empty = document.querySelector<HTMLElement>('.empty')!;

// The panel, the field and the arrow keys. menus() focuses the field when the palette
// opens, so you can type at once.
popovers(document, { reveal: '[data-reveal]' });
fields();
menus();

// ⌘K / Ctrl+K toggles the palette. preventDefault, because the browser may use the
// shortcut itself. The panel still places itself against the button popovers() wired it to.
document.addEventListener('keydown', (event) => {
    if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;

    event.preventDefault();
    palette.togglePopover();
});

const rows = [...palette.querySelectorAll<HTMLElement>('.row')];

// `hidden` takes a row out of the layout and the accessibility tree. The stylesheet hides
// a group whose rows are all hidden. The empty state needs `hidden` for the layout and
// data-shown for its icon, which cannot animate out of display: none.
search.addEventListener('input', () => {
    const wanted = search.value.trim().toLowerCase();
    for (const row of rows) row.hidden = !row.textContent!.toLowerCase().includes(wanted);

    const none = rows.every((row) => row.hidden);
    empty.hidden = !none;
    empty.dataset.shown = String(none);
});

// The palette opens empty. On beforetoggle, so the rows are back before the panel is
// measured and painted. Setting `value` raises no event, so `input` is raised by hand.
palette.addEventListener('beforetoggle', (event) => {
    if ((event as ToggleEvent).newState !== 'open' || !search.value) return;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
});
