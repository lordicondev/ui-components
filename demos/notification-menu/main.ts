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
const markAll = document.querySelector<HTMLButtonElement>('.menu__read')!;
const rows = [...document.querySelectorAll<HTMLElement>('.feed__row')];

/** The badge arriving: an overshoot that settles. From the reference recording. */
const POP_MS = 350;
const POP_EASE = 'cubic-bezier(0.34, 1.8, 0.64, 1)';

/** The badge leaving. */
const DROP_MS = 100;

/** The tint behind a row, unrolled left to right when it arrives and when it leaves. */
const UNROLL_MS = 370;
const UNROLL_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';

/** After the row's own delay, so the words are already on their way. */
const UNROLL_AFTER = 90;

/** Rows marked read together leave one after another, as they arrived. */
const READ_STAGGER = 40;

/** The rows not read yet. The count is how many there are. */
const unread = new Set<HTMLElement>();

// #region unread
/** Makes the newest `count` rows unread and the rest read, then shows the count. */
function setUnread(count: number): void {
    let leaving = 0;
    rows.forEach((row, index) => {
        if (index < count) markUnread(row);
        else if (unread.has(row)) markRead(row, READ_STAGGER * leaving++);
    });
    showCount();
}

/** Clicking a row reads it. Mark as read reads them all. */
for (const row of rows) {
    row.addEventListener('click', () => {
        if (!unread.has(row)) return;
        markRead(row, 0);
        showCount();
    });
}

markAll.addEventListener('click', () => setUnread(0));
// #endregion

/**
 * Draws the count of unread rows. Writes data-count, which the bell's icon watches, and
 * the badge. The bell rings when the count goes up and stays quiet when it goes down.
 */
// #region count
function showCount(): void {
    const count = unread.size;
    const was = Number(bell.dataset.count) || 0;

    markAll.setAttribute('aria-disabled', String(count === 0));
    bell.setAttribute('aria-label', count ? `Notifications, ${count} unread` : 'Notifications');
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

/** Only an open panel animates a row. A closed one changes at once. */
const animated = () => menu.matches(':popover-open') && !prefersReducedMotion();

/** The row's own tint animations; the panel's entrance on the same row is left alone. */
function stopTint(row: HTMLElement): void {
    for (const animation of row.getAnimations()) {
        if (animation.id === 'tint') animation.cancel();
    }
}

function markUnread(row: HTMLElement): void {
    if (unread.has(row)) return;

    unread.add(row);
    stopTint(row);
    row.setAttribute('data-unread', '');
    if (animated()) unroll(row, 0);
}

/** The tint carries on to the right and off the row, then the row is read. */
function markRead(row: HTMLElement, delay: number): void {
    if (!unread.has(row)) return;

    unread.delete(row);
    stopTint(row);

    if (!animated()) {
        row.removeAttribute('data-unread');
        return;
    }

    const away = row.animate(
        { backgroundSize: ['100% 100%', '0% 100%'], backgroundPosition: ['100% 0', '100% 0'] },
        { duration: UNROLL_MS, delay, easing: UNROLL_EASE, fill: 'forwards', id: 'tint' },
    );

    // A rejection means the row was marked unread again before the tint had gone.
    void away.finished
        .then(() => {
            row.removeAttribute('data-unread');
            away.cancel();
        })
        .catch(() => null);
}

// #region entrance
// popovers() brings each data-rise row in and calls onRise with the delay it gave the
// row. Starting the tint from that delay keeps it in the same cascade as the row and its
// words. `reveal` names the titles whose words arrive one by one.
const opening: PopoverOptions = {
    reveal: '[data-reveal]',

    onRise(row, delay) {
        if (unread.has(row)) unroll(row, delay + UNROLL_AFTER);
    },
};

popovers(document, opening);
// #endregion

/**
 * The tint is a background image, not a colour, so it has a width to animate. The
 * stylesheet says what colour it is.
 */
function unroll(row: HTMLElement, delay: number): void {
    row.animate(
        { backgroundSize: ['0% 100%', '100% 100%'] },
        { duration: UNROLL_MS, delay, easing: UNROLL_EASE, fill: 'backwards', id: 'tint' },
    );
}

// The demo's own controls: a way to set the count on a page with no server behind it.
// There are four rows, so four is the most there can be. The form does not validate:
// a number out of range is brought into it instead.
const form = document.querySelector<HTMLFormElement>('.controls')!;
const input = document.querySelector<HTMLInputElement>('.controls__input')!;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const wanted = Math.trunc(Number(input.value) || 0);
    const count = Math.min(Math.max(wanted, 0), rows.length);

    input.value = String(count);
    setUnread(count);
});

// Two arrive after the page has settled, so the bell is seen at rest first.
setTimeout(() => setUnread(2), 1000);
