import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
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
