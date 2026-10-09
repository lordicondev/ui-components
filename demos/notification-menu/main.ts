// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { popovers, type PopoverOptions } from '@shared/ui/popover.ts';

const bell = document.querySelector<HTMLElement>('.bell')!;
const badge = document.querySelector<HTMLElement>('.bell__badge')!;
const menu = document.querySelector<HTMLElement>('.menu')!;

/** The badge arriving: an overshoot that settles. From the reference recording. */
const POP_MS = 350;
const POP_EASE = 'cubic-bezier(0.34, 1.8, 0.64, 1)';

/** The badge leaving. */
const DROP_MS = 100;

// #region count
/**
 * Sets the notification count. Writes data-count, which the bell's icon watches, and
 * draws the badge. The page's initial count plays nothing: only changes do.
 */
function setCount(count: number): void {
    const was = Number(bell.dataset.count) || 0;
    if (count === was) return;

    bell.dataset.count = String(count); // the icon watches this

    for (const animation of badge.getAnimations()) animation.cancel();

    if (count === 0) {
        drop();
        return;
    }

    badge.textContent = String(count);
    badge.hidden = false;
    if (prefersReducedMotion()) return;

    badge.animate({ scale: [0, 1] }, { duration: POP_MS, easing: POP_EASE });
}
// #endregion

/** Shrinks the badge away, then takes it out of the layout. */
function drop(): void {
    if (prefersReducedMotion()) {
        badge.hidden = true;
        return;
    }

    const leaving = badge.animate({ scale: [1, 0] }, { duration: DROP_MS, easing: 'ease-in' });

    // A rejection means a newer count cancelled this animation and owns the badge now.
    void leaving.finished.then(() => (badge.hidden = true)).catch(() => null);
}

// #region seen
// Opening the menu reads the notifications: the count goes to zero. The bell stays quiet,
// because follow only plays when the count goes up.
menu.addEventListener('toggle', (event) => {
    if ((event as ToggleEvent).newState === 'open') setCount(0);
});
// #endregion

/** The tint behind a new row, unrolled left to right. */
const UNROLL_MS = 370;
const UNROLL_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

/** After the row's own delay, so the words are already on their way. */
const UNROLL_AFTER = 90;

// #region entrance
// popovers() brings each data-rise row in and calls onRise with the delay it gave the
// row. Starting the tint from that delay keeps it in the same cascade as the row and its
// words. `reveal` names the titles whose words arrive one by one.
const opening: PopoverOptions = {
    reveal: '[data-reveal]',

    onRise(row, delay) {
        if (row.hasAttribute('data-unread')) unroll(row, delay + UNROLL_AFTER);
    },
};

popovers(document, opening);
// #endregion

/**
 * The tint is a background image, not a colour, so it has a width to animate. The
 * stylesheet says what colour it is. Only called from onRise, which popovers() skips
 * under reduced motion.
 */
function unroll(row: HTMLElement, delay: number): void {
    row.animate(
        { backgroundSize: ['0% 100%', '100% 100%'] },
        { duration: UNROLL_MS, delay, easing: UNROLL_EASE, fill: 'backwards' },
    );
}

// The demo's own controls: a way to set the count on a page with no server behind it.
const form = document.querySelector<HTMLFormElement>('.controls')!;
const input = document.querySelector<HTMLInputElement>('.controls__input')!;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    setCount(Math.max(0, Math.trunc(Number(input.value) || 0)));
});

// One arrival after the page has settled, so the bell is seen at rest first.
setTimeout(() => setCount(2), 1000);
