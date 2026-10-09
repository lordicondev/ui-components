// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { pager } from '@shared/ui/pager.ts';

// #region wiring
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
// #endregion

// Hiding a group takes its inputs out of the tab order and out of the form.
pager();
