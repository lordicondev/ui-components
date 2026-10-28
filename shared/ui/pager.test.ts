import { beforeEach, describe, expect, it } from 'vitest';
import { pager } from './pager.ts';

function mount(count: number) {
    const pages = Array.from({ length: count }, () => {
        const page = document.createElement('section');
        page.dataset.page = '';
        return page;
    });

    const step = (by: number) => {
        const button = document.createElement('button');
        button.className = 'pager__step';
        button.dataset.step = String(by);
        return button;
    };
    const dots = pages.map(() => {
        const dot = document.createElement('button');
        dot.className = 'pager__dot';
        return dot;
    });
    const [previous, next] = [step(-1), step(1)];

    document.body.append(...pages, previous, ...dots, next);
    return { pages, dots, previous, next };
}

/** Which page is showing, by index. */
function showing(pages: HTMLElement[]): number[] {
    return pages.flatMap((page, index) => (page.hidden ? [] : [index]));
}

beforeEach(() => {
    document.body.replaceChildren();
});

describe('pager', () => {
    it('starts on the first page with nowhere to go back to', () => {
        const { pages, dots, previous, next } = mount(3);
        pager();

        expect(showing(pages)).toEqual([0]);
        expect(dots.map((dot) => dot.getAttribute('aria-pressed'))).toEqual([
            'true',
            'false',
            'false',
        ]);
        expect(previous.disabled).toBe(true);
        expect(next.disabled).toBe(false);
    });

    it('steps through the pages and stops at the last one', () => {
        const { pages, dots, previous, next } = mount(3);
        pager();

        next.click();
        expect(showing(pages)).toEqual([1]);
        expect(dots[1].getAttribute('aria-pressed')).toBe('true');
        expect(previous.disabled).toBe(false);

        next.click();
        expect(showing(pages)).toEqual([2]);
        expect(next.disabled).toBe(true);

        previous.click();
        expect(showing(pages)).toEqual([1]);
    });

    it('keeps the arrows in step with a dot', () => {
        const { pages, dots, previous, next } = mount(3);
        pager();

        dots[2].click();
        expect(showing(pages)).toEqual([2]);
        expect(next.disabled).toBe(true);

        previous.click();
        expect(showing(pages)).toEqual([1]);
    });

    it('moves focus to the other arrow when the pressed one runs out', () => {
        const { next, previous } = mount(2);
        pager();

        next.focus();
        next.click();
        expect(next.disabled).toBe(true);
        expect(document.activeElement).toBe(previous);
    });
});
