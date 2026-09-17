// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));

defineElement();
// #endregion

// #region wiring
const button = document.querySelector<HTMLButtonElement>('.star')!;
const count = document.querySelector<HTMLElement>('.star__count')!;

/** How many there are without you. The markup ships with your star not counted yet. */
const OTHERS = Number(count.textContent);

// No lock while the star is turning, and none needed. `aria-pressed` is the only state
// there is, the number is read back off it rather than counted up, and a click that lands
// mid-morph turns the icon around instead of restarting it. However fast you click, where
// you stop is what you get — on the star, on the number and in the accessibility tree.
button.addEventListener('click', () => {
    const starred = button.getAttribute('aria-pressed') !== 'true';

    button.setAttribute('aria-pressed', String(starred)); // the icon follows on its own
    count.textContent = String(OTHERS + (starred ? 1 : 0));
});
// #endregion
