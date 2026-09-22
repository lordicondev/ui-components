// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Everything you can reach answers being reached — the plus, the microphone, the send arrow
// and every row in both menus, by pointer or by keyboard. The two exceptions are in the
// project search, and they are the search bar's own pair under their own names: a magnifier
// that answers the cursor arriving, because a field is not somewhere you hover but somewhere
// you are, and a cross that draws itself in once there is something to clear.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();
// #endregion

import { fields } from '@shared/ui/field.ts';
import { popovers } from '@shared/ui/popover.ts';

const composer = document.querySelector<HTMLFormElement>('.composer')!;
const prompt = document.querySelector<HTMLInputElement>('.composer__input')!;
const projects = document.querySelector<HTMLElement>('.submenu')!;
const opener = document.querySelector<HTMLButtonElement>('[popovertarget="projects"]')!;

// #region reveal
/**
 * A row's words arrive one after another, starting when the row itself does.
 *
 * One selector, because that is all the module needs to hear: it already knows when each row
 * moves and what delay it gave it, so the words land in the one cascade rather than in a
 * second animation that happens to overlap it.
 */
popovers(document, { reveal: '[data-reveal]' });

// And the field in the second panel, timer and all.
fields();
// #endregion

/** A moment for a pointer that has wandered off the pair but is on its way back. */
const GRACE = 150;

// #region submenu
let leaving: ReturnType<typeof setTimeout> | undefined;

/**
 * The pointer resting on the row opens the submenu; leaving the pair closes it — except that a
 * panel somebody is typing in has not been left, whatever the pointer is doing. The gap is not
 * leaving either, but that is the stylesheet's answer rather than this one.
 *
 * Only the closing is here: opening on a click or on Enter is `popovertargetaction`, and
 * dismissing on Escape or a click away is the browser's.
 */
for (const element of [opener, projects]) {
    element.addEventListener('pointerenter', () => {
        clearTimeout(leaving);
        if (!projects.matches(':popover-open')) projects.showPopover();
    });

    element.addEventListener('pointerleave', () => {
        clearTimeout(leaving);
        leaving = setTimeout(() => {
            if (!projects.contains(document.activeElement)) projects.hidePopover();
        }, GRACE);
    });
}
// #endregion

// #region chosen
/**
 * What this demo does with a choice, which is all there is left to do with one.
 *
 * Putting the menus away is not here. `data-choose` in the markup says which rows are answers
 * rather than routes, and `popovers()` closes the panel at the top of the chain — made one
 * menu deep or two, it is the same attribute and the same result.
 *
 * What is left is where the cursor goes afterwards, and there is only one place it was.
 */
document.addEventListener('popover-choose', () => prompt.focus());
// #endregion

// Sending is the one thing the composer really does, and what it does is empty itself.
composer.addEventListener('submit', (event) => {
    event.preventDefault();

    prompt.value = '';
    prompt.focus();
});

// #region filter
const rows = [...projects.querySelectorAll<HTMLElement>('.projects__row')];
const search = projects.querySelector<HTMLInputElement>('.field__input')!;

// `hidden` rather than a class: out of the layout and out of the accessibility tree are the
// same question, and base.css settles it once so no stylesheet can answer it differently.
search.addEventListener('input', () => {
    const wanted = search.value.trim().toLowerCase();

    for (const row of rows) {
        row.hidden = !row.textContent!.toLowerCase().includes(wanted);
    }
});
// #endregion
