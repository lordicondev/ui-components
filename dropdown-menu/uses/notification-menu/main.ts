// #region setup
import { defineElement, Element } from '@lordicon/element';
import { HoverFocus } from '@shared/triggers/hover-focus.ts';
import { raisedAttention } from '@shared/triggers/raised-attention.ts';

// Two triggers for two kinds of news. The rows answer being reached, the way every row in
// the sidebar does. The bell answers a number going up — the same trigger the password
// field puts on its error, counting something else.
Element.defineTrigger('hover-focus', HoverFocus);
Element.defineTrigger('count-attention', raisedAttention('data-count'));

defineElement();
// #endregion

import { prefersReducedMotion } from '@shared/motion/reduced-motion.ts';
import { popovers, type PopoverOptions } from '@shared/ui/popover.ts';

const bell = document.querySelector<HTMLElement>('.bell')!;
const badge = document.querySelector<HTMLElement>('.bell__badge')!;
const menu = document.querySelector<HTMLElement>('.menu')!;

/** A badge arriving, which overshoots and settles — measured off the recording. */
const POP_MS = 350;
const POP_EASE = 'cubic-bezier(0.34, 1.8, 0.64, 1)';

/** And leaving, which does not. A count that is gone is not news worth dwelling on. */
const DROP_MS = 100;

// #region count
/**
 * The whole API: one number in, and nothing below reaches for the icon.
 *
 * The three cases are not three code paths — they are what comparing `was` and `count`
 * already says. The number the page was built with never changes and so plays nothing.
 */
function setCount(count: number): void {
    const was = Number(bell.dataset.count) || 0;
    if (count === was) return;

    bell.dataset.count = String(count); // the icon is watching this, and only this

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

/** Away, and then out of the layout — in that order, so the box is there to shrink. */
function drop(): void {
    if (prefersReducedMotion()) {
        badge.hidden = true;
        return;
    }

    const leaving = badge.animate({ scale: [1, 0] }, { duration: DROP_MS, easing: 'ease-in' });

    // A rejection means a newer count cancelled this one and now owns the badge.
    void leaving.finished.then(() => (badge.hidden = true)).catch(() => null);
}

// #region seen
// Opening the menu is reading it. The number goes, and the bell says nothing about that —
// `raisedAttention` only answers a count going up.
menu.addEventListener('toggle', (event) => {
    if ((event as ToggleEvent).newState === 'open') setCount(0);
});
// #endregion

/** The tint behind a new row, unrolled left to right. */
const UNROLL_MS = 370;
const UNROLL_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

/** After the row it belongs to has started, so the words are already on their way. */
const UNROLL_AFTER = 90;

// #region entrance
/**
 * Everything a row starts when the panel brings it in.
 *
 * `popovers()` moves the row and hands back the delay it gave it, which is all these need:
 * started from that instant, a title's words and a tint unrolling are one cascade rather
 * than three animations that happen to overlap.
 */
const opening: PopoverOptions = {
    // The titles are sentences, so they arrive as one — a word at a time.
    reveal: '[data-reveal]',

    onRise(row, delay) {
        // Only the new ones have a tint, and it arrives the way a highlighter does.
        if (row.hasAttribute('data-unread')) unroll(row, delay + UNROLL_AFTER);
    },
};

popovers(document, opening);
// #endregion

/**
 * The tint is a background image rather than a background colour, which is what makes it
 * animatable: a colour has no width to grow, and `background-size` has. The stylesheet
 * says what colour it is — resting or under the pointer — and never has to know that it
 * is halfway in.
 */
function unroll(row: HTMLElement, delay: number): void {
    row.animate(
        { backgroundSize: ['0% 100%', '100% 100%'] },
        { duration: UNROLL_MS, delay, easing: UNROLL_EASE, fill: 'backwards' },
    );
}

// #region controls
const form = document.querySelector<HTMLFormElement>('.controls')!;
const input = document.querySelector<HTMLInputElement>('.controls__input')!;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    setCount(Math.max(0, Math.trunc(Number(input.value) || 0)));
});

/**
 * And one arrival nobody asked for, a moment after the page has settled.
 *
 * The wait is the point rather than politeness: a badge already on screen when you get
 * there is the first of the three cases and plays nothing, so the only way to show an
 * arrival is to let the resting bell be seen first.
 */
setTimeout(() => setCount(2), 1000);
// #endregion
