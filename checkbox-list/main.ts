import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

// Triggers have to be registered before defineElement().
Element.defineTrigger('checked-morph', booleanMorph('aria-checked'));

defineElement();

import '@shared/types/lordicon.d.ts';
import { pager } from '@shared/ui/pager.ts';

/**
 * Copies each input's `checked` onto its label as data-checked. `checked` is a property,
 * and a MutationObserver cannot watch a property.
 */
function mirror(group: HTMLFieldSetElement): void {
    for (const option of group.querySelectorAll<HTMLLabelElement>('.option')) {
        const input = option.querySelector<HTMLInputElement>('.option__input')!;
        option.dataset.checked = String(input.checked);
    }
}

for (const group of document.querySelectorAll<HTMLFieldSetElement>('.options')) {
    // The whole group, not only the input that changed: a radio clears its siblings
    // without an event for any of them.
    group.addEventListener('change', () => mirror(group));
}

// Hiding a group takes its inputs out of the tab order and out of the form.
pager();
