// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

Element.defineTrigger('expanded-morph', booleanMorph('aria-expanded'));

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';

// #region wiring
for (const trigger of document.querySelectorAll<HTMLButtonElement>('.item__trigger')) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;

    trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') !== 'true';

        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
    });
}
// #endregion
