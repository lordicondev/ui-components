// #region setup
import { defineElement } from '@lordicon/element';

// Registers <lord-icon> with its built-in triggers. The markup says what each icon follows.
defineElement();
// #endregion

import { pager } from '@shared/ui/pager.ts';

// #region place
/**
 * Puts the frame over `page`. Both edges are written every time; the stylesheet reads
 * `data-going` to decide which edge moves first. Also runs whenever the row changes size:
 * when it is first shown, and when the web font arrives. A hidden row has no size and keeps
 * its frame where it was, so the frame does not slide in when the row comes back.
 */
function place(numbers: HTMLElement, page: HTMLElement, going: 'on' | 'back'): void {
    if (!numbers.offsetWidth) return;
    const trailing = numbers.offsetWidth - page.offsetLeft - page.offsetWidth;

    numbers.dataset.going = going;
    numbers.style.setProperty('--frame-left', `${page.offsetLeft}px`);
    numbers.style.setProperty('--frame-right', `${trailing}px`);
}
// #endregion

/** Disables a step with nowhere to go. A disabled button fires no click, so its icon holds still. */
function limit(steps: HTMLButtonElement[], at: number, count: number): void {
    for (const step of steps) {
        const next = at + Number(step.dataset.step);
        step.disabled = next < 0 || next >= count;
    }
}

// #region turn
/** Wires one row: its pages, its two steps, and the frame. */
function paginate(row: HTMLElement): void {
    const numbers = row.querySelector<HTMLElement>('.numbers')!;
    const pages = [...row.querySelectorAll<HTMLButtonElement>('.page')];
    const steps = [...row.querySelectorAll<HTMLButtonElement>('.step')];
    let at = pages.findIndex((page) => page.getAttribute('aria-current') === 'page');

    function turn(to: number): void {
        if (to === at || to < 0 || to >= pages.length) return;

        pages[at].removeAttribute('aria-current');
        pages[to].setAttribute('aria-current', 'page');
        place(numbers, pages[to], to > at ? 'on' : 'back');
        at = to;
        limit(steps, at, pages.length);
    }

    pages.forEach((page, index) => page.addEventListener('click', () => turn(index)));
    steps.forEach((step) => {
        step.addEventListener('click', () => turn(at + Number(step.dataset.step)));
    });

    new ResizeObserver(() => place(numbers, pages[at], 'on')).observe(numbers);
    limit(steps, at, pages.length);
}
// #endregion

for (const row of document.querySelectorAll<HTMLElement>('.pages')) paginate(row);

pager();
