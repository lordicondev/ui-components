// #region setup
import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';
import { revealText, settleText } from '@shared/motion/text-reveal.ts';
import { tooltips } from '@shared/ui/tooltip.ts';

// One trigger for both buttons. The icons are doing different jobs — the basket acts, the
// heart keeps — and neither the trigger nor this file knows the difference: which morph
// runs is `state` in the markup, and the markup is where those two icons differ.
Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));

defineElement();
tooltips();
// #endregion

const cart = document.querySelector<HTMLButtonElement>('.cart')!;
const label = document.querySelector<HTMLElement>('.cart__label')!;
const favorite = document.querySelector<HTMLButtonElement>('.favorite')!;

// #region measure
/**
 * How wide the words are.
 *
 * CSS has no transition from `0` to `auto`, so the open width has to be a number, and the
 * only honest place to get one is the words themselves: `width: max-content` means the
 * label keeps its natural size inside a box that is currently zero wide, so it can be
 * measured without opening anything.
 *
 * After the font, not before. Figtree arrives a moment late and is not the width of the
 * fallback it replaces, and a button measured too early stays that wrong width for good.
 */
async function measure(): Promise<void> {
    await document.fonts.ready;
    cart.style.setProperty('--said-width', `${label.getBoundingClientRect().width}px`);
}

void measure();
// #endregion

// #region naming
/**
 * What a button is called is what pressing it would do next, and on a toggle that is two
 * different sentences: a filled heart offers to empty it, a full basket offers to be
 * emptied. Both buttons are renamed the same way and for the same reason.
 *
 * The name is the tooltip element, so there is one piece of text to change rather than
 * two. The words that appear on screen and the words read out are the same words, and they
 * cannot drift apart because there is only ever one of them.
 */
function rename(button: HTMLButtonElement, to: string): void {
    button.querySelector<HTMLElement>('.tooltip')!.textContent = to;
}
// #endregion

// #region wiring
/**
 * The words wait for the box.
 *
 * The button takes 400ms to open, and the wave is held back through the first 100ms of it
 * — a word fading in where there is not yet room for it reads as the button being late
 * rather than as the word being early. What is left lands the last word as the button
 * stops, which is measured off the reference recording rather than chosen.
 */
const WORDS_WAIT = 100;
const WORDS_RUN = 300;

cart.addEventListener('click', () => {
    const added = cart.getAttribute('aria-pressed') !== 'true';

    cart.setAttribute('aria-pressed', String(added)); // the basket follows on its own
    rename(cart, added ? 'Remove from cart' : 'Add to cart');

    // Closing has no animation of its own to give the text. The box narrows, the words go
    // under its edge from the right, and the last of them leaves as the button finishes —
    // fading them out as well would be saying the same thing twice, more slowly.
    if (added) revealText(label, { delay: WORDS_WAIT, duration: WORDS_RUN });
    else settleText(label);
});
// #endregion

// #region favorite
favorite.addEventListener('click', () => {
    const kept = favorite.getAttribute('aria-pressed') !== 'true';

    favorite.setAttribute('aria-pressed', String(kept)); // and so does the heart
    rename(favorite, kept ? 'Remove from favorites' : 'Add to favorites');
});
// #endregion
