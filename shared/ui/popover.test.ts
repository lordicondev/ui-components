import { beforeEach, describe, expect, it } from 'vitest';
import { popovers } from './popover.ts';

/** happy-dom has no popover support, so `beforetoggle` and `toggle` are faked. */
function toggling(panel: HTMLElement, state: 'open' | 'closed') {
    panel.dispatchEvent(Object.assign(new Event('beforetoggle'), { newState: state }));
    panel.dispatchEvent(Object.assign(new Event('toggle'), { newState: state }));
}

function mount(anchorTop: number, rows = 3) {
    // clientHeight/clientWidth are getters, so the viewport is faked by redefining them.
    for (const [name, value] of [
        ['clientHeight', 800],
        ['clientWidth', 1000],
    ] as const) {
        Object.defineProperty(document.documentElement, name, { value, configurable: true });
    }

    const anchor = document.createElement('button');
    anchor.setAttribute('popovertarget', 'panel');
    anchor.getBoundingClientRect = () =>
        ({ left: 100, right: 140, top: anchorTop, bottom: anchorTop + 40 }) as DOMRect;

    const panel = document.createElement('div');
    panel.id = 'panel';
    panel.setAttribute('popover', '');
    for (let n = 0; n < rows; n += 1) {
        const row = document.createElement('p');
        row.dataset.rise = '';
        row.textContent = `row ${n}`;
        panel.append(row);
    }

    document.body.append(anchor, panel);
    return { anchor, panel };
}

/** The delay each row was given, in markup order. */
function delays(panel: HTMLElement): number[] {
    return [...panel.querySelectorAll<HTMLElement>('[data-rise]')].map(
        (row) => row.getAnimations()[0]?.effect?.getTiming().delay ?? -1,
    );
}

/** Where the row's transform animation starts. */
function firstFrame(panel: HTMLElement): unknown {
    const effect = panel.querySelector('[data-rise]')!.getAnimations()[1].effect as KeyframeEffect;
    return effect.getKeyframes()[0].transform;
}

beforeEach(() => {
    document.body.replaceChildren();
});

describe('popovers', () => {
    it('reveals a named label inside each row, from the row\u2019s own delay', () => {
        const { panel } = mount(60);
        for (const row of panel.querySelectorAll('[data-rise]')) {
            const label = document.createElement('span');
            label.dataset.reveal = '';
            label.textContent = 'two words';
            row.append(label);
        }

        popovers(document, { reveal: '[data-reveal]' });
        toggling(panel, 'open');

        const labels = [...panel.querySelectorAll<HTMLElement>('[data-reveal]')];
        expect(labels.map((label) => label.querySelectorAll('[data-word]').length)).toEqual([
            2, 2, 2,
        ]);
        // The words start with the row.
        expect(
            labels[1].querySelector('[data-word]')!.getAnimations()[0].effect!.getTiming().delay,
        ).toBe(100);
    });

    it('reveals nothing when no selector is given', () => {
        const { panel } = mount(60);
        const label = document.createElement('span');
        label.dataset.reveal = '';
        label.textContent = 'two words';
        panel.querySelector('[data-rise]')!.append(label);

        popovers(document);
        toggling(panel, 'open');

        expect(label.querySelectorAll('[data-word]').length).toBe(0);
    });

    it('opens downward when the control is near the top', () => {
        const { panel } = mount(60);
        popovers(document);

        toggling(panel, 'open');

        expect(panel.dataset.direction).toBe('down');
        expect(panel.style.top).toBe('108px'); // 60 + 40 + the 8px gap
        expect(panel.style.bottom).toBe('auto');
    });

    it('opens upward when the control is near the bottom', () => {
        const { panel } = mount(700);
        popovers(document);

        toggling(panel, 'open');

        expect(panel.dataset.direction).toBe('up');
        expect(panel.style.bottom).toBe('108px'); // 800 - 700 + the 8px gap
        expect(panel.style.top).toBe('auto');
    });

    it('lets a caller insist on a direction', () => {
        const { panel } = mount(60);
        popovers(document, { direction: 'up' });

        toggling(panel, 'open');

        expect(panel.dataset.direction).toBe('up');
    });

    it('sends the cascade away from the control', () => {
        const down = mount(60);
        popovers(document, { direction: 'down' });
        toggling(down.panel, 'open');

        // Downward: the first row in the markup is nearest the control.
        expect(delays(down.panel)).toEqual([60, 100, 140]);

        document.body.replaceChildren();
        const up = mount(700);
        popovers(document, { direction: 'up' });
        toggling(up.panel, 'open');

        // Upward: the last row is nearest the control, so it goes first.
        expect(delays(up.panel)).toEqual([140, 100, 60]);
    });

    it('starts a row beyond its place, on the side it is growing from', () => {
        const down = mount(60, 1);
        popovers(document, { direction: 'down' });
        toggling(down.panel, 'open');
        expect(firstFrame(down.panel)).toBe('translateY(-12px)');

        document.body.replaceChildren();
        const up = mount(700, 1);
        popovers(document, { direction: 'up' });
        toggling(up.panel, 'open');
        expect(firstFrame(up.panel)).toBe('translateY(12px)');
    });

    it('brings in its own rows and leaves a nested panel alone', () => {
        const { panel } = mount(60, 2);

        // A submenu inside the menu brings in its own rows when it opens.
        const inner = document.createElement('div');
        inner.setAttribute('popover', '');
        const buried = document.createElement('p');
        buried.dataset.rise = '';
        inner.append(buried);
        panel.append(inner);

        popovers(document);
        toggling(panel, 'open');

        expect(delays(panel)).toEqual([60, 100, -1]);
    });

    it('puts the menus away when a row is chosen, and says which', () => {
        const { panel } = mount(60, 2);
        const [first] = panel.querySelectorAll<HTMLElement>('[data-rise]');
        first.dataset.choose = '';

        popovers(document);
        toggling(panel, 'open');

        const heard: HTMLElement[] = [];
        document.addEventListener('popover-choose', (event) => {
            heard.push((event as CustomEvent<{ item: HTMLElement }>).detail.item);
        });
        const closed: HTMLElement[] = [];
        panel.hidePopover = () => closed.push(panel);

        first.dispatchEvent(new Event('click', { bubbles: true }));

        expect(heard).toEqual([first]);
        expect(closed).toEqual([panel]);
    });

    it('leaves a row alone that was not offered as a choice', () => {
        const { panel } = mount(60, 2);
        popovers(document);
        toggling(panel, 'open');

        let heard = 0;
        document.addEventListener('popover-choose', () => (heard += 1));
        panel
            .querySelector<HTMLElement>('[data-rise]')!
            .dispatchEvent(new Event('click', { bubbles: true }));

        // The row that opens a submenu has no data-choose.
        expect(heard).toBe(0);
    });

    it('closes the panel at the top of the chain, not the one the row is in', () => {
        const { panel } = mount(60, 1);

        // A submenu: its invoker is a row of the outer panel, and it lives inside it.
        const route = document.createElement('button');
        route.setAttribute('popovertarget', 'inner');
        const inner = document.createElement('div');
        inner.id = 'inner';
        inner.setAttribute('popover', '');
        const buried = document.createElement('button');
        buried.dataset.choose = '';
        inner.append(buried);
        panel.append(route, inner);

        popovers(document);
        toggling(panel, 'open');
        toggling(inner, 'open');

        const closed: string[] = [];
        panel.hidePopover = () => closed.push('outer');
        inner.hidePopover = () => closed.push('inner');

        buried.dispatchEvent(new Event('click', { bubbles: true }));

        // A choice in the submenu closes the outer panel, which takes the inner with it.
        expect(closed).toEqual(['outer']);
    });

    it('tells the control it is open, and that it is not', () => {
        const { anchor, panel } = mount(60);
        popovers(document);

        toggling(panel, 'open');
        expect(anchor.getAttribute('aria-expanded')).toBe('true');

        toggling(panel, 'closed');
        expect(anchor.getAttribute('aria-expanded')).toBe('false');
    });
});
