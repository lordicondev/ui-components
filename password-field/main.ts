// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';
import { InvalidAttention } from '@shared/triggers/invalid-attention.ts';

// Register before defineElement(): it calls customElements.define() last, and the moment
// the element is defined, any <lord-icon trigger="..."> already in the page upgrades —
// an unregistered name throws.
Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));
Element.defineTrigger('invalid-attention', InvalidAttention);

defineElement();
// #endregion

import '@shared/types/lordicon.d.ts';

const field = document.querySelector<HTMLElement>('.field')!;
const input = document.querySelector<HTMLInputElement>('.field__input')!;
const toggle = document.querySelector<HTMLButtonElement>('.field__toggle')!;
const error = document.querySelector<HTMLElement>('.field__error')!;
const form = document.querySelector<HTMLFormElement>('.demo__form')!;

// #region wiring
toggle.addEventListener('click', () => {
    const reveal = input.type === 'password';

    input.type = reveal ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(reveal));
    toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    validate();
});

function validate() {
    const valid = input.checkValidity();

    field.setAttribute('aria-invalid', String(!valid));
    error.hidden = valid;
}
// #endregion

// Once the field has been marked invalid, keep it honest as the user types.
input.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validate();
});
