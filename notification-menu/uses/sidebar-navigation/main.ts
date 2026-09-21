// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Ten icons and two kinds of answer. Everything in the list answers being reached — by a
// pointer or by the keyboard — and the field keeps the pair of triggers it was built with,
// because a field is not somewhere you hover, it is somewhere you are.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();
// #endregion

// #region navigate
const nav = document.querySelector<HTMLElement>('.nav')!;
const items = [...nav.querySelectorAll<HTMLAnchorElement>('.nav__item')];

// One listener for the whole list rather than one per link: which link was pressed is
// already in the event, and a list that grows a destination needs no second thought here.
nav.addEventListener('click', (event) => {
    const chosen = (event.target as Element).closest<HTMLAnchorElement>('.nav__item');
    if (!chosen) return;

    // These are real links and there is no page behind them, which is the one thing this
    // demo cannot be honest about. Everything else follows from the attribute below.
    event.preventDefault();

    for (const item of items) {
        // Removed rather than set to "false". `aria-current` is not a boolean: the links
        // that are not the current page simply do not carry it, and the stylesheet reads
        // the same attribute the screen reader does.
        if (item === chosen) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    }
});
// #endregion

/*
 * Everything below is the search bar demo, unchanged. It is copied rather than imported
 * because a demo is a page you can read start to finish — but it is the same field, the
 * same two attributes and the same two triggers, and the reasoning behind it is written up
 * over there rather than repeated here.
 */

const field = document.querySelector<HTMLElement>('.field')!;
const input = document.querySelector<HTMLInputElement>('.field__input')!;
const clear = document.querySelector<HTMLButtonElement>('.field__clear')!;

// #region settle
/** How long the quiet has to last before the field offers to be emptied. */
const SETTLED = 500;
let settling: ReturnType<typeof setTimeout> | undefined;

/** Offer to clear, or stop offering. The icon and the stylesheet both read this. */
function offer(clearable: boolean): void {
    clearTimeout(settling);
    field.dataset.clearable = String(clearable);
}

input.addEventListener('input', () => {
    clearTimeout(settling);

    // Nothing left to clear, and no reason to wait half a second to say so.
    if (!input.value) {
        offer(false);
        return;
    }

    // Once it is there it stays: a button that hopped away on the next keystroke would be
    // gone exactly when you reached for it.
    if (field.dataset.clearable === 'true') return;

    settling = setTimeout(() => offer(true), SETTLED);
});
// #endregion

// The whole field, not the input: there are two things inside it that can hold focus, and
// a `focusout` whose `relatedTarget` is still inside the field is not a departure.
field.addEventListener('focusin', () => (field.dataset.focused = 'true'));

field.addEventListener('focusout', (event) => {
    if (field.contains(event.relatedTarget as Node | null)) return;

    field.dataset.focused = 'false';
    if (input.value) offer(true);
});

// Clearing is not leaving. The cursor goes back where it was, and the magnifier does not
// play again — `data-focused` never changed, and the icon is watching that, not us.
clear.addEventListener('click', () => {
    input.value = '';
    offer(false);
    input.focus();
});
