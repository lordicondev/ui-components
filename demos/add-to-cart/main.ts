// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { revealText, settleText } from '@shared/motion/text-reveal.ts';
import { tooltips } from '@shared/ui/tooltip.ts';

const cart = document.querySelector<HTMLButtonElement>('.cart')!;
const label = document.querySelector<HTMLElement>('.cart__label')!;
const status = document.querySelector<HTMLElement>('[role="status"]')!;
const favorite = document.querySelector<HTMLButtonElement>('.favorite')!;

tooltips();

// #region measure
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
// #endregion

/** A toggle button is named after what pressing it would do next. The name is the tooltip. */
function rename(button: HTMLButtonElement, to: string): void {
    button.querySelector<HTMLElement>('.tooltip')!.textContent = to;
}

/** The words start 100ms into the 400ms opening and land as the button stops. */
const WORDS_WAIT = 100;
const WORDS_RUN = 300;

/**
 * How long the button says "Added to cart", from the last press. The basket takes 1000ms
 * to become a tick, so the tick is seen for a second before the button closes.
 */
const SAYING_MS = 2000;

let closing: ReturnType<typeof setTimeout> | undefined;

// #region wiring
// Every press adds. Pressing again while the button says so only keeps it open longer.
cart.addEventListener('click', () => {
    clearTimeout(closing);
    closing = setTimeout(backToBasket, SAYING_MS);

    if (cart.dataset.added === 'true') return;

    cart.dataset.added = 'true'; // the basket follows on its own
    status.textContent = 'Added to cart';
    revealText(label, { delay: WORDS_WAIT, duration: WORDS_RUN });
});

// No text animation on the way back: the box narrows and clips the words.
function backToBasket(): void {
    cart.dataset.added = 'false';
    status.textContent = '';
    settleText(label);
}

favorite.addEventListener('click', () => {
    const kept = favorite.getAttribute('aria-pressed') !== 'true';

    favorite.setAttribute('aria-pressed', String(kept)); // and so does the heart
    rename(favorite, kept ? 'Remove from favorites' : 'Add to favorites');
});
// #endregion
