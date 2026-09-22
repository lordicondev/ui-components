import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

// Triggers have to be registered before defineElement().
Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));

defineElement();

const button = document.querySelector<HTMLButtonElement>('.star')!;
const count = document.querySelector<HTMLElement>('.star__count')!;

/** Stars from other people. The markup ships without yours counted. */
const OTHERS = Number(count.textContent);

// No lock while the star animates: a click mid-morph reverses the icon, and the number
// is recomputed rather than incremented.
button.addEventListener('click', () => {
    const starred = button.getAttribute('aria-pressed') !== 'true';

    button.setAttribute('aria-pressed', String(starred)); // the icon follows on its own
    count.textContent = String(OTHERS + (starred ? 1 : 0));
});
