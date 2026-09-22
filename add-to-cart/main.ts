import { defineElement, Element } from '@lordicon/element';
import { booleanMorph } from '@shared/triggers/boolean-morph.ts';

// Triggers have to be registered before defineElement().
// One trigger for both buttons. Which morph each icon plays is its `state` in the markup.
Element.defineTrigger('pressed-morph', booleanMorph('aria-pressed'));

defineElement();

import { revealText, settleText } from '@shared/motion/text-reveal.ts';
import { tooltips } from '@shared/ui/tooltip.ts';

const cart = document.querySelector<HTMLButtonElement>('.cart')!;
const label = document.querySelector<HTMLElement>('.cart__label')!;
const favorite = document.querySelector<HTMLButtonElement>('.favorite')!;

tooltips();

/**
 * Writes the label's width for the stylesheet, because width cannot transition to `auto`.
 * The label has `width: max-content`, so it can be measured while the box around it is
 * closed. Measured after the font has loaded, which changes the width.
 */
async function measure(): Promise<void> {
    await document.fonts.ready;
    cart.style.setProperty('--said-width', `${label.getBoundingClientRect().width}px`);
}

void measure();

/** A toggle button is named after what pressing it would do next. The name is the tooltip. */
function rename(button: HTMLButtonElement, to: string): void {
    button.querySelector<HTMLElement>('.tooltip')!.textContent = to;
}

/** The words start 100ms into the 400ms opening and land as the button stops. */
const WORDS_WAIT = 100;
const WORDS_RUN = 300;

cart.addEventListener('click', () => {
    const added = cart.getAttribute('aria-pressed') !== 'true';

    cart.setAttribute('aria-pressed', String(added)); // the basket follows on its own
    rename(cart, added ? 'Remove from cart' : 'Add to cart');

    // Closing has no text animation: the box narrows and clips the words.
    if (added) revealText(label, { delay: WORDS_WAIT, duration: WORDS_RUN });
    else settleText(label);
});

favorite.addEventListener('click', () => {
    const kept = favorite.getAttribute('aria-pressed') !== 'true';

    favorite.setAttribute('aria-pressed', String(kept)); // and so does the heart
    rename(favorite, kept ? 'Remove from favorites' : 'Add to favorites');
});
