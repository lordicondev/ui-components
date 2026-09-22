// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';

// Four names, one trigger. Each of these is a boolean attribute on the thing the icon sits in,
// and each icon plays once when its own turns true: the cursor arriving on a row, focus
// arriving in the field, something worth clearing, a search that found nothing.
//
// `data-active` is the one worth a second look. It is written by the arrow keys and by the
// pointer alike, so the row's icon answers the state rather than the device — the same play
// for a mouse crossing the row and a cursor landing on it from the keyboard.
Element.defineTrigger('active-attention', booleanAttention('data-active'));
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));
Element.defineTrigger('shown-attention', booleanAttention('data-shown'));

defineElement();
// #endregion

import { fields } from '@shared/ui/field.ts';
import { menus } from '@shared/ui/menu.ts';
import { popovers } from '@shared/ui/popover.ts';

const palette = document.querySelector<HTMLElement>('.menu')!;
const search = document.querySelector<HTMLInputElement>('.field__input')!;
const empty = document.querySelector<HTMLElement>('.empty')!;

// The panel, the field and the arrow keys. `menus()` puts the cursor in the field when the
// palette opens, so the first thing you can do is the thing you came to do: type.
popovers(document, { reveal: '[data-reveal]' });
fields();
menus();

// #region keys
/*
 * The shortcut the button names.
 *
 * `togglePopover()` rather than a click on the button, because the shortcut is not a way of
 * pressing it — the keystroke means "the palette", and pressing it again means "not the
 * palette". `preventDefault` because ⌘K is the browser's own search shortcut on some builds,
 * and a palette that opened the address bar with it would be a joke.
 *
 * A popover opened this way has no invoker, which would matter if it were nested in another
 * one. It is not: `popovers()` wired this panel to that button once, at startup, and the panel
 * still places itself against a button nobody pressed.
 */
document.addEventListener('keydown', (event) => {
    if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;

    event.preventDefault();
    palette.togglePopover();
});
// #endregion

// #region filter
const rows = [...palette.querySelectorAll<HTMLElement>('.row')];

/*
 * Narrowing the list is one line; the other two are what is left when it narrows to nothing.
 *
 * `hidden` rather than a class, because out of the layout and out of the accessibility tree
 * are the same question and base.css settles it once. The headings need no line at all — the
 * stylesheet asks each group whether it has a row left, which is a question CSS can ask.
 *
 * The empty state needs both words: `hidden` to be gone, and `data-shown` for the cross, which
 * has to be told it is its turn. An element cannot draw itself in out of `display: none`.
 */
search.addEventListener('input', () => {
    const wanted = search.value.trim().toLowerCase();
    for (const row of rows) row.hidden = !row.textContent!.toLowerCase().includes(wanted);

    const none = rows.every((row) => row.hidden);
    empty.hidden = !none;
    empty.dataset.shown = String(none);
});
// #endregion

/*
 * A palette is opened for one errand, so it starts each one empty rather than showing you the
 * last thing you looked for. `input` is raised by hand, because setting `value` raises nothing.
 *
 * On `beforetoggle` rather than `toggle`, and for the same reason popover.ts does its own work
 * there: it runs before the panel has been shown, so the rows are all back before anything is
 * measured or painted. Put it on `toggle` and the entrance would cascade over the rows that
 * survived the last search, then the rest would appear afterwards with no entrance at all.
 */
palette.addEventListener('beforetoggle', (event) => {
    if ((event as ToggleEvent).newState !== 'open' || !search.value) return;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
});
