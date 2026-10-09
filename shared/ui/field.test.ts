import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fields } from './field.ts';

function mount(options: { clear?: boolean } = {}) {
    const field = document.createElement('div');
    field.className = 'field';

    const input = document.createElement('input');
    input.className = 'field__input';
    field.append(input);

    const clear = document.createElement('button');
    clear.className = 'field__clear';
    if (options.clear ?? true) field.append(clear);

    document.body.append(field);
    fields(document);

    /** Moves focus, with a `focusout` that says where it went. */
    const leaveTo = (to: Node | null) =>
        field.dispatchEvent(
            Object.assign(new Event('focusout', { bubbles: true }), { relatedTarget: to }),
        );

    const type = (value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    return { field, input, clear, leaveTo, type };
}

beforeEach(() => {
    document.body.replaceChildren();
    vi.useFakeTimers();
});

describe('fields', () => {
    it('says when the cursor is in the field', () => {
        const { field, leaveTo } = mount();

        field.dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(field.dataset.focused).toBe('true');

        leaveTo(null);
        expect(field.dataset.focused).toBe('false');
    });

    it('does not call reaching for the clear button a departure', () => {
        const { field, clear, leaveTo } = mount();

        field.dispatchEvent(new Event('focusin', { bubbles: true }));
        leaveTo(clear);

        // Focus moving to the clear button is not leaving the field.
        expect(field.dataset.focused).toBe('true');
    });

    it('waits for the typing to stop before offering to clear', () => {
        const { field, type } = mount();

        type('lo');
        vi.advanceTimersByTime(400);
        expect(field.dataset.clearable).toBeUndefined();

        vi.advanceTimersByTime(200);
        expect(field.dataset.clearable).toBe('true');
    });

    it('keeps the offer up once it is there', () => {
        const { field, type } = mount();

        type('lo');
        vi.advanceTimersByTime(600);
        type('lord');
        vi.advanceTimersByTime(10);

        // Once shown, the button stays.
        expect(field.dataset.clearable).toBe('true');
    });

    it('stops offering the moment there is nothing to clear', () => {
        const { field, type } = mount();

        type('lo');
        vi.advanceTimersByTime(600);
        type('');

        // An empty field withdraws the button at once.
        expect(field.dataset.clearable).toBe('false');
    });

    it('settles the typing when the field is left', () => {
        const { field, type, leaveTo } = mount();

        type('lo');
        leaveTo(null);

        expect(field.dataset.clearable).toBe('true');
    });

    it('empties the field and hands the cursor back', () => {
        const { field, input, clear, type } = mount();
        const focus = vi.spyOn(input, 'focus');

        type('lord');
        vi.advanceTimersByTime(600);
        clear.dispatchEvent(new Event('click', { bubbles: true }));

        expect(input.value).toBe('');
        expect(field.dataset.clearable).toBe('false');
        expect(focus).toHaveBeenCalled();
    });

    it('says so when its own button empties it', () => {
        const { input, clear, type } = mount();
        const heard: string[] = [];
        input.addEventListener('input', () => heard.push(input.value));

        type('lord');
        vi.advanceTimersByTime(600);
        clear.dispatchEvent(new Event('click', { bubbles: true }));

        // Setting `value` from script raises no event, so the module raises one.
        expect(heard).toEqual(['lord', '']);
    });

    it('never offers to clear a field with no button to do it', () => {
        const { field, type, leaveTo } = mount({ clear: false });

        type('lord');
        vi.advanceTimersByTime(600);
        leaveTo(null);

        // A field without a clear button only reports focus.
        expect(field.dataset.clearable).toBeUndefined();
        expect(field.dataset.focused).toBe('false');
    });
});
