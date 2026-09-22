import { defineElement, Element } from '@lordicon/element';
import { booleanAttention } from '@shared/triggers/boolean-attention.ts';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';

// Triggers have to be registered before defineElement().
// Every button and row plays on hover or focus. The search field's two icons play on
// its own attributes: the magnifier when it is focused, the cross when there is text to clear.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('focus-attention', booleanAttention('data-focused'));
Element.defineTrigger('clearable-attention', booleanAttention('data-clearable'));

defineElement();

import { fields } from '@shared/ui/field.ts';
import { popovers } from '@shared/ui/popover.ts';

const composer = document.querySelector<HTMLFormElement>('.composer')!;
const prompt = document.querySelector<HTMLInputElement>('.composer__input')!;
const projects = document.querySelector<HTMLElement>('.submenu')!;
const opener = document.querySelector<HTMLButtonElement>('[popovertarget="projects"]')!;

// popovers() places each panel, picks the direction it opens in, animates the rows in and
// closes the chain when a data-choose row is clicked. `reveal` names the labels whose
// words arrive one by one. fields() writes the search field's two attributes.
popovers(document, { reveal: '[data-reveal]' });
fields();

/** How long the pointer may be off the row and the submenu before the submenu closes. */
const GRACE = 150;

let leaving: ReturnType<typeof setTimeout> | undefined;

// The pointer resting on the row opens the submenu; leaving both closes it after a grace
// period, unless focus is inside it. Click and Enter open it through popovertargetaction;
// Escape and clicking away are the browser's.
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

// A data-choose row was clicked, at either level. popovers() has closed the panels; the
// cursor goes back to the composer.
document.addEventListener('popover-choose', () => prompt.focus());

composer.addEventListener('submit', (event) => {
    event.preventDefault();

    prompt.value = '';
    prompt.focus();
});

const rows = [...projects.querySelectorAll<HTMLElement>('.projects__row')];
const search = projects.querySelector<HTMLInputElement>('.field__input')!;

// The clear button raises `input` too, so clearing the search shows every row again.
search.addEventListener('input', () => {
    const wanted = search.value.trim().toLowerCase();

    for (const row of rows) {
        row.hidden = !row.textContent!.toLowerCase().includes(wanted);
    }
});
