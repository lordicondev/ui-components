import { defineElement, Element } from '@lordicon/element';
import { PressAttention } from '@shared/triggers/press-attention.ts';
import { pager } from '@shared/ui/pager.ts';

// Triggers have to be registered before defineElement().
Element.defineTrigger('press-attention', PressAttention);

defineElement();

/**
 * Puts the frame over `page`. Both edges are written every time; the stylesheet reads
 * `data-going` to decide which edge moves first.
 */
function place(numbers: HTMLElement, page: HTMLElement, going: 'on' | 'back'): void {
    const trailing = numbers.offsetWidth - page.offsetLeft - page.offsetWidth;

    numbers.dataset.going = going;
    numbers.style.setProperty('--frame-left', `${page.offsetLeft}px`);
    numbers.style.setProperty('--frame-right', `${trailing}px`);
}

/** Disables a step with nowhere to go. A disabled button fires no click, so its icon holds still. */
function limit(steps: HTMLButtonElement[], at: number, count: number): void {
    for (const step of steps) {
        const next = at + Number(step.dataset.step);
        step.disabled = next < 0 || next >= count;
    }
}

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

    place(numbers, pages[at], 'on');
    limit(steps, at, pages.length);
}

// Every row is placed before pager() hides two of them: a hidden row has no widths.
for (const row of document.querySelectorAll<HTMLElement>('.pages')) paginate(row);

pager();
