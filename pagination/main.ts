// #region setup
import { defineElement, Element } from '@lordicon/element';
import { PressAttention } from '@shared/triggers/press-attention.ts';
import { pager } from '@shared/ui/pager.ts';

// Nothing here holds a state. An icon in this row acknowledges the press that changed the
// page and ends exactly where it started, which is what separates it from a morph.
Element.defineTrigger('press-attention', PressAttention);

defineElement();
// #endregion

// #region place
/**
 * Puts the frame over `page`, and says which way it is going to get there.
 *
 * Both edges are written every time, and the stylesheet decides which of them leaves first
 * — that is the whole of the stretch. `going` is what tells it: leading edge is the right
 * one on the way up the row and the left one on the way back.
 *
 * Measured rather than counted. A row can have any number of pages at any width, and
 * nothing here knows what a button and its gap come to.
 */
function place(numbers: HTMLElement, page: HTMLElement, going: 'on' | 'back'): void {
    const trailing = numbers.offsetWidth - page.offsetLeft - page.offsetWidth;

    numbers.dataset.going = going;
    numbers.style.setProperty('--frame-left', `${page.offsetLeft}px`);
    numbers.style.setProperty('--frame-right', `${trailing}px`);
}
// #endregion

/**
 * A step with nowhere to go is not a step. It is also why its icon holds still at the ends
 * of the row: a disabled button fires no click, so the trigger never hears one.
 */
function limit(steps: HTMLButtonElement[], at: number, count: number): void {
    for (const step of steps) {
        const next = at + Number(step.dataset.step);
        step.disabled = next < 0 || next >= count;
    }
}

// #region turn
/** Wires one row: its numbers, its two steps, and the frame that follows them. */
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

    place(numbers, pages[at], 'on');
    limit(steps, at, pages.length);
}
// #endregion

// #region pager
// Every row is measured while all three are still on screen; hiding one takes its buttons
// out of the tab order and its widths down to nothing, and a frame cannot be placed in a
// box that is not there. The dots are the same ones the checkbox list uses.
for (const row of document.querySelectorAll<HTMLElement>('.pages')) paginate(row);

pager();
// #endregion
