// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

Element.defineTrigger('checked-morph', booleanMorph('aria-checked'));

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';

// #region wiring
for (const option of document.querySelectorAll<HTMLLabelElement>('.option')) {
    const input = option.querySelector<HTMLInputElement>('.option__input')!;

    // `checked` is a property: ticking a box changes nothing in the markup, so a
    // MutationObserver would never fire. Mirroring it is what makes the state observable.
    input.addEventListener('change', () => {
        option.dataset.checked = String(input.checked);
    });
}
// #endregion
