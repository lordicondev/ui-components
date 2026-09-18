// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

Element.defineTrigger('checked-morph', booleanMorph('aria-checked'));

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';
import { pager } from '@shared/ui/pager.ts';

// #region wiring
/**
 * `checked` is a property: ticking a box changes nothing in the markup, so a
 * MutationObserver would never fire. Mirroring it is what makes the state observable.
 */
function mirror(group: HTMLFieldSetElement): void {
    for (const option of group.querySelectorAll<HTMLLabelElement>('.option')) {
        const input = option.querySelector<HTMLInputElement>('.option__input')!;
        option.dataset.checked = String(input.checked);
    }
}

for (const group of document.querySelectorAll<HTMLFieldSetElement>('.options')) {
    // The whole group, not just the input that changed: a radio clears its siblings
    // without firing an event for any of them. Checkboxes do not care either way, so one
    // line covers both kinds.
    group.addEventListener('change', () => mirror(group));
}
// #endregion

// #region pager
// Hiding a group takes its inputs out of the tab order and out of the form with them, so
// only the style on screen can be reached. The dots are the same ones the alerts use.
pager();
// #endregion
