import { beforeEach, describe, expect, it } from 'vitest';
import { menus } from './menu.ts';

/** happy-dom has no popover support, so the `toggle` event is faked. */
function toggling(panel: HTMLElement, state: 'open' | 'closed') {
    panel.dispatchEvent(Object.assign(new Event('toggle'), { newState: state }));
}

function mount(labels = ['one', 'two', 'three'], { popover = true } = {}) {
    const panel = document.createElement('div');
    panel.id = 'panel';
    if (popover) panel.setAttribute('popover', '');
    panel.tabIndex = -1;
    panel.dataset.keys = '';

    const rows = labels.map((label) => {
        const row = document.createElement('button');
        row.dataset.choose = '';
        row.textContent = label;
        panel.append(row);
        return row;
    });

    document.body.append(panel);
    return { panel, rows };
}

function press(on: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    on.dispatchEvent(event);
    return event;
}

/** The text of the row under the cursor. */
function cursor(panel: HTMLElement): string | null {
    const row = panel.querySelector<HTMLElement>('[data-active="true"]');
    return row?.textContent ?? null;
}

beforeEach(() => {
    document.body.replaceChildren();
});

describe('menus', () => {
    it('says nothing until a key is pressed', () => {
        const { panel, rows } = mount();
        menus(document);

        expect(cursor(panel)).toBe(null);
        expect(rows.every((row) => row.dataset.active === 'false')).toBe(true);
    });

    it('gives every row an id to be named by', () => {
        const { rows } = mount();
        menus(document);

        expect(rows.map((row) => row.id)).toEqual(['panel-row-0', 'panel-row-1', 'panel-row-2']);
    });

    it('keeps an id the markup already gave a row', () => {
        const { rows } = mount();
        rows[1].id = 'chosen-by-hand';
        menus(document);

        expect(rows[1].id).toBe('chosen-by-hand');
    });

    it('starts at the first row going down and the last going up', () => {
        const { panel } = mount();
        menus(document);

        expect(press(panel, 'ArrowDown').defaultPrevented).toBe(true);
        expect(cursor(panel)).toBe('one');

        toggling(panel, 'open'); // opening puts the cursor away again
        press(panel, 'ArrowUp');
        expect(cursor(panel)).toBe('three');
    });

    it('wraps at both ends', () => {
        const { panel } = mount();
        menus(document);

        press(panel, 'ArrowUp');
        press(panel, 'ArrowUp');
        expect(cursor(panel)).toBe('two');

        press(panel, 'ArrowDown');
        press(panel, 'ArrowDown');
        expect(cursor(panel)).toBe('one');
    });

    it('jumps to the ends when there is no caret to move', () => {
        const { panel } = mount();
        menus(document);

        press(panel, 'End');
        expect(cursor(panel)).toBe('three');

        press(panel, 'Home');
        expect(cursor(panel)).toBe('one');
    });

    it('leaves Home and End to the caret when the controller is a field', () => {
        const { panel } = mount();
        const input = document.createElement('input');
        input.dataset.keys = '';
        panel.removeAttribute('data-keys');
        panel.prepend(input);
        menus(document);

        // Home and End belong to the caret when the controller is a text field.
        expect(press(input, 'End').defaultPrevented).toBe(false);
        expect(cursor(panel)).toBe(null);
    });

    it('names the cursor on the controller, and only the cursor', () => {
        const { panel, rows } = mount();
        menus(document);

        press(panel, 'ArrowDown');
        press(panel, 'ArrowDown');

        expect(panel.getAttribute('aria-activedescendant')).toBe(rows[1].id);
        expect(rows[0].dataset.active).toBe('false');
        expect(rows[1].dataset.active).toBe('true');
    });

    it('says which option is selected, where the rows are options', () => {
        const { panel, rows } = mount();
        for (const row of rows) row.setAttribute('role', 'option');
        menus(document);

        press(panel, 'ArrowDown');
        expect(rows[0].getAttribute('aria-selected')).toBe('true');

        press(panel, 'ArrowDown');
        expect(rows[0].getAttribute('aria-selected')).toBe('false');
        expect(rows[1].getAttribute('aria-selected')).toBe('true');
    });

    it('steps over a row a filter has taken away', () => {
        const { panel, rows } = mount();
        rows[1].hidden = true;
        menus(document);

        press(panel, 'ArrowDown');
        press(panel, 'ArrowDown');
        expect(cursor(panel)).toBe('three');
    });

    it('drops a cursor whose row has just gone', () => {
        const { panel, rows } = mount();
        menus(document);

        press(panel, 'ArrowDown');
        rows[0].hidden = true;
        panel.dispatchEvent(new Event('input', { bubbles: true }));

        expect(cursor(panel)).toBe(null);
        expect(panel.hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('presses the row the cursor is on', () => {
        const { panel, rows } = mount();
        menus(document);

        const pressed: string[] = [];
        for (const row of rows) row.addEventListener('click', () => pressed.push(row.textContent!));

        press(panel, 'ArrowDown');
        press(panel, 'ArrowDown');
        expect(press(panel, 'Enter').defaultPrevented).toBe(true);
        expect(pressed).toEqual(['two']);
    });

    it('does nothing on Enter with no cursor', () => {
        const { panel, rows } = mount();
        menus(document);

        let pressed = 0;
        for (const row of rows) row.addEventListener('click', () => (pressed += 1));

        expect(press(panel, 'Enter').defaultPrevented).toBe(false);
        expect(pressed).toBe(0);
    });

    it('lets every other key through', () => {
        const { panel } = mount();
        menus(document);

        // Escape and letters are not the module's.
        expect(press(panel, 'Escape').defaultPrevented).toBe(false);
        expect(press(panel, 'a').defaultPrevented).toBe(false);
    });

    it('moves the same cursor for the pointer', () => {
        const { panel, rows } = mount();
        menus(document);

        rows[1].dispatchEvent(new Event('pointerover', { bubbles: true }));
        expect(cursor(panel)).toBe('two');

        // The next arrow key continues from the pointer's row.
        press(panel, 'ArrowDown');
        expect(cursor(panel)).toBe('three');
    });

    it('puts the cursor away when the pointer leaves the panel', () => {
        const { panel, rows } = mount();
        menus(document);

        rows[1].dispatchEvent(new Event('pointerover', { bubbles: true }));
        panel.dispatchEvent(new Event('pointerleave'));

        expect(cursor(panel)).toBe(null);
    });

    it('focuses the controller when the panel opens, and starts it over', () => {
        const { panel } = mount();
        menus(document);

        press(panel, 'ArrowDown');
        toggling(panel, 'open');

        expect(document.activeElement).toBe(panel);
        expect(cursor(panel)).toBe(null);
    });

    it('walks a list that is not in a popover at all', () => {
        const { panel } = mount(['one', 'two', 'three'], { popover: false });
        menus(document);

        press(panel, 'ArrowDown');
        expect(cursor(panel)).toBe('one');
    });

    it('takes a different idea of what a row is', () => {
        const { panel, rows } = mount();
        rows[1].dataset.pick = '';
        menus(document, { row: '[data-pick]' });

        press(panel, 'ArrowDown');
        press(panel, 'ArrowDown');
        expect(cursor(panel)).toBe('two');
    });
});
