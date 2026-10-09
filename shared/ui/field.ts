/**
 * A text field that reports its state in two attributes:
 *
 *     <div class="field" data-focused="false" data-clearable="false">
 *         <lord-icon … trigger="follow(data-focused)" target=".field"></lord-icon>
 *         <input class="field__input" />
 *         <button class="field__clear">…</button>
 *     </div>
 *
 * `data-focused` is whether focus is anywhere inside the field. `data-clearable` turns true
 * once the typing has paused with something in the input, and is what shows the clear
 * button. Icons and the stylesheet read the attributes; this module only writes them.
 *
 * The clear button is optional. Without one, `data-clearable` is never set.
 */

/** How long the typing has to pause before the field offers to clear. */
const SETTLED = 500;

export type FieldOptions = { settled?: number };

/** Wires every `.field` under `root`. Called once; nothing here needs taking apart. */
export function fields(root: ParentNode = document, options: FieldOptions = {}): void {
    for (const field of root.querySelectorAll<HTMLElement>('.field')) {
        wire(field, options.settled ?? SETTLED);
    }
}

function wire(field: HTMLElement, settled: number): void {
    const input = field.querySelector<HTMLInputElement>('.field__input');
    if (!input) return;

    const clear = field.querySelector<HTMLButtonElement>('.field__clear');
    let settling: ReturnType<typeof setTimeout> | undefined;

    const offer = (clearable: boolean) => {
        clearTimeout(settling);
        field.dataset.clearable = String(clearable);
    };

    // focusin/focusout bubble, so the field counts as focused with focus on the input or
    // on the clear button.
    field.addEventListener('focusin', () => (field.dataset.focused = 'true'));

    field.addEventListener('focusout', (event) => {
        // Moving focus to the clear button is not leaving the field.
        if (field.contains(event.relatedTarget as Node | null)) return;

        field.dataset.focused = 'false';
        if (clear && input.value) offer(true);
    });

    if (!clear) return;

    // #region settle
    // The clear button appears once the typing pauses, not on every keystroke.
    input.addEventListener('input', () => {
        clearTimeout(settling);

        if (!input.value) return offer(false);

        // Once shown it stays, so it is there when reached for.
        if (field.dataset.clearable === 'true') return;

        settling = setTimeout(() => offer(true), settled);
    });
    // #endregion

    clear.addEventListener('click', () => {
        input.value = '';
        offer(false);
        // Setting `value` from script raises no event; anything filtering on this field
        // listens for `input`.
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    });
}
